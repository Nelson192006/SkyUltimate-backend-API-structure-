// adminRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("./authMiddleware");
const { allowRoles } = require("./roleMiddleware");

const User = require("./User");
const Settings = require("./Settings");
const AdminRequest = require("./AdminRequest");
const PayoutLog = require("./PayoutLog");
const PayrollLog = require("./PayrollLog");

// ---------- USERS (lookup / suspend / delete) ----------

// GET /api/admin/users?query=nelson&role=Agent
router.get(
  "/users",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  async (req, res) => {
    const { query = "", role } = req.query;
    const q = {
      $or: [
        { name: new RegExp(query, "i") },
        { email: new RegExp(query, "i") },
      ],
    };
    if (role) q.role = role;

    const users = await User.find(q).select("-password").limit(100).sort({ createdAt: -1 });
    res.json(users);
  }
);

// PUT /api/admin/users/:id/suspend  { suspended: true|false }
router.put(
  "/users/:id/suspend",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  async (req, res) => {
    const { suspended } = req.body;
    if (typeof suspended !== "boolean") {
      return res.status(400).json({ message: "suspended must be boolean" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended: suspended },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: `User ${suspended ? "suspended" : "unsuspended"}`, user });
  }
);

// DELETE /api/admin/users/:id   (SuperAdmin only)
router.delete(
  "/users/:id",
  protect,
  allowRoles("SuperAdmin"),
  async (req, res) => {
    // cannot delete yourself safeguard (optional)
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  }
);

// ---------- SETTINGS (commission/bank/toggles) ----------

// GET /api/admin/settings
router.get(
  "/settings",
  protect,
  allowRoles("Admin", "SuperAdmin"),
  async (_req, res) => {
    const settings = await Settings.get();
    res.json(settings);
  }
);

// PUT /api/admin/settings  (SuperAdmin or Admin where appropriate)
// body: { adminRegistrationEnabled, commissionRateAgent, bankDetails }
router.put(
  "/settings",
  protect,
  allowRoles("SuperAdmin", "Admin"),
  async (req, res) => {
    const settings = await Settings.get();

    if (typeof req.body.adminRegistrationEnabled === "boolean") {
      // Only SuperAdmin flips this toggle
      if (req.user.role !== "SuperAdmin") {
        return res.status(403).json({ message: "Only SuperAdmin can toggle adminRegistrationEnabled" });
      }
      settings.adminRegistrationEnabled = req.body.adminRegistrationEnabled;
    }

    if (typeof req.body.commissionRateAgent === "number") {
      settings.commissionRateAgent = Math.min(0.95, Math.max(0.0, req.body.commissionRateAgent));
    }

    if (req.body.bankDetails && typeof req.body.bankDetails === "object") {
      const { bankName, accountNumber, accountHolderName } = req.body.bankDetails;
      settings.bankDetails = {
        bankName: bankName ?? settings.bankDetails.bankName,
        accountNumber: accountNumber ?? settings.bankDetails.accountNumber,
        accountHolderName: accountHolderName ?? settings.bankDetails.accountHolderName,
      };
    }

    await settings.save();
    res.json({ message: "Settings saved", settings });
  }
);

// ---------- ADMIN REQUESTS (Admin -> SuperAdmin) ----------

// POST /api/admin/requests   { targetUserId, action: "Suspend"|"Delete", reason }
router.post(
  "/requests",
  protect,
  allowRoles("Admin"),
  async (req, res) => {
    const { targetUserId, action, reason } = req.body || {};
    if (!targetUserId || !["Suspend", "Delete"].includes(action)) {
      return res.status(400).json({ message: "Invalid request payload" });
    }
    const target = await User.findById(targetUserId);
    if (!target) return res.status(404).json({ message: "Target user not found" });

    const reqDoc = await AdminRequest.create({
      requester: req.user.id,
      targetUser: targetUserId,
      action,
      reason: reason || "",
    });
    res.status(201).json({ message: "Request submitted", request: reqDoc });
  }
);

// GET /api/admin/requests  (SuperAdmin sees queue)
router.get(
  "/requests",
  protect,
  allowRoles("SuperAdmin"),
  async (_req, res) => {
    const list = await AdminRequest.find().populate("requester", "name email role").populate("targetUser", "name email role").sort({ createdAt: -1 });
    res.json(list);
  }
);

// PUT /api/admin/requests/:id/decision  { decision: "Approve"|"Deny" }
router.put(
  "/requests/:id/decision",
  protect,
  allowRoles("SuperAdmin"),
  async (req, res) => {
    const { decision } = req.body || {};
    if (!["Approve", "Deny"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be Approve or Deny" });
    }
    const doc = await AdminRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Request not found" });
    if (doc.status !== "Pending") return res.status(400).json({ message: "Already decided" });

    // perform action if approved
    if (decision === "Approve") {
      if (doc.action === "Suspend") {
        await User.findByIdAndUpdate(doc.targetUser, { isSuspended: true });
      } else if (doc.action === "Delete") {
        await User.findByIdAndDelete(doc.targetUser);
      }
      doc.status = "Approved";
    } else {
      doc.status = "Denied";
    }
    doc.decidedBy = req.user.id;
    doc.decidedAt = new Date();
    await doc.save();

    res.json({ message: `Request ${doc.status}`, request: doc });
  }
);

// ---------- PAYOUTS (SuperAdmin) ----------

// GET /api/admin/payouts  -> list agents with pendingPayout > 0
router.get(
  "/payouts",
  protect,
  allowRoles("SuperAdmin"),
  async (_req, res) => {
    const agents = await User.find({ role: "Agent", pendingPayout: { $gt: 0 } })
      .select("name email pendingPayout");
    res.json(agents);
  }
);

// POST /api/admin/payouts/process  { agentIds: [] }
router.post(
  "/payouts/process",
  protect,
  allowRoles("SuperAdmin"),
  async (req, res) => {
    const { agentIds } = req.body || {};
    if (!Array.isArray(agentIds) || agentIds.length === 0) {
      return res.status(400).json({ message: "agentIds must be a non-empty array" });
    }

    const agents = await User.find({ _id: { $in: agentIds }, role: "Agent" });
    if (agents.length === 0) return res.status(404).json({ message: "No matching agents" });

    const entries = [];
    let total = 0;
    for (const a of agents) {
      const amt = Math.max(0, a.pendingPayout || 0);
      if (amt > 0) {
        entries.push({ agent: a._id, amount: amt });
        total += amt;
        a.pendingPayout = 0;
        await a.save();
      }
    }

    if (entries.length === 0) return res.status(400).json({ message: "No payouts to process" });

    const log = await PayoutLog.create({
      processedBy: req.user.id,
      agents: entries,
      totalAmount: total,
    });

    res.json({ message: "Payouts processed", totalAmount: total, log });
  }
);

// ---------- PAYROLL (SuperAdmin) ----------

// POST /api/admin/payroll/process  { adminIds: [], amount, note }
router.post(
  "/payroll/process",
  protect,
  allowRoles("SuperAdmin"),
  async (req, res) => {
    const { adminIds, amount, note = "" } = req.body || {};
    if (!Array.isArray(adminIds) || adminIds.length === 0) {
      return res.status(400).json({ message: "adminIds must be a non-empty array" });
    }
    const amt = Number(amount);
    if (!amt || amt <= 0) return res.status(400).json({ message: "amount must be a positive number" });

    const admins = await User.find({ _id: { $in: adminIds }, role: { $in: ["Admin", "SuperAdmin"] } })
      .select("_id");
    if (admins.length === 0) return res.status(404).json({ message: "No matching admins" });

    const entries = admins.map(a => ({ admin: a._id, amount: amt }));
    const total = entries.reduce((s, e) => s + e.amount, 0);

    const log = await PayrollLog.create({
      processedBy: req.user.id,
      admins: entries,
      totalAmount: total,
      note,
    });

    res.json({ message: "Payroll processed", totalAmount: total, log });
  }
);

module.exports = router;

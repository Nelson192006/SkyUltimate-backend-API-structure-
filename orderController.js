// orderController.js
const Order = require("./orderModel");
const User = require("./user");
const Settings = require("./settings");

// simple price helper (replace with your real logic)
const computePrice = (items = []) => {
  if (!Array.isArray(items) || items.length === 0) return 1500; // base
  const sum = items.reduce(
    (acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)),
    0
  );
  return Math.max(1500, sum); // never below base
};

// POST /api/orders/calc-price
const calcPrice = async (req, res) => {
  try {
    const { items } = req.body;
    const settings = await Settings.get();
    const price = computePrice(items);
    return res.json({
      finalPrice: price,
      superAdminBankDetails: settings.bankDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/orders  (Customer)
const createOrder = async (req, res) => {
  try {
    const { items, pickupAddress, deliveryAddress, paymentMethod } = req.body;
    const finalPrice = computePrice(items);

    const order = await Order.create({
      customer: req.user.id,
      items,
      pickupAddress,
      deliveryAddress,
      paymentMethod: paymentMethod || "Bank Transfer",
      status: "PendingPayment",
      finalPrice,
    });

    const settings = await Settings.get();
    return res.status(201).json({
      message: "Order created. Awaiting payment confirmation.",
      order,
      superAdminBankDetails: settings.bankDetails,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/orders/:id/confirm-payment  (Admin or SuperAdmin)
const confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = "PaymentConfirmed";
    await order.save();
    return res.json({ message: "Payment confirmed", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/orders/:id/claim   (Agent)
const claimOrder = async (req, res) => {
  try {
    const updated = await Order.findOneAndUpdate(
      { _id: req.params.id, agent: { $exists: false }, status: "PaymentConfirmed" },
      { agent: req.user.id, status: "EnRouteToPickup" },
      { new: true }
    );
    if (!updated) return res.status(409).json({ message: "Job already taken or not ready" });
    return res.json({ message: "Order claimed", order: updated });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/orders/:id/pickup   (Agent)
const confirmPickedUp = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, agent: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found for this agent" });
    if (order.status !== "EnRouteToPickup") return res.status(400).json({ message: "Invalid state" });
    order.status = "EnRouteToDelivery";
    await order.save();
    return res.json({ message: "Pickup confirmed", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/orders/:id/deliver  (Agent)
const confirmDelivered = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, agent: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found for this agent" });
    if (order.status !== "EnRouteToDelivery") return res.status(400).json({ message: "Invalid state" });

    order.status = "Completed";
    await order.save();

    const settings = await Settings.get();
    const agent = await User.findById(req.user.id);
    if (agent) {
      agent.pendingPayout += Math.round(order.finalPrice * settings.commissionRateAgent);
      await agent.save();
    }

    return res.json({ message: "Order delivered", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST /api/orders/:id/rate   (Customer)
const rateAgent = async (req, res) => {
  try {
    const { rating = 5, comment = "" } = req.body;
    const order = await Order.findOne({ _id: req.params.id, customer: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found for this customer" });
    if (order.status !== "Completed") return res.status(400).json({ message: "Order not completed" });
    if (order.agentRating) return res.status(400).json({ message: "Already rated" });

    order.agentRating = rating;
    order.agentComment = comment;
    await order.save();

    if (order.agent) {
      const agent = await User.findById(order.agent);
      if (agent) {
        const total = agent.ratingAverage * agent.ratingCount + Number(rating);
        agent.ratingCount += 1;
        agent.ratingAverage = total / agent.ratingCount;
        await agent.save();
      }
    }

    return res.json({ message: "Thanks for rating!", order });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT /api/orders/:id/update-status  (Admin or SuperAdmin)
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  calcPrice,
  createOrder,
  confirmPayment,
  claimOrder,
  confirmPickedUp,
  confirmDelivered,
  rateAgent,
  updateStatus,
};

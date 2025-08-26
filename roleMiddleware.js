// roleMiddleware.js
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden for your role" });
    }
    next();
  };
};

module.exports = { allowRoles };

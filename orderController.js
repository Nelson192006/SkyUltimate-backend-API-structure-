// src/controllers/orderController.js
const Order = require("../models/Order");

// Create new order
exports.createOrder = async (req, res) => {
  try {
      const { items, deliveryAddress, paymentMethod } = req.body;

          const newOrder = new Order({
                user: req.user.id, // comes from authentication middleware
                      items,
                            deliveryAddress,
                                  paymentMethod,
                                        status: "Pending",
                                            });

                                                await newOrder.save();

                                                    res.status(201).json({ message: "Order created successfully", order: newOrder });
                                                      } catch (error) {
                                                          res.status(500).json({ message: "Server error", error: error.message });
                                                            }
                                                            };

                                                            // Get all orders for logged-in user
                                                            exports.getUserOrders = async (req, res) => {
                                                              try {
                                                                  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
                                                                      res.status(200).json(orders);
                                                                        } catch (error) {
                                                                            res.status(500).json({ message: "Server error", error: error.message });
                                                                              }
                                                                              };

                                                                              // Update order status (for admins or system)
                                                                              exports.updateOrderStatus = async (req, res) => {
                                                                                try {
                                                                                    const { status } = req.body;

                                                                                        const updatedOrder = await Order.findByIdAndUpdate(
                                                                                              req.params.id,
                                                                                                    { status },
                                                                                                          { new: true }
                                                                                                              );

                                                                                                                  if (!updatedOrder) {
                                                                                                                        return res.status(404).json({ message: "Order not found" });
                                                                                                                            }

                                                                                                                                res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
                                                                                                                                  } catch (error) {
                                                                                                                                      res.status(500).json({ message: "Server error", error: error.message });
                                                                                                                                        }
                                                                                                                                        };
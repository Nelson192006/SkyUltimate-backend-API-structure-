const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // match controller
    items: [
      {
        name: String,
        quantity: Number,
        price: Number,
      },
    ],
    deliveryAddress: { type: String, required: true },
    paymentMethod: { type: String, enum: ["Cash", "Card", "Bank Transfer"], required: true },
    status: {
      type: String,
      enum: ["Pending", "Awaiting Payment", "In Transit", "Delivered", "Paid"],
      default: "Pending",
    },
    price: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

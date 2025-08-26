const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    itemType: { type: String, required: true },
    weight: { type: Number, required: true },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    status: { type: String, enum: ['PendingPayment', 'PaymentConfirmed', 'PickedUp', 'Delivered', 'Completed'], default: 'PendingPayment' },
    pricePaid: { type: Number, required: true }, // Full amount paid by customer
    agentRevenue: { type: Number, default: 0 }, // Computed based on commissionRate
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

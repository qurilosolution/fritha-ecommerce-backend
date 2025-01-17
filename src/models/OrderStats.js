const mongoose = require('mongoose');

const orderStatsSchema = new mongoose.Schema({
    period: { type: String, required: true, enum: ['TODAY', 'YESTERDAY', 'THIS_MONTH', 'THIS_YEAR'] },
    cancelledOrder: { type: Number, default: 0 },
    shippedOrder: { type: Number, default: 0 },
    paidOrder: { type: Number, default: 0 },
    unpaidOrder: { type: Number, default: 0 },
    completedOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('OrderStats', orderStatsSchema);
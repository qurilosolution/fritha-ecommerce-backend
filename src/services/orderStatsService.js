const OrderStats = require('../models/OrderStats');

const getOrderStats = async (period) => {
    const stats = await OrderStats.findOne({ period });
    return stats || {
        cancelledOrder: 0,
        shippedOrder: 0,
        paidOrder: 0,
        unpaidOrder: 0,
        completedOrder: 0,
    };
};

module.exports = {
    getOrderStats,
};

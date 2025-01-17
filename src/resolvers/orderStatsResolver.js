
const orderStatsService = require('../services/orderStatsService');

const resolvers = {
    Query: {
        getOrderStats: async (_, { period }) => {
            return await orderStatsService.getOrderStats(period);
        },
    },
};

module.exports = resolvers;

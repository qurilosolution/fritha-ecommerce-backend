const { gql } = require('apollo-server-express');

const orderStat = gql`

type OrderStats {
    cancelledOrder: Int!
    shippedOrder: Int!
    paidOrder: Int!
    unpaidOrder: Int!
    completedOrder: Int!
}

enum TimePeriod {
    TODAY
    YESTERDAY
    THIS_MONTH
    THIS_YEAR
}

type Query {
    getOrderStats(period: TimePeriod = THIS_MONTH): OrderStats!
}

`;    
module.exports = orderStat;
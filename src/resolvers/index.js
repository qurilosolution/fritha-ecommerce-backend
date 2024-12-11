const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolvers = require('./productResolver');
const reviewResolver=require("./reviewResolver")
const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolvers ,reviewResolver]);

module.exports = resolvers;

const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver= require('./productResolver');
const reviewResolver=require("./reviewResolver")
const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolver ,reviewResolver]);

module.exports = resolvers;

const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolvers = require('./productResolver');
const authResolvers=require('./authresolver')
const reviewResolver=require("./reviewResolver")


const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolvers ,reviewResolver,authResolvers]);

module.exports = resolvers;

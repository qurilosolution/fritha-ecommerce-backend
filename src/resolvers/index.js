const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authresolver')
const reviewResolver=require("./reviewResolver")


const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolver ,reviewResolver,authResolver]);


module.exports = resolvers;

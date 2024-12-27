const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authResolver')
const reviewResolver=require("./reviewResolver")
const orderResolver = require("./orderResolver")
const variantResolver = require("./variantResolver")


const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolver ,reviewResolver,authResolver,orderResolver , variantResolver]);


module.exports = resolvers;

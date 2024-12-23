const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authResolver')
const reviewResolver=require("./reviewResolver")
const wishlistResolver=require("./wishlistResolver")


const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolver ,reviewResolver,authResolver ,wishlistResolver]);


module.exports = resolvers;

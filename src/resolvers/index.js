
const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authResolver')
const reviewResolver=require("./reviewResolver")
const variantResolver = require("./variantResolver")
const wishlistResolver = require("./wishlistResolver");
const paymentResolver = require("./paymentResolver");
const cartResolver=require("./cartResolver")

const addressResolver=require("./addressResolver")
const orderResolver=require("./orderResolver")
const resolvers = mergeResolvers([categoryResolver,addressResolver, subcategoryResolver, productResolver ,reviewResolver,variantResolver,authResolver,orderResolver,wishlistResolver,paymentResolver,cartResolver ]);




module.exports = resolvers;

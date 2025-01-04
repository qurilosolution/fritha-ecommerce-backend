
const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authResolver')
const reviewResolver=require("./reviewResolver")
const orderResolver = require("./orderResolver")
const variantResolver = require("./variantResolver")



const wishlistResolver = require("./wishlistResolver");
const paymentResolver = require("./paymentResolver");

const cartResolver=require("./cartResolver")



const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolver ,reviewResolver,variantResolver,authResolver,orderResolver,wishlistResolver,paymentResolver,cartResolver ]);




module.exports = resolvers;

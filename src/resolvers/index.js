
const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authresolver');
const reviewResolver=require("./reviewResolver")

const variantResolver = require("./variantResolver")
const wishlistResolver = require("./wishlistResolver");
const paymentResolver = require("./paymentResolver");
const cartResolver=require("./cartResolver")
const couponResolver = require("./couponResolver");
const addressResolver=require("./addressResolver")
const orderResolver=require("./orderResolver")
const bannerResolver=require("./bannerResolver")

const resolvers = mergeResolvers([categoryResolver,addressResolver, subcategoryResolver, productResolver ,reviewResolver,variantResolver,authResolver,orderResolver,wishlistResolver,paymentResolver,cartResolver,couponResolver,bannerResolver ]);




module.exports = resolvers;

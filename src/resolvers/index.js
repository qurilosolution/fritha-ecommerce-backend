
const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authResolver')
const reviewResolver=require("./reviewResolver")
const orderResolver = require("./orderResolver")
const wishlistResolver = require("./wishlistResolver");
const paymentResolver = require("./paymentResolver");


const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolver ,reviewResolver,authResolver,orderResolver,wishlistResolver,paymentResolver ]);

const resolvers = mergeResolvers([
  categoryResolver,
  subcategoryResolver,
  productResolver,
  reviewResolver,
  authResolver,
  orderResolver,
  wishlistResolver,
  paymentResolver
]);

module.exports = resolvers;

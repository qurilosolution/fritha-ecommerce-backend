const { mergeResolvers } = require("@graphql-tools/merge");
const categoryResolver = require("./categoryResolver");
const subcategoryResolver = require("./subcategoryResolver");
const productResolver = require("./productResolver");
const authResolver = require("./authresolver");
const reviewResolver = require("./reviewResolver");
const variantResolver = require("./variantResolver");
const wishlistResolver = require("./wishlistResolver");
const paymentResolver = require("./paymentResolver");
const orderResolver = require("./orderResolver");
const cartResolver = require("./cartResolver");
const addressResolver = require("./addressResolver");

const resolvers = mergeResolvers([
  categoryResolver,
  addressResolver,
  subcategoryResolver,
  productResolver,
  reviewResolver,
  orderResolver,
  variantResolver,
  authResolver,
  wishlistResolver,
  paymentResolver,
  cartResolver,
]);

module.exports = resolvers;

const { mergeResolvers } = require("@graphql-tools/merge");
const categoryResolver = require("./categoryResolver");
const subcategoryResolver = require("./subcategoryResolver");
const productResolver = require("./productResolver");
const authResolver = require("./authresolver");
const reviewResolver = require("./reviewResolver");
const wishlistResolver = require("./wishlistResolver");
const paymentResolver = require("./paymentResolver");

const resolvers = mergeResolvers([
  categoryResolver,
  subcategoryResolver,
  productResolver,
  reviewResolver,
  authResolver,
  wishlistResolver,
  paymentResolver
]);

module.exports = resolvers;

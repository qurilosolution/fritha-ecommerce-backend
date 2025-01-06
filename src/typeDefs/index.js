const { gql } = require('apollo-server-express');
const baseType = require('./baseType');
const categoryType = require('./categoryType');
const subcategoryType = require('./subcategoryType');
const productType = require('./productType');
const variantType = require('./variantType');
const authType = require("./authType")
const reviewType = require("./reviewType");
const wishlistType = require("./wishlistType")
const paymentType = require("./paymentType")



const typeDefs = gql`
  ${baseType}
  ${categoryType}
  ${subcategoryType}
  ${productType}
  ${variantType}
  ${reviewType}

  ${authType}
  ${wishlistType}
  ${paymentType}
`;

module.exports = typeDefs;

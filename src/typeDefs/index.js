const { gql } = require('apollo-server-express');
const baseType = require('./baseType');
const categoryType = require('./categoryType');
const subcategoryType = require('./subcategoryType');
const productType = require('./productType');
const variantType = require('./variantType');
const authType = require("./authType")
const reviewType = require("./reviewType");
const wishlistType = require("./wishlistType")
const orderType = require("./orderType")
const bannerType = require("./bannerType");

const cartType=require("./cartType");
const addressType = require('./addressType');

const typeDefs = gql`
  ${baseType}
  ${categoryType}
  ${subcategoryType}
  ${productType}
  ${variantType}
  ${reviewType}
  ${bannerType}
  ${authType}
  ${wishlistType}
  ${orderType}
  ${cartType}
  ${addressType}
`;

module.exports = typeDefs;

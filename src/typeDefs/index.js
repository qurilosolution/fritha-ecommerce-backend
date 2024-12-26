const { gql } = require('apollo-server-express');
const baseType = require('./baseType');
const categoryType = require('./categoryType');
const subcategoryType = require('./subcategoryType');
const productType = require('./productType');
const authType = require("./authType")
const reviewType = require("./reviewType");
const orderType = require("./orderType")


const typeDefs = gql`
  ${baseType}
  ${categoryType}
  ${subcategoryType}
  ${productType}
  ${reviewType}
  ${orderType}
  ${authType}
`;

module.exports = typeDefs;

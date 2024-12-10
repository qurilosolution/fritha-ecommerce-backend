const { gql } = require('apollo-server-express');

const baseType = gql`
  type Query
  type Mutation
`;

module.exports = baseType;

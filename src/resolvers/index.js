const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolvers = require('./productResolver');

const resolvers = mergeResolvers([categoryResolver, subcategoryResolver, productResolvers]);

module.exports = resolvers;

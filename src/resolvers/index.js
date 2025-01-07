
const { mergeResolvers } = require('@graphql-tools/merge');
const categoryResolver = require('./categoryResolver');
const subcategoryResolver = require('./subcategoryResolver');
const productResolver = require('./productResolver');
const authResolver=require('./authresolver')
const reviewResolver=require("./reviewResolver")

const variantResolver = require("./variantResolver")



const wishlistResolver = require("./wishlistResolver");

const orderResolver = require("./orderResolver");

const cartResolver=require("./cartResolver")

const addressResolver=require("./addressResolver")

const resolvers = mergeResolvers([categoryResolver,addressResolver, subcategoryResolver, productResolver ,reviewResolver,variantResolver,authResolver,orderResolver,wishlistResolver,cartResolver ]);




module.exports = resolvers;

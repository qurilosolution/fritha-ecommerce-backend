const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cookieParser = require('cookie-parser');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const mongoose = require('mongoose');
const cron = require('node-cron');
const moment = require('moment');
const { graphqlUploadExpress } = require('graphql-upload');
const typeDefs = require('./src/typeDefs');
const { typeDefss } = require('./src/graphqlschema/authgraphqlschema');
const resolvers = require('./src/resolvers');
const { authResolvers } = require('./src/resolvers/authresolver');
const connectDB = require('./src/config/db');
const { updateBestSellers } = require('./src/services/productService');
const Product = require('./src/models/Product');
const router = require('./src/router/router');

const app = express();
app.use(express.json());
app.use(cookieParser());
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Cron jobs
cron.schedule('0 0 * * *', async () => {
  console.log('Updating best seller statuses...');
  await updateBestSellers();
});

cron.schedule('* * * * *', async () => {
  try {
    const now = moment().toDate();

    // Start sale for products
    const productsToStartSale = await Product.find({ saleStartDate: { $lte: now }, isOnSale: false });
    for (const product of productsToStartSale) {
      product.isOnSale = true;
      await product.save();
      console.log(`Sale started for product: ${product.name}`);
    }

    // End sale for products
    const productsToEndSale = await Product.find({ saleEndDate: { $lte: now }, isOnSale: true });
    for (const product of productsToEndSale) {
      product.isOnSale = false;
      await product.save();
      console.log(`Sale ended for product: ${product.name}`);
    }
  } catch (error) {
    console.error('Error managing product sales:', error);
  }
});

// Merge typeDefs and resolvers
const mergedTypeDefs = mergeTypeDefs([typeDefs, typeDefss]);
const mergedResolvers = mergeResolvers([resolvers, authResolvers]);

// Apollo Server
const server = new ApolloServer({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers,
  uploads: false,
  context: ({ req, res }) => ({ req, res }) // Ensure `req` and `res` are available in the resolver context
});

const startServer = async () => {
  await server.start();
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
  });
};

// Start server
startServer();

// Routes
app.use('/auth', router);








 
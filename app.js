// const { ApolloServer } = require('apollo-server-express');
// const express = require('express');
// const cookieParser = require('cookie-parser');
// const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
// const mongoose = require('mongoose');
// const cron = require('node-cron');
// const moment = require('moment');
// const { graphqlUploadExpress } = require('graphql-upload');
// const typeDefs = require('./src/typeDefs');
// const { typeDefss } = require('./src/graphqlschema/authgraphqlschema');
// const resolvers = require('./src/resolvers');
// const { authResolvers } = require('./src/resolvers/authresolver');
// const connectDB = require('./src/config/db');
// const { updateBestSellers } = require('./src/services/productService');
// const Product = require('./src/models/Product');

// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// require('dotenv').config();

// // Connect to MongoDB
// connectDB();

// // Cron jobs
// cron.schedule('0 0 * * *', async () => {
//   console.log('Updating best seller statuses...');
//   await updateBestSellers();
// });

// cron.schedule('* * * * *', async () => {
//   try {
//     const now = moment().toDate();

//     // Start sale for products
//     const productsToStartSale = await Product.find({ saleStartDate: { $lte: now }, isOnSale: false });
//     for (const product of productsToStartSale) {
//       product.isOnSale = true;
//       await product.save();
//       console.log(`Sale started for product: ${product.name}`);
//     }

//     // End sale for products
//     const productsToEndSale = await Product.find({ saleEndDate: { $lte: now }, isOnSale: true });
//     for (const product of productsToEndSale) {
//       product.isOnSale = false;
//       await product.save();
//       console.log(`Sale ended for product: ${product.name}`);
//     }
//   } catch (error) {
//     console.error('Error managing product sales:', error);
//   }
// });

// const server = new ApolloServer({ typeDefs, resolvers ,uploads:true});
// const startServer = async () => {
//   await server.start();
//   app.use(graphqlUploadExpress());
//   server.applyMiddleware({ app });

//   app.listen(4000, () => {
//     console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
//   });
// };

// // Start server
// startServer();

 
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

require('dotenv').config();

// Initialize Express
const app = express();

// Middleware Setup
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Cron Jobs
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

// Apollo Server Setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: true,
  context: ({ req, res }) => ({ req, res }), // Pass req and res to resolvers
});

const startServer = async () => {
  await server.start();

  // Apply Middleware
  app.use(graphqlUploadExpress());
  server.applyMiddleware({ app });

  // Start the Express Server
  app.listen(4000, () => {
    console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
  });
};

// Start Server
startServer();








 
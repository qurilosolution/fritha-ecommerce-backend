const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const typeDefs = require('./src/typeDefs');
const resolvers = require('./src/resolvers');
const connectDB = require('./src/config/db');
const cron = require('node-cron');
const moment = require('moment'); // Optional, but useful for date comparisons
const { updateBestSellers } = require('./src/services/productService');
const Product = require('./src/models/Product');
const { graphqlUploadExpress } = require('graphql-upload');


require('dotenv').config(); 
 
const app = express();

connectDB();

// cron job to update best seller
cron.schedule('0 0 * * *', async () => {
  console.log('Updating best seller statuses...');
  await updateBestSellers();
});

// Cron job to check sales
cron.schedule('* * * * * *', async () => {
  try {
   
    // Check for products that need to go on sale today
    const productsToStartSale = await Product.find({
      
      saleStartDate: { $lte: moment().toDate() },
      isOnSale: false,
      
    });
    
    // Set them as on sale
    productsToStartSale.forEach(async (product) => {
      product.isOnSale = true;
      
      await product.save();
      console.log(`Sale started for product: ${product.name}`);
    });

    // Check for products that need to end sale today
    const productsToEndSale = await Product.find({
      saleEndDate: { $lte: moment().toDate() },
      isOnSale: true,
    });

    // End their sale
    productsToEndSale.forEach(async (product) => {
      product.isOnSale = false;
      await product.save();
      console.log(`Sale ended for product: ${product.name}`);
    });
  } catch (error) {
    console.error('Error managing product sales:', error);
  }
});


const server = new ApolloServer({ typeDefs, resolvers ,uploads:true});
const startServer = async () => {
 
   
    await server.start();
  
    app.use(graphqlUploadExpress());
    server.applyMiddleware({ app });
  
    
    app.listen(4000, () => {
      console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
    });
  };
  
 
  startServer();
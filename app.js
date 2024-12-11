// const express = require('express');
// const cookieParser = require('cookie-parser');
// const { ApolloServer } = require('apollo-server-express');
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
// const router = require('./src/router/router');

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

// // Merge typeDefs and resolvers
// const mergedTypeDefs = mergeTypeDefs([typeDefs, typeDefss]);
// const mergedResolvers = mergeResolvers([resolvers, authResolvers]);

// // Apollo Server
// const server = new ApolloServer({
//   typeDefs: mergedTypeDefs,
//   resolvers: mergedResolvers,
//   uploads: false,
// });

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

// // Routes
// app.use('/signup', router);

 

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









// require('dotenv').config();
// const express = require('express');
// const { ApolloServer } = require('apollo-server-express');
// const mongoose = require('mongoose');
// const cookieParser = require('cookie-parser');
// const moment = require('moment');
// const cron = require('node-cron');
// const { graphqlUploadExpress } = require('graphql-upload');

// const connectDB = require('./src/config/db');
// const typeDefs = require('./src/typeDefs');
// const typeDefss = require('./src/graphqlschema/authgraphqlschema');
// const resolvers = require('./src/resolvers');
// const resolverss = require('./src/resolvers/authresolver');
// const { AuthMiddleware } = require('./src/middleware/authmiddleware');
// const { AuthModel } = require('./src/models/authmodel');
// const router = require('./src/router/router');
// const { updateBestSellers } = require('./src/services/productService');
// const Product = require('./src/models/Product');

// const app = express();
// connectDB();

// app.use(express.json());
// app.use(cookieParser());
// app.use('/signup', router); // Attach the signup route

// // Apply AuthMiddleware globally if needed (uncomment if you want this globally)
// // app.use(AuthMiddleware); // This will ensure authentication for all routes

// // Apollo Server setup
// const server = new ApolloServer({
//   typeDefs,
//   typeDefss,
//   resolvers,
//   resolverss,
//   uploads: false,
//   context: ({ req, res }) => ({
//     req, 
//     res, 
//     AuthModel, // Passing the AuthModel to resolvers in context
//     moment,    // Passing moment.js if needed in resolvers
//     Product,   // Passing the Product model if needed in resolvers
//   }),
// });

// // Cron job to update best seller statuses at midnight every day
// cron.schedule('0 0 * * *', async () => {
//   console.log('Updating best seller statuses...');
//   await updateBestSellers();
// });

// // Cron job to check product sales every second (useful for testing; adjust timing for production)
// cron.schedule('* * * * * *', async () => {
//   try {
//     const productsToStartSale = await Product.find({
//       saleStartDate: { $lte: moment().toDate() },
//       isOnSale: false,
//     });

//     productsToStartSale.forEach(async (product) => {
//       product.isOnSale = true;
//       await product.save();
//       console.log(`Sale started for product: ${product.name}`);
//     });

//     const productsToEndSale = await Product.find({
//       saleEndDate: { $lte: moment().toDate() },
//       isOnSale: true,
//     });

//     productsToEndSale.forEach(async (product) => {
//       product.isOnSale = false;
//       await product.save();
//       console.log(`Sale ended for product: ${product.name}`);
//     });
//   } catch (error) {
//     console.error('Error managing product sales:', error);
//   }
// });

// // Start the Apollo server and Express app
// const startServer = async () => {
//   await server.start();
//   app.use(graphqlUploadExpress()); // Middleware for file uploads
//   server.applyMiddleware({ app, path: '/graphql' });

//   app.listen(4000, () => {
//     console.log(`Server running at http://localhost:4000${server.graphqlPath}`);
//   });
// };

// startServer();

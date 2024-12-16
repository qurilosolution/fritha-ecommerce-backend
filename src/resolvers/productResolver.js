const productService = require('../services/productService');
const { GraphQLUpload } = require('graphql-upload');


const productResolvers = {
  Upload: GraphQLUpload, // Declare the Upload scalar

  Query: {
    // Fetch all products
    getProducts: async () =>   {
      try {
        return await productService.getProducts();
      } catch (error) {
        throw new Error(`Error fetching products: ${error.message}`);
      }
    },

    // Fetch a single product by ID
    getProductById: async (_, { id }) => {
      try {
        return await productService.getProductById(id);
      } catch (error) {
        throw new Error(`Error fetching product by ID: ${error.message}`);
      }
    },

    // Fetch best sellers
    getBestSellers: async () => {
      try {
        return await productService.getBestSellers();
      } catch (error) {
        throw new Error(`Error fetching best sellers: ${error.message}`);
      }
    },
  },

  Mutation: {
    // Create a new product
    createProduct: async (_, args) => {
      console.log("Received args in createProduct:", args);
    
      try {
        if (!args || !args.input) {
          throw new Error("Input is required for creating a product.");
        }
    
        const { input } = args;  // Destructure input from args after confirming args exists
    
        console.log("Received input for product:", input);
        console.log(input.userId,"fojdshkjdsnhfkjds")
    
        // Check if all required fields in the input are present (optional, based on your validation)
        if (!input.name || !input.category) {
          throw new Error("Product name and category are required.");
        }
    
        // Call the service to create the product
        const product = await productService.createProduct(input);
        return product;
      } catch (error) {
        console.error("Error creating product:", error);
        throw new Error(`Controller error while creating product: ${error.message}`);
      }
    },
    
    // createProduct: async (_, { input }) => {
    //   try {
    //     // Validate and include userId
    //     if (!input.userId) {
    //       throw new Error("UserId is required.");
    //     }

    //     return await productService.createProduct(input);
    //   } catch (error) {
    //     console.error("Error creating product:", error);
    //     throw new Error(`Controller error while creating product: ${error.message}`);
    //   }
    // },
    

    // Update a product, including image update
    updateProduct: async (_, { id, input }) => {
      try {
        // Ensure userId is passed in update
        if (!input.userId) {
          throw new Error("UserId is required for updating a product.");
        }

        return await productService.updateProduct(id, input);
      } catch (error) {
        throw new Error(`Error updating product: ${error.message}`);
      }
    },

    // Delete a product
    deleteProduct: async (_, { id }) => {
      try {
        return await productService.deleteProduct(id);
      } catch (error) {
        throw new Error(`Error deleting product: ${error.message}`);
      }
    },

    // Update best seller statuses
    refreshBestSellers: async () => {
      try {
        await productService.updateBestSellers();
        return { success: true, message: 'Best seller statuses updated successfully' };
      } catch (error) {
        throw new Error(`Error updating best sellers: ${error.message}`);
      }
    },
  },
};

module.exports = productResolvers;

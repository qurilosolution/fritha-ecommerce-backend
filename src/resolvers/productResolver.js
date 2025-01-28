const productService = require("../services/productService");
const { GraphQLUpload } = require("graphql-upload");
const uploadImageToCloudinary = require("../utils/fileUpload");
const productResolvers = {
  Upload: GraphQLUpload, // Declare the Upload scalar
  Query: {
    getProducts: async (_, { page, search, sort }) => {
      try {
        console.log(`Page received in resolver: ${page}, Search: ${search}, Sort: ${sort}`); // Debug log
        return await productService.getProducts({ page, search, sort });
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
    getProductByslugName: async (_, { slugName }) => {
      try {
        return await productService.getProductByslugName(slugName);
      } catch (error) {
        throw new Error(`Error fetching product by name: ${error.message}`);
      }
    },

    // Fetch best sellers
    getBestSellers: async (_, { categoryId }) => {
      try {
        return await productService.getBestSellers(categoryId);
      } catch (error) {
        throw new Error(`Error fetching best sellers: ${error.message}`);
      }
    },
    async getProductCount() {
      try {
        const count = await productService.getProductCountService(); // Call the service
        return count;
      } catch (error) {
        throw new Error("Error in getProductCount resolver: " + error.message);
      }
    },
  },
  Mutation: {
  
  
  createProduct: async (_, { input }, context) => {
    try {
      // Authentication and role checks
      if (!context.user) throw new Error("You must be logged in to create a product.");
      if (!context.user.role.includes("admin")) throw new Error("You must be an admin to create a product.");

      // Log input for debugging
      console.log("Received input for product:", input);

      // Create the product
      const product = await productService.createProduct(input);
      console.log("Product successfully created:", product);
      return product;
    } catch (error) {
      console.error("Error creating product:", error.message);
      throw new Error(`Controller error while creating product: ${error.message}`);
    }
  },
  
  updateProduct: async (_, { id, input}, context) => {
    if (!context.user) throw new Error("You must be logged in to update a product.");
    if (!context.user.role.includes("admin")) throw new Error("Admin access required.");
  
    try {

     // Pass input and publicIds directly to the updateProduct service
      const updatedProduct = await productService.updateProduct(id, {
        ...input
      });
  
      return updatedProduct;
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error(`Error updating product: ${error.message}`);
    }
  },

  async deleteImageByIndex(_, { id, index } ,context) {
    try {
      if (!context.user) {
        throw new Error("You must be logged in to delete an image.");
      }
  
      // Authorization
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to delete an image.");
      }
      const updatedProduct = await productService.deleteImageByIndex( id, index);
      return updatedProduct;
    } catch (error) {
      console.error("Error in resolver:", error.message);
      throw new Error(error.message);
    }
  },
  
   // Delete a product
   deleteProduct: async (_, { id }, context) => {
      console.log(context.user);
      if (!context.user)
        throw Error("You must be logged in to create a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
      try {
        // Call the service to delete the product
        const isDeleted = await productService.deleteProduct(id);
        if (!isDeleted) {
          // Return a failure response if the product was not found or deleted
          return {
            success: false,
            message: "Product not found or could not be deleted",
          };
        }
        // Return a success response if the product was deleted
        return {
          success: true,
          message: "Product deleted successfully",
        };
      } catch (error) {
        // Return a failure response in case of an error
        return {
          success: false,
          message: `Error deleting product: ${error.message}`,
        };
      }
    },

    // Update best seller statuses
    refreshBestSellers: async () => {
      try {
        await productService.updateBestSellers();
        return {
          success: true,
          message: "Best seller statuses updated successfully",
        };
      } catch (error) {
        throw new Error(`Error updating best sellers: ${error.message}`);
      }
    },
  },
};
module.exports = productResolvers;

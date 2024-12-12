const productService = require('../services/productService');
const { GraphQLUpload } = require('graphql-upload');


const productResolvers = {
  Upload: GraphQLUpload, // Declare the Upload scalar

  Query: {
    // Fetch all products
    getProducts: async () => {
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
    
        const { input, imageUrl } = args;
        console.log("Received input for product:", input);
    
        // Resolve imageUrl if provided
        let resolvedImageUrl = null;
        if (imageUrl) {
          resolvedImageUrl = await imageUrl;
          console.log("Resolved imageUrl:", resolvedImageUrl);
        }
    
        // Prepare product data
        const productData = {
          ...input,
          imageUrl: resolvedImageUrl ? [resolvedImageUrl] : [],
        };
    
        
     
        // Create the product
        const product = await productService.createProduct(productData);
        console.log("Product successfully created:", product);
        return product;
      } catch (error) {
        console.error("Error creating product:", error.message);
        throw new Error(`Controller error while creating product: ${error.message}`);
      }
    },
    
  
  

    // Update a product, including image update
    updateProduct: async (_, { id, input, publicId, newImage }) => {
      try {
        let updatedProduct;

        // If a new image is provided, delete the old image and upload the new one
        if (newImage) {
          // Delete the old image if a publicId is provided
          if (publicId) {
            await productService.deleteImageFromCloudinary(publicId);
          }

          // Upload the new image to Cloudinary
          const newImageUrl = await productService.uploadImageToCloudinary(newImage);

          // Update the product with the new image URL and other input data
          updatedProduct = await productService.updateProduct(id, {
            ...input,
            imageUrl: newImageUrl, // Add the new image URL to the product data
          });
        } else {
          // If no new image is provided, just update the other fields
          updatedProduct = await productService.updateProduct(id, input);
        }

        return updatedProduct;
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

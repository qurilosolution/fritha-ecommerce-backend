const productService = require("../services/productService");
const { GraphQLUpload } = require("graphql-upload");
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
    getProductByName: async (_, { name }) => {
      try {
        return await productService.getProductByName(name);
      } catch (error) {
        throw new Error(`Error fetching product by name: ${error.message}`);
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
  //  createProduct: async (_, args, context) => {
      
  //     console.log(context.user);
  //     if (!context.user)
  //       throw Error("You must be logged in to create a category");
  //     if (!context.user.role.includes("admin"))
  //       throw Error("You must be an admin to create a category");
  //     try {
  //       if (!args || !args.input) {
  //         throw new Error("Input is required for creating a product.");
  //       }
  //       const { input } = args;
  //       console.log("Received input for product:", input);
  //       const variants = Array.isArray(input.variants) ? input.variants : []; 
  //       // console.log("Input variants:", variants); 
  //       // Resolve imageUrl if provided
  //       // let resolvedImageUrl = null;
  //       // if (imageUrl) {
  //       //   resolvedImageUrl = await imageUrl;
  //       //   console.log("Resolved imageUrl:", resolvedImageUrl);
  //       // }
  //       // Handle variant image uploads
  //       const processedVariants = await Promise.all(
  //         (Array.isArray(variants) ? variants : []).map(async (variant) => {
  //           if (variant.imageUrl) {
  //             console.log("variant is" , variant);
  //             const variantImageUrl = await productService.uploadImageToCloudinary(
  //               variant.imageUrl
  //             );
  //             console.log(variantImageUrl,"images")
  //             return { ...variant, imageUrl: variantImageUrl };
  //           }
  //           return variant;
  //         })
  //       );
  //       console.log("Processed variants:", processedVariants);


  //       // Prepare product data
  //       const productData = {
  //         ...input,
  //        variants:processedVariants,
         
  //       };
  //       console.log("Final product data to save:", productData);
  //       // Create the product
  //       const product = await productService.createProduct(productData);
  //       console.log("Product successfully created:", product);
  //       return product;
  //     } catch (error) {
  //       console.error("Error creating product:", error.message);
  //       throw new Error(
  //         `Controller error while creating product: ${error.message}`
  //       );
  //     }
  //   },
  
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
   
  // createProduct: async (_, args, context) => {
      
  //   console.log(context.user);
  //   if (!context.user)
  //     throw Error("You must be logged in to create a category");
  //   if (!context.user.role.includes("admin"))
  //     throw Error("You must be an admin to create a category");
  //   try {
  //     if (!args || !args.input) {
  //       throw new Error("Input is required for creating a product.");
  //     }
  //     const { input} = args;
  //     console.log("Received input for product:", input);
  //     const variants = Array.isArray(input.variants) ? input.variants : [];
  //     console.log("Input variants:", variants); 
     
      
  //     // Handle variant image uploads
  //     const processedVariants = await Promise.all(
  //       (Array.isArray(variants) ? variants : []).map(async (variant) => {
  //         if (variant.imageUrl) {
  //           const variantImageUrl = await productService.uploadImageToCloudinary(
  //             variant.imageUrl
  //           );
  //           return { ...variant, imageUrl: variantImageUrl };
  //         }
  //         return variant;
  //       })
  //     );
  //     console.log("Processed variants:", processedVariants);


  //     // Prepare product data
  //     const productData = {
  //       ...input,
       
  //       variants: processedVariants,
  //     };
  //     console.log("Final product data to save:", productData);
  //     // Create the product
  //     const product = await productService.createProduct(productData);
  //     console.log("Product successfully created:", product);
  //     return product;
  //   } catch (error) {
  //     console.error("Error creating product:", error.message);
  //     throw new Error(
  //     //  Controller error while creating product: ${error.message}
  //     );
  //   }
  // },
    
    updateProduct: async (_, { id, input, publicIds, newImages }, context) => {
      if (!context.user) throw new Error("You must be logged in to update a product.");
      if (!context.user.role.includes("admin")) throw new Error("Admin access required.");
    
      try {
        const updatedProduct = await productService.updateProduct(id, {
          ...input,
          publicIds,
          newImages,
        });
    
        return updatedProduct;
      } catch (error) {
        console.error("Error updating product:", error);
        throw new Error(`Error updating product: ${error.message}`);
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

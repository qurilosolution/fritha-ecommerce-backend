const variantService = require("../services/variantService");

module.exports = {
  Query: {
    // Get variants by product
    getVariantsByProduct: async (_, { productId }) => {
      try {
        
        const Variants = await variantService.getVariantsByProduct(productId);

        return {
          success: true,
          message: "Variants fetched successfully",
          variants: Variants,
        };
      } catch (error) {
        console.error("Error fetching variants:", error.message);
        return {
          success: false,
          message: error.message,
          variants: [],
        };
      }
    },
  },

  Mutation: {
    // Add a new variant
    addVariant: async (_, { productId, variantData }, context) => {
        try {
          // Ensure user is authenticated and authorized
          if (!context.user) {
            throw new Error("You must be logged in to add a variant.");
          }
          if (!context.user.role.includes("admin")) {
            throw new Error("You must be an admin to add a variant.");
          }
      
          // Add the new variant
          const processedVariant = await variantService.addVariant(productId, variantData);
      
          // Return success with the new variant
          return {
            success: true,
            message: "Variant successfully added",
            variants: [processedVariant], // Return the processed variant
          };
        } catch (error) {
          console.error("Error adding variant:", error.message);
          return {
            success: false,
            message: error.message,
            variants: null,
          };
        }
    },
    
    updateVariant: async (_, { variantId, updateData }, context) => {
      try {
        // Authentication
        if (!context.user) {
          throw new Error("You must be logged in to update a variant.");
        }
    
        // Authorization
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to update a variant.");
        }
    
        // Input validation
        if (!variantId || !updateData) {
          throw new Error("Variant ID and update data are required.");
        }
    
        // Call the service to update the variant
        const updatedVariant = await variantService.updateVariant(variantId, updateData);
    
        return {
          success: true,
          message: "Variant successfully updated",
          variants: [updatedVariant], // Return the updated variant directly
        };
      } catch (error) {
        console.error("Error updating variant:", {
          message: error.message,
          variantId,
          userId: context.user?.id,
        });
    
        return {
          success: false,
          message: "An error occurred while updating the variant.",
          variant: null,
        };
      }
    },

    deleteVariantImageByIndex: async (_, { variantId, index }, context) => {
      try {
        // Authentication
        if (!context.user) {
          throw new Error("You must be logged in to delete an image.");
        }
    
        // Authorization
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to delete an image.");
        }
    
        // Input validation
        if (!variantId || typeof index !== "number") {
          throw new Error("Variant ID and a valid index are required.");
        }
    
        // Call the service to delete the image
        const updatedVariant = await variantService.deleteVariantImageByIndex(variantId, index);
    
        return {
          success: true,
          message: `Image at index ${index} successfully deleted.`,
          variants: [updatedVariant],
        };
      } catch (error) {
        console.error("Error deleting image by index:", {
          message: error.message,
          variantId,
          userId: context.user?.id,
        });
    
        return {
          success: false,
          message: "An error occurred while deleting the image.",
          variants: null,
        };
      }
    },
    
    
    deleteVariant: async (_, { variantId }, context) => {
      try {
        // Authentication and authorization
        if (!context.user) {
          throw new Error("You must be logged in to delete a variant.");
        }
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to delete a variant.");
        }
    
        const result = await variantService.deleteVariant(variantId);
        console.log('result' , result);
        return {
          success: true,
          message: result.message,
          
        };
      } catch (error) {
        console.error("Error deleting variant:", error.message);
        return {
          success: false,
          message: error.message,
          
        };
      }
    },
    addMultipleVariants: async (_, { productId, variantsData }, context) => {
      try {
        // Authentication and authorization
        if (!context.user) {
          throw new Error("You must be logged in to add variants.");
        }
        if (!context.user.role.includes("admin")) {
          throw new Error("You must be an admin to add variants.");
        }
    
        const newVariants = await variantService.addMultipleVariants(productId, variantsData);
    
        return {
          success: true,
          message: "Variants successfully added",
          variants: [newVariants],
        };
      } catch (error) {
        console.error("Error adding multiple variants:", error.message);
        return {
          success: false,
          message: error.message,
          variants: null,
        };
      }
    },
    
  },
};

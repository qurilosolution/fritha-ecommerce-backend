const variantService = require("../services/variantService");

module.exports = {
  Query: {
    // Get variants by product
    getVariantsByProduct: async (_, { productId }, context) => {
      try {
        // Ensure the user is authenticated
        if (!context.user) {
          throw new Error("You must be logged in to fetch variants.");
        }

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
            variant: null,
          };
        }
    },
    // Process and update variants
    processVariants: async (_, { variants }, context) => {
      try {
        // Check if user is authenticated
        if (!context.user) {
          throw new Error("You must be logged in to process variants.");
        }

        const processedVariants = await variantService.processVariants(variants);

        return {
          success: true,
          message: "Variants processed successfully",
          variants: processedVariants,
        };
      } catch (error) {
        console.error("Error processing variants:", error.message);
        return {
          success: false,
          message: error.message,
          variants: [],
        };
      }
    },
  },
};


const  Product = require("../models/Product");
const  Variant  = require("../models/Variant");
const uploadImageToCloudinary = require("../utils/fileUpload");

// Create a new variant for a product
const addVariant = async (productId, variantData) => {
    try {
      // Handle image URLs asynchronously to resolve promises
      const resolvedImageUrls = await Promise.all(
        (variantData.imageUrl || [])
          .filter(Boolean)  // Remove any falsy values
          .map((image) => uploadImageToCloudinary(image))  // Assuming `uploadImageToCloudinary` returns a Promise
      );
  
      // Create the new variant
      const newVariant = new Variant({
        ...variantData,  // Spread the rest of the variant data
        productId,       // Link to the product
        imageUrl: resolvedImageUrls,  // Set the resolved image URLs
      });
  
      // Save the new variant to the database
      await newVariant.save();
  
      // Now link the new variant to the product
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error("Product not found.");
      }

      // Ensure the variants field exists and is an array
    if (!Array.isArray(product.variants)) {
        product.variants = [];  // Initialize as an empty array if not already
      }
  
      // Add the new variant's ID to the product's variants array
      product.variants.push(newVariant._id);
      await product.save();  // Save the updated product
  
      return newVariant; // Return the newly created variant
    } catch (error) {
      console.error("Error adding variant:", error.message);
      throw new Error("Failed to add variant.");
    }
  };
  
  
  


const getVariantsByProduct =async (productId) =>{
  try {
    const variants = await Variant.find({ productId });
    console.log('Variants:', variants);
  } catch (err) {
    console.error(err.message);
  }
};

const processVariants = async (variants) => {
    try {
      if (!Array.isArray(variants)) return [];
  
      const processedVariants = await Promise.all(
        variants.map(async (variant) => {
          if (variant.imageUrl) {
            const processedImages = await Promise.all(
              (Array.isArray(variant.imageUrl) ? variant.imageUrl : [variant.imageUrl])
                .filter(Boolean)
                .map((image) => uploadImageToCloudinary(image))
            );
            return { ...variant, imageUrl: processedImages };
          }
          return variant;
        })
      );
  
      return processedVariants;
    } catch (error) {
      console.error("Error processing variants:", error.message);
      throw new Error(`Variant processing error: ${error.message}`);
    }
};

module.exports ={
    addVariant,
    getVariantsByProduct,
    processVariants

}
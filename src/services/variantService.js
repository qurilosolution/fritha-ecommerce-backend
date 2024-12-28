const  Product = require("../models/Product");
const  Variant  = require("../models/Variant");
const uploadImageToCloudinary = require("../utils/fileUpload");
const cloudinary = require("../config/cloudinary");


const getVariantsByProduct =async (productId) =>{
  try {
    const variants = await Variant.find({ productId });
    console.log('Variants:', variants);
    return variants
  } catch (err) {
    console.error(err.message);
  }
};

// Create a new variant for a product
const addVariant = async (productId, variantData) => {
    try {
      
      const resolvedImageUrls = await Promise.all(
        (variantData.imageUrl || [])
          .filter(Boolean)  // Remove any falsy values
          .map((image) => uploadImageToCloudinary(image))  
      );
  
      // Create the new variant
      const newVariant = new Variant({
        ...variantData, 
        productId,       
        imageUrl: resolvedImageUrls,  
      });
  
      
      await newVariant.save();
  
      
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

  const updateVariant = async (variantId, updateData) => {
    try {
      if (!variantId || !updateData) {
        throw new Error("Variant ID and update data are required.");
      }
  
      const { newImages, publicIds, ...otherData } = updateData;
  
      // Handle newImages and publicIds for image updates
      if (newImages && Array.isArray(newImages) && newImages.length > 0) {
        console.log("New images received for variant:", newImages);
  
        // Delete old images if public IDs are provided
        if (publicIds && Array.isArray(publicIds) && publicIds.length > 0) {
          console.log("Deleting old images with public IDs:", publicIds);
          await Promise.all(
            publicIds.map((publicId) => deleteImageFromCloudinary(publicId))
          );
        }
  
        // Upload new images to Cloudinary
        const uploadedImages = await Promise.all(
          newImages.map((image) => uploadImageToCloudinary(image))
        );
        console.log("Uploaded new images for variant:", uploadedImages);
  
        // Update the imageUrl field with new images
        otherData.imageUrl = uploadedImages;
      }
  
      // Find and update the variant
      const updatedVariant = await Variant.findByIdAndUpdate(
        variantId,
        { $set: otherData },
        { new: true, runValidators: true } // Return the updated document
      );
  
      if (!updatedVariant) {
        throw new Error("Variant not found or update failed.");
      }
  
      console.log("Updated variant:", updatedVariant);
      return updatedVariant;
    } catch (error) {
      console.error("Error updating variant:", error.message);
      throw new Error(`Failed to update variant: ${error.message}`);
    }
  };
  

  const deleteVariant = async (variantId) => {
    try {
      // Find and delete the variant
      const variant = await Variant.findByIdAndDelete(variantId);
  
      if (!variant) {
        throw new Error("Variant not found.");
      }
   
      // Remove the variant ID from the associated product
      const product = await Product.findById(variant.productId);
      if (product) {
        product.variants = product.variants.filter(
          (id) => id.toString() !== variantId.toString()
        );
        await product.save();
      }
  
      return { success: true, message: "Variant successfully deleted." };
    } catch (error) {
      console.error("Error deleting variant:", error.message);
      throw new Error("Failed to delete variant.");
    }
  };

  // Function to delete an image from Cloudinary
  const deleteImageFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      throw new Error(`Error deleting image: ${error.message}`);
    }
  };
  
  const addMultipleVariants = async (productId, variantsData) => {
    try {
      // Handle image uploads for each variant
      const resolvedVariants = await Promise.all(
        variantsData.map(async (variantData) => {
          const resolvedImageUrls = await Promise.all(
            (variantData.imageUrl || [])
              .filter(Boolean)
              .map((image) => uploadImageToCloudinary(image))
          );
          console.log("resolvedImageUrls" , resolvedImageUrls);
  
          return {
            ...variantData,
            productId,
            imageUrl: resolvedImageUrls,
          };
        })
      );
  
      // Create all variants in the database
      const newVariants = await Variant.insertMany(resolvedVariants);
      console.log("newVariants" ,newVariants);
  
      // Add the variants to the product
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error("Product not found.");
      }
  
      if (!Array.isArray(product.variants)) {
        product.variants = [];
      }
  
      product.variants.push(...newVariants.map((variant) => variant._id));
      await product.save();
      
      return newVariants;
    } catch (error) {
      console.error("Error adding multiple variants:", error.message);
      throw new Error("Failed to add multiple variants.");
    }
  };
  
  module.exports ={
    addVariant,
    getVariantsByProduct,
   
    updateVariant,
    deleteVariant,
    addMultipleVariants

}
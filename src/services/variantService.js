const  Product = require("../models/Product");
const  Variant  = require("../models/Variant");
const uploadImageToCloudinary = require("../utils/fileUpload");
const cloudinary = require("../config/cloudinary");


const getVariantsByProduct =async (productId) =>{
  try {
    const variants = await Variant.find({ productId , deletedAt: null });
    console.log('Variants:', variants);
    return variants
  } catch (err) {
    console.error(err.message);
  }
};

// Create a new variant for a product
const addVariant = async (productId, variantData) => {
  try {
    // Validate product ID and variant data
    if (!productId || !variantData) {
      throw new Error("Product ID and variant data are required.");
    }

    // Upload images and collect both URLs and publicIds
    const uploadedImages = await Promise.all(
      (variantData.imageUrl || [])
        .filter(Boolean) // Remove any falsy values
        .map(async (image) => {
          try {
            const uploadResult = await uploadImageToCloudinary(image);
            if (uploadResult && uploadResult.public_id && uploadResult.secure_url) {
              return {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
              };
            } else {
              console.error("Incomplete response from Cloudinary:", uploadResult);
              return null;
            }
          } catch (error) {
            console.error("Error uploading image to Cloudinary:", error);
            return null;
          }
        })
    );

    // Filter out null results from failed uploads
    const validUploads = uploadedImages.filter((result) => result !== null);

    // Extract URLs and publicIds for storage
    const imageUrls = validUploads.map((upload) => upload.url);
    const publicIds = validUploads.map((upload) => upload.publicId);

    // Create the new variant
    const newVariant = new Variant({
      ...variantData,
      productId,
      imageUrl: imageUrls,
      publicIds, // Store the publicIds in the database
    });

    // Save the new variant to the database
    await newVariant.save();

    // Find the parent product
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found.");
    }

    // Ensure the variants field exists and is an array
    if (!Array.isArray(product.variants)) {
      product.variants = []; // Initialize as an empty array if not already
    }

    // Add the new variant's ID to the product's variants array
    product.variants.push(newVariant._id);
    await product.save(); // Save the updated product

    // Return the newly created variant
    return newVariant;
  } catch (error) {
    console.error("Error adding variant:", error.message);
    throw new Error("Failed to add variant.");
  }
};


// const updateVariant = async (variantId, updateData) => {
//   try {
//     if (!variantId || !updateData) {
//       throw new Error("Variant ID and update data are required.");
//     }

//     const { imageUrl, ...otherData } = updateData;
    
//     if (imageUrl && Array.isArray(imageUrl) && imageUrl.length > 0) {
//       console.log("New images received for variant:", imageUrl);
    
//       const uploadedImages = await Promise.all(
//         imageUrl.map(async (imagePromise) => {
//           try {
//             const image = await imagePromise; // Resolve Promise if necessary
//             console.log("Uploading file:", image);
//             const result = await uploadImageToCloudinary(image);
//             console.log("Cloudinary upload result:", result);
            
//             // Ensure that secure_url is available in the result
//             if (!result.secure_url || !result.public_id) {
//               throw new Error("Invalid upload response from Cloudinary.");
//             }
            
//             return result.secure_url; // Return only the secure_url
//           } catch (error) {
//             console.error("Error uploading image:", error.message);
//             throw new Error("Image upload failed.");
//           }
//         })
//       );
    
//       // Directly store the uploaded image URLs in the imageUrl field
//       otherData.imageUrl = uploadedImages;
//     } else {
//       console.log("No new images provided or invalid imageUrl array.");
//     }

//     // Find and update the variant
//     const updatedVariant = await Variant.findByIdAndUpdate(
//       variantId,
//       { $set: otherData },
//       { new: true, runValidators: true } // Return the updated document
//     );

//     if (!updatedVariant) {
//       throw new Error("Variant not found or update failed.");
//     }

//     console.log("Updated variant:", updatedVariant);
//     return updatedVariant;
//   } catch (error) {
//     console.error("Error updating variant:", error.message);
//     throw new Error(`Failed to update variant: ${error.message}`);
//   }
// };

const updateVariant = async (variantId, input) => {
  try {
    if (!variantId || !input) {
      throw new Error("Variant ID and update data are required.");
    }

    const { imageUrl = [], publicIds = [], ...otherFields } = input;

    // Fetch the existing variant
    const variant = await Variant.findById(variantId);
    if (!variant) {
      throw new Error("Variant not found.");
    }

    // Validate that both arrays have the same length
    if (imageUrl.length < publicIds.length) {
      throw new Error("imageUrl can't be less than publicIds arrays length.");
    }

    const updatedImages = await Promise.all(
      imageUrl.map(async (image, index) => {
        if (image === null) {
          // Retain the existing image URL and public ID
          return {
            secure_url: variant.imageUrl[index],
            public_id: variant.publicIds[index],
          };
        }

        if (image === "") {
          // Replace the existing image at this index
          if (publicIds[index]) {
            try {
              await deleteImageFromCloudinary(publicIds[index]); // Delete old image
            } catch (error) {
              console.error(`Failed to delete image with publicId: ${publicIds[index]}`, error);
            }
          }

          // Upload the new image
          try {
            const uploadResult = await uploadImageToCloudinary(image);
            return uploadResult
              ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
              : null;
          } catch (error) {
            console.error("Error uploading image:", error);
            return null;
          }
        }

        // For new images, upload to Cloudinary
        try {
          const uploadResult = await uploadImageToCloudinary(image);
          return uploadResult
            ? { secure_url: uploadResult.secure_url, public_id: uploadResult.public_id }
            : null;
        } catch (error) {
          console.error("Error uploading image:", error);
          return null;
        }
      })
    );

    // Filter out null values and assign the updated image URLs and public IDs
    const validImages = updatedImages.filter((result) => result !== null);

    const variantData = { ...otherFields };
    if (validImages.length > 0) {
      variantData.imageUrl = validImages.map((upload) => upload.secure_url);
      variantData.publicIds = validImages.map((upload) => upload.public_id);
    } else {
      variantData.imageUrl = []; // Clear images if all were deleted
      variantData.publicIds = [];
    }

    // Update the variant in the database
    const updatedVariant = await Variant.findByIdAndUpdate(variantId, variantData, {
      new: true,
      runValidators: true,
    });

    if (!updatedVariant) {
      throw new Error("Variant update failed.");
    }

    return updatedVariant;
  } catch (error) {
    console.error("Error updating variant:", error.message);
    throw new Error(`Error updating variant: ${error.message}`);
  }
};

const deleteVariantImageByIndex = async (variantId, index) => {
  try {
    if (!variantId || typeof index !== "number") {
      throw new Error("Variant ID and valid index are required.");
    }

    // Fetch the variant
    const variant = await Variant.findById(variantId);
    if (!variant) {
      throw new Error("Variant not found.");
    }

    const { imageUrl, publicIds } = variant;

    // Validate index
    if (index < 0 || index >= imageUrl.length) {
      throw new Error("Invalid index provided.");
    }

    // Delete the image from Cloudinary
    const publicIdToDelete = publicIds[index];
    if (publicIdToDelete) {
      await deleteImageFromCloudinary(publicIdToDelete);
    }

    // Remove the image URL and public ID from their respective arrays
    imageUrl.splice(index, 1);
    publicIds.splice(index, 1);

    // Save the updated variant
    variant.imageUrl = imageUrl;
    variant.publicIds = publicIds;
    await variant.save();

    return variant;
  } catch (error) {
    console.error("Error deleting image by index:", error.message);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};




  const deleteVariant = async (variantId) => {
    try {
      // Find the variant by ID
      const variant = await Variant.findById(variantId);
      
      if (!variant) {
        throw new Error("Variant not found.");
      }
  
      
      variant.deletedAt = new Date();
      await variant.save(); 
  
      // Remove the variant ID from the associated product
      const product = await Product.findById(variant.productId);
      if (product) {
        product.variants = product.variants.filter(
          (id) => id.toString() !== variantId.toString()
        );
        await product.save();
      }
  
      return { success: true, message: "Variant successfully marked as deleted." };
    } catch (error) {
      console.error("Error marking variant as deleted:", error.message);
      throw new Error("Failed to mark variant as deleted.");
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
    deleteVariantImageByIndex,
    updateVariant,
    deleteVariant,
    addMultipleVariants

}
const categoryService = require("../services/categoryService");
const uploadImageToCloudinary = require("../utils/fileUpload"); // Assuming you have this function to handle image uploads to Cloudinary
const { GraphQLUpload } = require("graphql-upload");
const categoryResolver = {
  Upload: GraphQLUpload,
  Query: {
    getCategories: categoryService.getCategories,
    getCategoryById: categoryService.getCategoryById,
  },
  Mutation: {
    createCategory: async (
      _,
      { name, description, imageUrl, BannerimageUrl, CartimageUrl },
      context
    ) => {
      console.log(imageUrl,"imageUrl")
      console.log(context.user);

      // Ensure the user is logged in and has the "admin" role
      if (!context.user) {
        throw new Error("You must be logged in to create a category");
      }
      if (!context.user.role.includes("admin")) {
        throw new Error("You must be an admin to create a category");
      }

      try {
        const categoryData = {
          name,
          description,
          imageUrl: [],
          BannerimageUrl: [],
          CartimageUrl: [],
        };

        // Handle imageUrl file upload
        if (imageUrl) {
          const uploadedImages = [];
          console.log("Type of imageUrl:", typeof imageUrl);

          // Ensure imageUrl is an array, otherwise, make it an array with a single item
          const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];
          console.log(images,"images")
          for (const image of images) {
            try {
              const uploadedImage = await uploadImageToCloudinary(image);
              console.log("Uploaded Image:", uploadedImage);
              if (!uploadedImage) {
                throw new Error("Uploaded image does not contain a URL.");
              }
              uploadedImages.push(uploadedImage);
            } catch (error) {
              console.error("Error uploading image:", error.message);
              throw new Error("Image upload failed.");
            }
          }
          categoryData.imageUrl = uploadedImages;
        }

        // Handle BannerimageUrl file upload
        if (BannerimageUrl) {
          const uploadedBannerImages = [];
          console.log("Type of BannerimageUrl:", typeof BannerimageUrl);

          // Ensure BannerimageUrl is an array, otherwise, make it an array with a single item
          const bannerImages = Array.isArray(BannerimageUrl)
            ? BannerimageUrl
            : [await BannerimageUrl];
          for (const image of bannerImages) {
            try {
              const uploadedBannerImage = await uploadImageToCloudinary(image);
              console.log("Uploaded Banner Image:", uploadedBannerImage);
              if (!uploadedBannerImage) {
                throw new Error(
                  "Uploaded banner image does not contain a URL."
                );
              }
              uploadedBannerImages.push(uploadedBannerImage);
            } catch (error) {
              console.error("Error uploading banner image:", error.message);
              throw new Error("Banner image upload failed.");
            }
          }
          categoryData.BannerimageUrl = uploadedBannerImages;
        }

        // Handle CartimageUrl file upload
        if (CartimageUrl) {
          const uploadedCartImages = [];
          console.log("Type of CartimageUrl:", typeof CartimageUrl);

          // Ensure CartimageUrl is an array, otherwise, make it an array with a single item
          const cartImages = Array.isArray(CartimageUrl)
            ? CartimageUrl
            : [await CartimageUrl];
          for (const image of cartImages) {
            try {
              const uploadedCartImage = await uploadImageToCloudinary(image);
              console.log("Uploaded Cart Image:", uploadedCartImage);
              if (!uploadedCartImage) {
                throw new Error("Uploaded cart image does not contain a URL.");
              }
              uploadedCartImages.push(uploadedCartImage);
            } catch (error) {
              console.error("Error uploading cart image:", error.message);
              throw new Error("Cart image upload failed.");
            }
          }
          categoryData.CartimageUrl = uploadedCartImages;
        }

        // Create the category using the categoryService
        const category = await categoryService.createCategory(categoryData);
        console.log("Category successfully created:", category);
        return category;
      } catch (error) {
        console.error("Error creating category:", error.message);
        throw new Error(
          `Controller error while creating category: ${error.message}`
        );
      }
    },

    // updateCategory: async (_, args, context) => {
    //   console.log("Input args received in resolver:", args);
    //   console.log("User context:", context.user);

    //   // Ensure the user is logged in and has the "admin" role
    //   if (!context.user) throw Error("You must be logged in to update a category");
    //   if (!context.user.role.includes("admin"))
    //     throw Error("You must be an admin to update a category");

    //   try {
    //     const { id, name, description, imageUrl, BannerimageUrl, CartimageUrl } = args;

    //     // Validate ID
    //     if (!id || typeof id !== "string") {
    //       throw new Error("Category ID must be a valid string.");
    //     }
    //     console.log("Validated ID:", id);

    //     // Prepare image upload handling for imageUrl
    //     let uploadedImages = [];
    //     if (imageUrl) {
    //       console.log("Handling file upload for imageUrl...");
    //       const images = Array.isArray(imageUrl) ? imageUrl : [await imageUrl];
    //       for (const image of images) {
    //         const uploadedImage = await uploadImageToCloudinary(image);
    //         if (!uploadedImage) throw new Error("Failed to upload image.");
    //         uploadedImages.push(uploadedImage);
    //       }
    //     }

    //     // Prepare image upload handling for BannerimageUrl
    //     let uploadedBannerImages = [];
    //     if (BannerimageUrl) {
    //       console.log("Handling file upload for BannerimageUrl...");
    //       const bannerImages = Array.isArray(BannerimageUrl) ? BannerimageUrl : [await BannerimageUrl];
    //       for (const bannerImage of bannerImages) {
    //         const uploadedBannerImage = await uploadImageToCloudinary(bannerImage);
    //         if (!uploadedBannerImage) throw new Error("Failed to upload banner image.");
    //         uploadedBannerImages.push(uploadedBannerImage);
    //       }
    //     }

    //     // Prepare image upload handling for CartimageUrl
    //     let uploadedCartImages = [];
    //     if (CartimageUrl) {
    //       console.log("Handling file upload for CartimageUrl...");
    //       const cartImages = Array.isArray(CartimageUrl) ? CartimageUrl : [await CartimageUrl];
    //       for (const cartImage of cartImages) {
    //         const uploadedCartImage = await uploadImageToCloudinary(cartImage);
    //         if (!uploadedCartImage) throw new Error("Failed to upload cart image.");
    //         uploadedCartImages.push(uploadedCartImage);
    //       }
    //     }

    //     // Call service to update category with the uploaded images
    //     const updatedCategory = await categoryService.updateCategory(id, {
    //       name,
    //       description,
    //       imageUrl: uploadedImages.length > 0 ? uploadedImages : undefined,
    //       BannerimageUrl: uploadedBannerImages.length > 0 ? uploadedBannerImages : undefined,
    //       CartimageUrl: uploadedCartImages.length > 0 ? uploadedCartImages : undefined,
    //     });

    //     console.log("Category successfully updated:", updatedCategory);
    //     return updatedCategory;
    //   } catch (error) {
    //     console.error("Error in updateCategory resolver:", error.message);
    //     throw new Error(`Failed to update category: ${error.message}`);
    //   }
    // },

    updateCategory: async (_, args, context) => {
      console.log("Input args received in resolver:", args);
      console.log("User context:", context.user);

      // Ensure the user is logged in and has the "admin" role
      if (!context.user)
        throw Error("You must be logged in to update a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to update a category");

      try {
        const {
          id,
          name,
          description,
          imageUrl,
          BannerimageUrl,
          CartimageUrl,
        } = args;

        // Validate ID
        if (!id || typeof id !== "string") {
          throw new Error("Category ID must be a valid string.");
        }
        console.log("Validated ID:", id);

        // Helper function for image upload handling
        const uploadImages = async (imageUrls) => {
          let uploadedImages = [];
          if (imageUrls) {
            const images = Array.isArray(imageUrls)
              ? imageUrls
              : [await imageUrls];
            for (const image of images) {
              const uploadedImage = await uploadImageToCloudinary(image);
              if (!uploadedImage) throw new Error("Failed to upload image.");
              uploadedImages.push(uploadedImage);
            }
          }
          return uploadedImages;
        };

        // Upload images
        const uploadedImages = await uploadImages(imageUrl);
        const uploadedBannerImages = await uploadImages(BannerimageUrl);
        const uploadedCartImages = await uploadImages(CartimageUrl);

        // Call service to update category with the uploaded images
        const updatedCategory = await categoryService.updateCategory(id, {
          name,
          description,
          imageUrl: uploadedImages.length > 0 ? uploadedImages : undefined,
          BannerimageUrl:
            uploadedBannerImages.length > 0 ? uploadedBannerImages : undefined,
          CartimageUrl:
            uploadedCartImages.length > 0 ? uploadedCartImages : undefined,
        });

        console.log("Category successfully updated:", updatedCategory);
        return updatedCategory;
      } catch (error) {
        console.error("Error in updateCategory resolver:", error.message);
        throw new Error(`Failed to update category: ${error.message}`);
      }
    },

    deleteCategory: async (_, { id }, context) => {
      console.log(context.user);
      if (!context.user)
        throw Error("You must be logged in to create a category");
      if (!context.user.role.includes("admin"))
        throw Error("You must be an admin to create a category");
      try {
        // Call deleteCategory function
        const result = await categoryService.deleteCategory(id);
        // Ensure result is valid
        if (result) {
          return { success: true, message: "Category deleted successfully." };
        } else {
          return {
            success: false,
            message: "Category deletion failed. Category may not exist.",
          };
        }
      } catch (error) {
        console.error("Error deleting category:", error.message);
        return {
          success: false,
          message: `Failed to delete category: ${error.message}`,
        };
      }
    },
  },
};
module.exports = categoryResolver;

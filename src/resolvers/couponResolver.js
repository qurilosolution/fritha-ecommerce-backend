const couponService = require('../services/couponService');
const Product = require('../models/Product'); // Adjust path if necessary

const couponResolvers = {
  Query: {
    // Fetch a specific coupon by ID
    getCoupon: async (_, { id }) => {
      return couponService.getCouponById(id);
    },

    // Fetch all coupons (excluding soft-deleted ones by default)
    listCoupons: async (_, __, context) => {
      console.log(context, "lolololo");
      if (!context) {
        throw new Error('You must be logged in to add items to the coupon');
      }
      try {
        return couponService.getAllCoupons();
      } catch (error) {
        throw new Error('Error adding item to coupon: ' + error.message);
      }
    },
    
  },

  Mutation: {
    // Create a new coupon
    // createCoupon: async (_, args, context) => {
    //   if (!context) {
    //     throw new Error('You must be logged in to add items to the coupon');
    //   }
    //   try{
    //     return couponService.createCoupon(args);
    //   }catch(error){
    //     throw new Error('Error adding item to coupon: ' + error.message);

    //   }
    // },

    createCoupon : async (_, args, context) => {
      if (!context) {
        throw new Error('You must be logged in to add items to the coupon');
      }
    
      try {
        // Create the coupon with the provided data
        const createdCoupon = await couponService.createCoupon(args);
    
        // Populate the applicableProducts field with full product details
        if (createdCoupon.applicableProducts && createdCoupon.applicableProducts.length > 0) {
          const populatedProducts = await Product.find({
            '_id': { $in: createdCoupon.applicableProducts },
          }).exec();
    
          createdCoupon.applicableProducts = populatedProducts.map(product => ({
            id: product._id.toString(),
            name: product.name,  // Ensure this field is present and not null
            // You can add other product fields here as needed
          }));

          
        }
    
        return createdCoupon;
      } catch (error) {
        throw new Error('Error adding item to coupon: ' + error.message);
      }
    },
    
    
    

    // Update an existing coupon
    updateCoupon: async (_, { id, ...updateData },context) => {
      if (!context) {
        throw new Error('You must be logged in to add items to the coupon');
      }

      try{
        return couponService.updateCoupon(id, updateData);

      }catch(error){

        throw new Error('Error adding item to coupon: ' + error.message);

      }
    },




    // Soft-delete a coupon
    deleteCoupon: async (_, { id },context) => {
      if (!context) {
        throw new Error('You must be logged in to add items to the coupon');
      }
      try{
        return couponService.softDeleteCoupon(id);

      }catch(error){

        throw new Error('Error adding item to coupon: ' + error.message);

      }
    },
  },
};

module.exports = couponResolvers;

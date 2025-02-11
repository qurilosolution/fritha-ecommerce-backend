const couponService = require('../services/couponService');

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

    

    

    validateCoupon: async (_, { couponCode, customerId }) => {
      try {
        const validCoupon = await couponService.checkCouponValidity(couponCode, customerId);
        return {
          isValid: true,
          coupon: validCoupon,
        };
      } catch (error) {
        return {
          isValid: false,
          message: error.message,
        };
      }
    },
    




    
    
  },

  Mutation: {
    // Create a new coupon
    createCoupon: async (_, args, context) => {
      if (!context) {
        throw new Error('You must be logged in to add items to the coupon');
      }
      try{
        return couponService.createCoupon(args);
      }catch(error){
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

const couponService = require('../services/couponService');

const couponResolvers = {
  Query: {
    // Fetch a specific coupon by ID
    getCoupon: async (_, { id }) => {
      return couponService.getCouponById(id);
    },

    // Fetch all coupons (excluding soft-deleted ones by default)
    listCoupons: async () => {
      return couponService.getAllCoupons();
    },
  },

  Mutation: {
    // Create a new coupon
    createCoupon: async (_, args) => {
      return couponService.createCoupon(args);
    },

    // Update an existing coupon
    updateCoupon: async (_, { id, ...updateData }) => {
       return couponService.updateCoupon(id, updateData);
    },

    // Soft-delete a coupon
    deleteCoupon: async (_, { id }) => {
      return couponService.softDeleteCoupon(id);
    },
  },
};

module.exports = couponResolvers;

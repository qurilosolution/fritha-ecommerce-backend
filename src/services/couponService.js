// const Coupon = require('../models/couponModel');

// const couponService = {
//   // Fetch a specific coupon by ID
//   getCouponById: async (id) => {
//     try {
//       const coupon = await Coupon.findById(id);
//       if (!coupon || coupon.deletedAt) {
//         throw new Error('Coupon not found or has been deleted');
//       }
//       return coupon;
//     } catch (error) {
//       throw new Error(`Error fetching coupon: ${error.message}`);
//     }
//   },

//   // Fetch all coupons (excluding soft-deleted ones)
//   getAllCoupons: async () => {
//     try {
//       return await Coupon.find({ deletedAt: null });
//     } catch (error) {
//       throw new Error(`Error fetching coupons: ${error.message}`);
//     }
//   },

//   // Create a new coupon
//   createCoupon: async (data) => {
//     try {
//       const newCoupon = new Coupon(data);
//       return await newCoupon.save();
//     } catch (error) {
//       throw new Error(`Error creating coupon: ${error.message}`);
//     }
//   },

//   // Update an existing coupon
//   updateCoupon: async (id, updateData) => {
//     try {
//       const updatedCoupon = await Coupon.findOneAndUpdate(
//         { _id: id, deletedAt: null }, // Ensure it hasn't been soft-deleted
//         updateData,
//         { new: true }
//       );
//       if (!updatedCoupon) {
//         throw new Error('Coupon not found or has been deleted');
//       }
//       return updatedCoupon;
//     } catch (error) {
//       throw new Error(`Error updating coupon: ${error.message}`);
//     }
//   },

//   // Soft-delete a coupon
//   softDeleteCoupon: async (id) => {
//     try {
//       const deletedCoupon = await Coupon.findOneAndUpdate(
//         { _id: id, deletedAt: null }, // Ensure it hasn't been soft-deleted
//         { deletedAt: new Date() },
//         { new: true }
//       );
//       if (!deletedCoupon) {
//         throw new Error('Coupon not found or has already been deleted');
//       }
//       return deletedCoupon;
//     } catch (error) {
//       throw new Error(`Error deleting coupon: ${error.message}`);
//     }
//   },
// };

// module.exports = couponService;







const Coupon = require('../models/couponModel');

const couponService = {
  // Fetch a specific coupon by ID
  getCouponById: async (id) => {
    try {
      const coupon = await Coupon.findById(id);
      if (!coupon || coupon.deletedAt) {
        throw new Error('Coupon not found or has been deleted');
      }
      return coupon;
    } catch (error) {
      throw new Error(`Error fetching coupon: ${error.message}`);
    }
  },

  // Fetch all coupons (excluding soft-deleted ones)
  getAllCoupons: async () => {
    try {
      return await Coupon.find({ deletedAt: null });
    } catch (error) {
      throw new Error(`Error fetching coupons: ${error.message}`);
    }
  },

  // Create a new coupon
  createCoupon: async (data) => {
    try {
      // Ensure applicableProducts is an array of strings (ObjectId to string conversion)
      if (data.applicableProducts) {
        data.applicableProducts = data.applicableProducts.map(productId => productId.toString());
      }

      const newCoupon = new Coupon(data);
      return await newCoupon.save();
    } catch (error) {
      throw new Error(`Error creating coupon: ${error.message}`);
    }
  },

  // Update an existing coupon
  updateCoupon: async (id, updateData) => {
    console.log(updateData,"dfnjdsf")
    try {
      // Ensure applicableProducts is an array of strings (ObjectId to string conversion)
      if (updateData.applicableProducts) {
        updateData.applicableProducts = updateData.applicableProducts.map(productId => productId.toString());
      }

      const updatedCoupon = await Coupon.findOneAndUpdate(
        { _id: id, deletedAt: null }, // Ensure it hasn't been soft-deleted
        updateData,
        { new: true }
      );
      if (!updatedCoupon) {
        throw new Error('Coupon not found or has been deleted');
      }
      return updatedCoupon;
    } catch (error) {
      throw new Error(`Error updating coupon: ${error.message}`);
    }
  },

  // Soft-delete a coupon
  softDeleteCoupon: async (id) => {
    try {
      const deletedCoupon = await Coupon.findOneAndUpdate(
        { _id: id, deletedAt: null }, // Ensure it hasn't been soft-deleted
        { deletedAt: new Date() },
        { new: true }
      );
      if (!deletedCoupon) {
        throw new Error('Coupon not found or has already been deleted');
      }
      return deletedCoupon;
    } catch (error) {
      throw new Error(`Error deleting coupon: ${error.message}`);
    }
  },
};

module.exports = couponService;

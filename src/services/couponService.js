const Coupon = require("../models/couponModel");
const Product = require("../models/Product");

const couponService = {
  // Fetch a specific coupon by ID
  getCouponById: async (id) => {
    try {
      const coupon = await Coupon.findById(id);
      if (!coupon || coupon.deletedAt) {
        throw new Error("Coupon not found or has been deleted");
      }
      return coupon;
    } catch (error) {
      throw new Error(`Error fetching coupon: ${error.message}`);
    }
  },

 

  getAllCoupons: async () => {
    try {
      // Use populate to fetch the product names for applicableProducts
      const coupons = await Coupon.find({ deletedAt: null })
        .populate({
          path: 'applicableProducts',
          select: 'name', // Only select the 'name' field from the products
          model: 'Product', // Specify the model for the 'applicableProducts' reference
        });
  
      return coupons;
    } catch (error) {
      throw new Error(`Error fetching coupons: ${error.message}`);
    }
  },
  
  
  
  // Create a new coupon
  // createCoupon: async (data) => {
  //   try {
  //     // Ensure applicableProducts is an array of strings (ObjectId to string conversion)
  //     if (data.applicableProducts) {
  //       data.applicableProducts = data.applicableProducts.map((productId) =>
  //         productId.toString()
  //       );
  //     }

  //     const newCoupon = new Coupon(data);
  //     return await newCoupon.save();
  //   } catch (error) {
  //     throw new Error(`Error creating coupon: ${error.message}`);
  //   }
  // },


  createCoupon: async (data) => {
    try {
      // Validate applicable product IDs if provided
      if (data.applicableProducts?.length > 0) {
        const validProducts = await Product.find({
          _id: { $in: data.applicableProducts },
        }).select('_id');
        if (validProducts.length !== data.applicableProducts.length) {
          throw new Error('Some product IDs are invalid');
        }
      }
  
      // Create and save the new coupon
      const newCoupon = new Coupon(data);
      await newCoupon.save();
  
      // Populate applicableProducts and return the created coupon
      return await Coupon.findById(newCoupon._id).populate({
        path: 'applicableProducts',
        select: 'id name',
      });
    } catch (error) {
      throw new Error(`Error creating coupon: ${error.message}`);
    }
  },
  
  



updateCoupon: async (id, updateData) => {
  try {
    // Ensure applicableProducts is an array of strings (ObjectId to string conversion)
    if (updateData.applicableProducts) {
      updateData.applicableProducts = updateData.applicableProducts.map((productId) => {
        return productId.toString();  // Convert ObjectId to string
      });
    }

    const updatedCoupon = await Coupon.findOneAndUpdate(
      { _id: id, deletedAt: null }, // Ensure it hasn't been soft-deleted
      updateData,
      { new: true }
    );

    if (!updatedCoupon) {
      throw new Error("Coupon not found or has been deleted");
    }

    // Populate the applicableProducts field with the product names
    await updatedCoupon .populate({
      path: 'applicableProducts',
      select: 'name', // Only select the 'name' field from the products
      model: 'Product', // Specify the model for the 'applicableProducts' reference
    });

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
        throw new Error("Coupon not found or has already been deleted");
      }
      return deletedCoupon;
    } catch (error) {
      throw new Error(`Error deleting coupon: ${error.message}`);
    }
  },
};

module.exports = couponService;

const Coupon = require("../models/couponModel");
const Product = require("../models/Product");
const {CustomerModel} = require("../models/customerModel");

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
  
  
  




  createCoupon: async (data) => {
    try {
      // Ensure applicableProducts is an array of ObjectIds (if it's passed as an array of string IDs)
      if (data.applicableProducts) {
        data.applicableProducts = data.applicableProducts.map((productId) =>
          productId.toString()
        );
      }
  
      // Create a new coupon
      const newCoupon = new Coupon(data);
      console.log(newCoupon,"lololololololo")
  
      // Save the new coupon to the database
      await newCoupon.save();
  
      // Populate applicableProducts to fetch the product names
      await newCoupon.populate({
        path: 'applicableProducts',
        select: 'name', // Only select the 'name' field from the products
        model: 'Product', // Specify the model for the 'applicableProducts' reference
      });
  
      // Return the newly created coupon with populated applicableProducts
      return newCoupon;
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





 
    checkCouponValidity : async (couponCode, customerId) => {
    try {
      // Check if the coupon code exists and is not deleted
      const existingCoupon = await Coupon.findOne({ code: couponCode, deletedAt: null });
      if (!existingCoupon) {
        throw new Error("Coupon code does not exist or has been deleted.");
      }
  
      // Check if the coupon status is active
      if (existingCoupon.status !== "active") {
        throw new Error("Coupon is inactive.");
      }
  
      // Check if the coupon is within the valid date range
      const currentDate = new Date();
      if (new Date(existingCoupon.startDate) > currentDate || new Date(existingCoupon.endDate) < currentDate) {
        throw new Error("Coupon is not valid at this time.");
      }
  
      // Retrieve the customer
      const customer = await CustomerModel.findById(customerId);
      if (!customer) {
        throw new Error("Customer not found.");
      }
  
   


      const allCustomers = await CustomerModel.find({
        "couponUsed.couponId": existingCoupon._id,
      });
      
      const totalUsage = allCustomers.reduce((count, cust) => {
        const usage = cust.couponUsed.find(
          (coupon) => coupon.couponId.toString() === existingCoupon._id.toString()
        );
        return count + (usage ? usage.couponUsageCount : 0);
      }, 0);
      
      console.log( totalUsage,"lolololooo")

      console.log(existingCoupon.maxUsage,"lolololooo")



      // Check if the total usage exceeds maxUsage
      if (totalUsage >= existingCoupon.maxUsage) {
        throw new Error("Coupon usage limit has been reached.");
      }
  

      // If all checks pass, return the coupon information
      return existingCoupon;
    } catch (error) {
      throw new Error(`Coupon validation failed: ${error.message}`);
    }
  },
  
 
 
 
 
 
 
 
 
 
 
 
  softDeleteCoupon: async (id) => {
    try {
      const deletedCoupon = await Coupon.findOneAndUpdate(
        { _id: id, deletedAt: null }, // Ensure it hasn't been soft-deleted
        { deletedAt: new Date() },
        { new: true }
      );

      console.log(deletedCoupon,"ffkjhdskjf")
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

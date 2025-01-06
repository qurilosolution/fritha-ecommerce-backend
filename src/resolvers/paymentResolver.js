const OrderService = require("../services/paymentService");
const Order = require("../models/Order"); // Order model for database operations
const Coupon = require("../models/couponModel"); // Import the Coupon model
const { CustomerModel: Customer } = require("../models/customerModel"); // Import the Customer model properly

const paymentResolvers = {
  Query: {
    hello: () => "Welcome to Razorpay GraphQL Integration!",

    getOrders: async () => {
      try {
       const order = await OrderService.getOrders();
       return order
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Fetch order by ID
    getOrderById: async (_, { id }) => {
      try {
        return await OrderService.getOrderById(id);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },

  Mutation: {
    //  createOrder :async (_, { userId, items, totalAmount,paymentId, status, paymentMode, paymentStatus ,shippingAddress } ,context) => {
    //   try {
       
        
        // console.log("User context:", context.user);
      
        // // Ensure the user is logged in and has the "admin" role
        // if (!context.user) {
        //   throw new Error("You must be logged in to update a order.");
        // }
        // if (!context.user.role.includes("admin") && !context.user.role.includes("user")) {
        //   throw new Error("You must be an admin or a user to update an order.");
        // }
        
       
    //     // Call the OrderService to handle order creation
    //     const order = await OrderService.createOrder(
    //       userId,
    //       items,
    //       totalAmount,
    //       paymentId,
    //       status,
    //       paymentMode,
    //       paymentStatus,
    //       shippingAddress
    //     );
       
    //     return order;
    //   } catch (error) {
    //     console.error("Error in createOrder resolver:", error);
    //     throw new Error(error.message || "Failed to create order.");
    //   }
    // },


    createOrder: async (_, { userId, items, totalAmount, paymentId, status, paymentMode, paymentStatus, shippingAddress, couponCode }, context) => {
      try {

             
        console.log("User context:", context.user);
      
        // Ensure the user is logged in and has the "admin" role
        if (!context.user) {
          throw new Error("You must be logged in to update a order.");
        }
        if (!context.user.role.includes("admin") && !context.user.role.includes("customer")) {
          throw new Error("You must be an admin or a user to update an order.");
        }
        
        let discountAmount = 0;
        let coupon = null;
    
        // Check if a coupon is provided
        if (couponCode) {
          // Validate the coupon
          coupon = await Coupon.findOne({ code: couponCode, status: "active" });
          if (!coupon) {
            throw new Error("Invalid or expired coupon code.");
          }
    
          // Check coupon validity dates
          const now = new Date();
          if (now < coupon.startDate || now > coupon.endDate) {
            throw new Error("Coupon is not valid at this time.");
          }
    
          // Calculate the discount amount
          if (coupon.discountPercentage) {
            discountAmount = (totalAmount * coupon.discountPercentage) / 100;
          } else if (coupon.flatDiscount) {
            discountAmount = coupon.flatDiscount;
          }
    
          // Ensure the discount does not exceed the total amount
          if (discountAmount > totalAmount) {
            discountAmount = totalAmount;
          }
    
          // Update the coupon usage for the user
          await Customer.findByIdAndUpdate(
            userId,
            {
              $push: {
                couponUsed: {
                  couponId: coupon._id,
                  usedAt: new Date(),
                  couponUsageCount: 1,
                },
              },
            },
            { new: true }
          );
        }
    
        // Calculate the final total amount after applying the discount
        const finalTotalAmount = totalAmount - discountAmount;
    
        // Create the order
        const order = await OrderService.createOrder(
          userId,
          items,
          finalTotalAmount,
          paymentId,
          status,
          paymentMode,
          paymentStatus,
          shippingAddress,
          { code: couponCode, discountAmount } // Add coupon info to the order
        );
    
        return order;
      } catch (error) {
        console.error("Error in createOrder resolver:", error);
        throw new Error(error.message || "Failed to create order.");
      }
    },




    verifyPayment: async (_, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
      try {
        const verificationResult = await OrderService.verifyPayment(
          
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );

        if (verificationResult.success) {
          // Update the order status in the database to "Paid"
          await Order.findOneAndUpdate(
            { orderId: razorpayOrderId },
            { status: "Paid", paymentId: razorpayPaymentId }
          );
        }

        return verificationResult;
      } catch (error) {
        console.error("Error in verifyPayment resolver:", error);
        throw new Error(error.message || "Failed to verify payment.");
      }
    },

    // Update order status
    updateOrderStatus: async (_, { id, status }) => {
      try {
        return await OrderService.updateOrderStatus(id, status);
      } catch (error) {
        throw new Error(error.message);
      }
    },

    // Delete an order
    deleteOrder: async (_, { id }) => {
      try {
        const deletedOrder = await OrderService.deleteOrder(id);
    
        if (!deletedOrder) {
          throw new Error(`Order with ID ${id} not found.`);
        }
    
        // Return the DeletionResponse object
        return {
          success: true,
          message: `Order with ID ${id} successfully deleted.`,
          success: true,
          message: `Order with ID ${id} successfully deleted.`,
        };
      } catch (error) {
        throw new Error("Failed to delete order: " + error.message);
        throw new Error("Failed to delete order: " + error.message);
      }
    },

    updatePaymentStatus: async (_, { orderId, paymentStatus }) => {
      try {
        const updatedOrder = await OrderService.updatePaymentStatus(orderId, paymentStatus);
        return updatedOrder;
      } catch (error) {
        throw new Error("Failed to update payment status: " + error.message);
      }
    },
    

    

    // Cancel an order
    cancelOrder: async (_, { id }) => {
      try {
        return await OrderService.cancelOrder(id);
      } catch (error) {
        throw new Error(error.message);
      }
    },

   
  },
};

module.exports = paymentResolvers;

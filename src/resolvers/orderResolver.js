const OrderService = require("../services/orderService");
const Order = require("../models/Order"); // Order model for database operations
const Razorpay = require("razorpay");
require("dotenv").config()

const paymentResolvers = {
  Query: {
    getOrdersByAdmin: async (_, { page = 1 }, { user }) => {
      try {
          // Check if the user is an admin
          if (user.role !== 'admin') {
              throw new Error("Access denied. Only admins can view all orders.");
          }
  
          // Fetch orders for admin
          const orderData = await OrderService.getOrdersByAdmin(page);
          return orderData;
      } catch (error) {
          throw new Error("Failed to fetch orders for admin: " + error.message);
      }
  },

  getOrdersByCustomer: async (_, { page = 1 }, { user }) => {
    try {
        // Check if the user is a customer
        if (user.role !== 'customer') {
            throw new Error("Access denied. Only customers can view their orders.");
        }

        // Fetch orders for the logged-in customer
        const orderData = await OrderService.getOrdersByCustomer(page);
        return orderData;
    } catch (error) {
        throw new Error("Failed to fetch orders for customer: " + error.message);
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
    createOrder: async (
      _,
      {
        userId,
        items,
        totalAmount,
        status,
        paymentMode,
        paymentStatus,
        shippingAddress,
      },
      context
    ) => {
      try {
        console.log("create Order")
        console.log("User context:", context.user);
        // // Ensure the user is logged in and has the "admin" role
        // if (!context.user) {
        //   throw new Error("You must be logged in to update a order.");
        // }
        // if (
        //   !context.user.role.includes("admin") &&
        //   !context.user.role.includes("user")
        // ) {
        //   throw new Error("You must be an admin or a user to update an order.");
        // }
        console.log( process.env.RAZORPAY_KEY_ID,process.env.RAZORPAY_SECRET_KEY)
        var instance = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret:process.env.RAZORPAY_SECRET_KEY,
        });
          console.log(totalAmount,"totalamount")
       const newOrder=await instance.orders.create({
          amount: totalAmount,
          currency: "INR",
          receipt: "receipt#1",
        });
         console.log(newOrder.id)
        // Call the OrderService to handle order creation
        const order = await OrderService.createOrder(
          userId,
          items,
          newOrder.id,
          totalAmount,
          status,
          paymentMode,
          paymentStatus,
          shippingAddress
        );
        return order;
      } catch (error) {
        console.error("Error in createOrder resolver:", error);
        throw new Error(error.message || "Failed to create order.");
      }
    },

    verifyPayment: async (
      _,
      { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    ) => {
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
          success: true,
          message: `Order with ID ${id} successfully deleted.`,
        };
      } catch (error) {
        throw new Error("Failed to delete order: " + error.message);
        throw new Error("Failed to delete order: " + error.message);
        throw new Error("Failed to delete order: " + error.message);
      }
    },


    updatePaymentStatus: async (_, { orderId, paymentStatus }) => {
      try {
        const updatedOrder = await OrderService.updatePaymentStatus(
          orderId,
          paymentStatus
        );
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


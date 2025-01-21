const OrderService = require("../services/orderService");
const Order = require("../models/Order"); // Order model for database operations
const Razorpay = require("razorpay");
require("dotenv").config();

const paymentResolvers = {
  Query: {

    async getOrders(_, { status, paymentStatus, startDate, endDate, page = 1, limit = 10 }) {
      try {
        // Call the service function with filters and pagination
        const { orders, totalCount } = await OrderService.getOrdersByDateRange(
          status, 
          paymentStatus, 
          startDate, 
          endDate, 
          page, 
          limit
        );

        // Return both orders and total count
        return {
          orders,
          totalCount,
        };
      } catch (error) {
        console.error("Error fetching orders:", error.message);
        throw new Error("Error fetching orders: " + error.message);
      }
    },

    async getOrderCounts(_, { startDate, endDate }) {
      try {
        // Call the service function to fetch the order counts
        const orderCounts = await OrderService.getOrderCountsByDateRange(startDate, endDate);
        
        // Return the order counts
        return {
          cancelledOrder: orderCounts.cancelledOrder,
          shippedOrder: orderCounts.shippedOrder,
          deliveredOrder: orderCounts.deliveredOrder,
          paymentPaid: orderCounts.paymentPaid,
          paymentUnpaid: orderCounts.paymentUnpaid,
          progressOrder: orderCounts.progressOrder,
        };
      } catch (error) {
        console.error("Error fetching order counts:", error.message);
        throw new Error("Error fetching order counts: " + error.message);
      }
    },
    
    getOrdersByAdmin: async (_, { page = 1 }, { user }) => {
      try {
        // Check if the user is an admin
        if (user.role !== "admin") {
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
        if (user.role !== "customer") {
          throw new Error(
            "Access denied. Only customers can view their orders."
          );
        }

        // Fetch orders for the logged-in customer
        const orderData = await OrderService.getOrdersByCustomer(page);
        return orderData;
      } catch (error) {
        throw new Error(
          "Failed to fetch orders for customer: " + error.message
        );
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
        orderSummary
      },
      context
    ) => {
      try {
        console.log("create Order")
        console.log("User context:", context.user);
        if (!context.user) {
          throw new Error("You must be logged in to create an order.");
        }
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

        const order = await OrderService.createOrder(
          userId,
          items,
          newOrder.id,
          totalAmount,
          status,
          paymentMode,
          paymentStatus,
          shippingAddress,
          orderSummary
        );
        return order;
      } catch (error) {
        console.error("Error creating order:", error);
        throw new Error("Failed to create order.");
      }
    },

    updateOrder : async (
      parent,
      { 
        orderId, 
        userId, 
        items, 
        status, 
        paymentMode, 
        paymentStatus, 
        shippingAddress, 
        orderSummary, 
        cancelledOrder, 
        orderShipped, 
        orderPaid, 
        orderUnpaid, 
        orderCompleted, 
        orderProgress 
      },
      context
    ) => {
      try {
        // Check if the user is logged in
        if (!context.user) {
          throw new Error("You must be logged in to update an order.");
        }
    
        // Call the updateOrder service to perform the business logic
        const updatedOrder = await OrderService.updateOrder(
          orderId,
          userId,
          { 
            items, 
            status, 
            paymentMode, 
            paymentStatus, 
            shippingAddress, 
            orderSummary, 
            cancelledOrder, 
            orderShipped, 
            orderPaid, 
            orderUnpaid, 
            orderCompleted, 
            orderProgress 
          }
        );
    
        return updatedOrder;
      } catch (error) {
        console.error("Error in updateOrder resolver:", error);
        throw new Error("Failed to update order.");
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
        };
      } catch (error) {
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

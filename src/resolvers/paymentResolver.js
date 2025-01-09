const OrderService = require("../services/orderService");
const Order = require("../models/Order"); // Order model for database operations

const paymentResolvers = {
  Query: {
    hello: () => "Welcome to Razorpay GraphQL Integration!",
  },

  Mutation: {
    
    verifyPayment: async (_, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
      try {
       console.log(razorpayOrderId,razorpayPaymentId,razorpaySignature)

        const verificationResult = await OrderService.verifyPayment(
          
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );

        if (verificationResult.success) {
          // Update the order status in the database to "Paid"
          await Order.findOneAndUpdate(
            { orderId: razorpayOrderId },
            { paymentId: razorpayPaymentId }
          );
        }

        return verificationResult;
      } catch (error) {
        console.error("Error in verifyPayment resolver:", error);
        throw new Error(error.message || "Failed to verify payment.");
      }
    },

  

   
  },
};

module.exports = paymentResolvers;

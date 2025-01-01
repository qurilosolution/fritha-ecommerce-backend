 
 

const RazorpayService = require("../services/paymentService");

const paymentResolvers = {
  Query: {
    hello: () => "Welcome to Razorpay GraphQL Integration!",
  },

  Mutation: {
    // Resolver for creating orders
    createOrders: async (_, { amount, currency }) => {
      try {
        const order = await RazorpayService.createOrders(amount, currency);

        return {
          id: order.id,
          entity: order.entity,
          amount: order.amount,
          amount_paid: order.amount_paid,
          amount_due: order.amount_due,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          attempts: order.attempts,
          created_at: order.created_at,
        };
      } catch (error) {
        console.error("Error in createOrders resolver:", error);
        throw new Error(error.message || "Failed to create order.");
      }
    },

    // Resolver for verifying payment
    verifyPayment: async (_, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
      try {
        const verificationResult = RazorpayService.verifyPayment(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );

        return verificationResult;
      } catch (error) {
        console.error("Error in verifyPayment resolver:", error);
        throw new Error(error.message || "Failed to verify payment.");
      }
    },
  },
};

module.exports = paymentResolvers;

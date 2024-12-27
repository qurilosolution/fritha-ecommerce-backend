 

const razorpay = require("../config/RazorpayConfig"); // Razorpay instance
const crypto = require("crypto");

const paymetResolvers = {
  Query: {
    hello: () => "Welcome to Razorpay GraphQL Integration!",
  },

  Mutation: {
    // Create an order in Razorpay
    createOrder: async (_, { amount, currency }) => {
      try {
        console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID); // Check if the key ID is correct
        console.log("RAZORPAY_SECRET_KEY:", process.env.RAZORPAY_SECRET_KEY); // Check if the secret key is correct

        console.log("Razorpay Instance:", razorpay); // Log razorpay instance to check if it's initialized correctly
        if (!razorpay || !razorpay.orders) {
          throw new Error("Razorpay orders API not available.");
        }

        const options = {
          amount: amount * 100, // Amount in paise (1 INR = 100 paise)
          currency: currency || "INR",
          receipt: `receipt_${Date.now()}`, // Unique receipt ID
        };

        const order = await razorpay.orders.create(options); // Create the order

        console.log("Order Created:", order); // Log the created order to see razorpayOrderId
        console.log("razorpayOrderId:", order.id); // Log razorpayOrderId

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
        console.error("Error creating order:", error); // Log detailed error
        throw new Error("Failed to create order. Please try again.");
      }
    },

    // Verify payment
    // verifyPayment: async (
    //   _,
    //   { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    // ) => {
    //   try {
    //     const generatedSignature = crypto
    //       .createHmac("sha256", process.env.RAZORPAY_SECRET_KEY)
    //       .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    //       .digest("hex");

    //     console.log("Generated Signature:", generatedSignature);
    //     console.log("Received Razorpay Signature:", razorpaySignature);

    //     if (generatedSignature === razorpaySignature) {
    //       return {
    //         success: true,
    //         message: "Payment verified successfully!",
    //       };
    //     } else {
    //       return {
    //         success: false,
    //         message: "Payment verification failed. Invalid signature.",
    //       };
    //     }
    //   } catch (error) {
    //     console.error("Error verifying payment:", error);
    //     throw new Error("Failed to verify payment. Please try again.");
    //   }
    // },
  
  
    // verifyPayment: async (
    //     _,
    //     { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    //   ) => {
    //     try {
    //       const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;
      
    //       // Check if the key secret is available
    //       if (!razorpayKeySecret) {
    //         throw new Error("RAZORPAY_KEY_SECRET is not defined in environment variables.");
    //       }
      
    //       const generatedSignature = crypto
    //         .createHmac("sha256", razorpayKeySecret)
    //         .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    //         .digest("hex");
      
    //       console.log("Generated Signature:", generatedSignature);
    //       console.log("Received Razorpay Signature:", razorpaySignature);
      
    //       if (generatedSignature === razorpaySignature) {
    //         return {
    //           success: true,
    //           message: "Payment verified successfully!",
    //         };
    //       } else {
    //         return {
    //           success: false,
    //           message: "Payment verification failed. Invalid signature.",
    //         };
    //       }
    //     } catch (error) {
    //       console.error("Error verifying payment:", error);
    //       throw new Error("Failed to verify payment. Please try again.");
    //     }
    //   }

    verifyPayment: async (_, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
      try {
        const razorpayKeySecret = process.env.RAZORPAY_SECRET_KEY;
    
        if (!razorpayKeySecret) {
          throw new Error("RAZORPAY_SECRET_KEY is not defined in environment variables.");
        }
    
        if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
          throw new Error("Missing required parameters for payment verification.");
        }
    
        const generatedSignature = crypto
          .createHmac("sha256", razorpayKeySecret)
          .update(`${razorpayOrderId}|${razorpayPaymentId}`)
          .digest("hex");
    
        console.log("Generated Signature:", generatedSignature);
        console.log("Received Razorpay Signature:", razorpaySignature);
    
        if (generatedSignature === razorpaySignature) {
          return {
            success: true,
            message: "Payment verified successfully!",
          };
        } else {
          return {
            success: false,
            message: "Payment verification failed. Invalid signature.",
          };
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        return {
          success: false,
          message: error.message || "Failed to verify payment. Please try again.",
        };
      }
    }
      
  },
};

module.exports = paymetResolvers;

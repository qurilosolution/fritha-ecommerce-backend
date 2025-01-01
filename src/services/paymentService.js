const razorpay = require("../config/RazorpayConfig"); // Razorpay instance
const crypto = require("crypto");

const RazorpayService = {
  createOrders: async (amount, currency = "INR") => {
    try {
      if (!razorpay || !razorpay.orders) {
        throw new Error("Razorpay orders API not available.");
      }

      const options = {
        amount: amount * 100, // Amount in paise (1 INR = 100 paise)
        currency: currency,
        receipt: `receipt_${Date.now()}`, // Unique receipt ID
      };

      const order = await razorpay.orders.create(options); // Create the order
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order. Please try again.");
    }
  },

  verifyPayment: (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
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
  },
};

module.exports = RazorpayService;

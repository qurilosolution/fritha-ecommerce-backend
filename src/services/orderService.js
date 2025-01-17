const razorpay = require("../config/RazorpayConfig"); // Razorpay instance
const crypto = require("crypto");
const Order = require("../models/Order"); // Order model
require("dotenv").config();
const OrderService = {


  getOrdersByStatusAndPaymentStatus : async (status, paymentStatus, page = 1, limit = 10) => {
    try {
      const skip = (page - 1) * limit;
  
      // Find orders with the provided status and payment status
      const orders = await Order.find({ status, paymentStatus })
        .skip(skip)
        .limit(limit)
        .exec();
  
      // Count the total number of matching orders for pagination
      const totalOrders = await Order.countDocuments({ status, paymentStatus });
  
      return {
        orders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
      };
    } catch (error) {
      throw new Error("Error retrieving orders: " + error.message);
    }
  },

  // Fetch all orders
  getOrdersByAdmin: async (page = 1) => {
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
      const orders = await Order.find({ deletedAt: null })
        .skip(skip)
        .limit(limit)
        .populate("items.product")
        .populate("items.variant");

      const totalOrders = await Order.countDocuments();
      const totalPages = Math.ceil(totalOrders / limit);

      return {
        orders,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new Error("Failed to fetch orders for admin: " + error.message);
    }
  },
  getOrdersByCustomer: async (page = 1) => {
    const limit = 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ deletedAt: null })
      .skip(skip)
      .limit(limit)
      .populate("items.product")
      .populate("items.variant");

    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    return {
      orders,
      totalPages,
      currentPage: page,
    };
  },

  // Fetch a specific order by ID
  getOrderById: async (id) => {
    try {
      const order = await Order.findById({ _id: id, deletedAt: null })
        .populate({
          path: "items.product",
        })
        .populate({
          path: "items.variant",
        });
      if (!order) {
        throw new Error(`Order with ID ${id} not found.`);
      }
      return order;
    } catch (error) {
      throw new Error("Failed to fetch order by ID: " + error.message);
    }
  },

  // Create a new Razorpay order and save it in the database
  createOrder: async (
    userId,
    items,
    orderId,
    totalAmount,
    status,
    paymentMode,
    paymentStatus,
    shippingAddress,
    orderSummary
    
  ) => {
    try {
      console.log("Creating order...");
      // Calculate subTotal and final total amount

      let orderData = {
        userId,
        items,
        totalAmount,
        paymentMode,
        orderId,
        status: status || "Pending",
        shippingAddress,
        paymentStatus: paymentMode === "COD" ? "Unpaid" : "Processing",
        createdAt: new Date(),
        orderSummary
      };

      // Create Razorpay order
      const options = {
        amount: totalAmount * 100, // Amount in paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`, // Unique receipt ID
      };

      const razorpayOrder = await razorpay.orders.create(options);
      // Add Razorpay-specific details to the order
      orderData.orderId = razorpayOrder.id;
      // Save the order in the database
      const order = (
        await (await Order.create(orderData)).populate("items.product")
      ).populate("items.variant");
      console.log(order);
      return order;
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order. Please try again.");
    }
  },

  updateOrder: async (
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
      orderProgress,
    }
  ) => {
    try {
      // Find the existing order by ID
      const existingOrder = await Order.findById(orderId);
      if (!existingOrder) {
        throw new Error("Order not found.");
      }

      // Ensure that the user is the owner of the order
      if (existingOrder.userId.toString() !== userId) {
        throw new Error("You do not have permission to update this order.");
      }

      // Prepare updated data
      const updatedOrderData = {
        status: status || existingOrder.status,
        paymentMode: paymentMode || existingOrder.paymentMode,
        paymentStatus: paymentStatus || existingOrder.paymentStatus,
        shippingAddress: shippingAddress || existingOrder.shippingAddress,
        orderSummary: orderSummary || existingOrder.orderSummary,
        cancelledOrder: cancelledOrder || existingOrder.cancelledOrder,
        orderShipped: orderShipped || existingOrder.orderShipped,
        orderPaid: orderPaid || existingOrder.orderPaid,
        orderUnpaid: orderUnpaid || existingOrder.orderUnpaid,
        orderCompleted: orderCompleted || existingOrder.orderCompleted,
        orderProgress: orderProgress || existingOrder.orderProgress,
        items: items || existingOrder.items, 
      };

      // Update the order in the database
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        updatedOrderData,
        { new: true }
      )
        .populate("items.product")
        .populate("items.variant");

      return updatedOrder;
    } catch (error) {
      console.error("Error updating order:", error);
      throw new Error("Failed to update order. Please try again.");
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      // Validate the status value
      const validStatuses = [
        "Pending",
        "Placed",
        "Cancelled",
        "Shipped",
        "Packaging",
        "In Progress",
        "Completed",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status value.");
      }

      // Find the order by id and update the status
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status }, // Update the status field
        { new: true } // Return the updated document
      );

      // If no order found, throw an error
      if (!updatedOrder) {
        throw new Error("Order not found.");
      }

      return updatedOrder;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      throw new Error("Failed to update order status. Please try again.");
    }
  },

  updatePaymentStatus: async (orderId, paymentStatus) => {
    try {
      // Find the order by ID
      const order = await Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      // Update the payment status
      order.paymentStatus = paymentStatus;
      order.updatedAt = new Date(); // Update the timestamp

      // Save the updated order
      await order.save();

      return order; // Return the updated order object
    } catch (error) {
      throw new Error("Error updating payment status: " + error.message);
    }
  },

  // Verify Razorpay payment signature
  verifyPayment: async (
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  ) => {
    try {
      //  console.log(razorpayOrderId,razorpayPaymentId,razorpaySignature)
      const razorpayKeySecret = process.env.RAZORPAY_SECRET_KEY;
      console.log("", razorpayKeySecret);
      if (!razorpayKeySecret) {
        throw new Error(
          "RAZORPAY_SECRET_KEY is not defined in environment variables."
        );
      }

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        throw new Error(
          "Missing required parameters for payment verification."
        );
      }

      const generatedSignature = crypto
        .createHmac("sha256", razorpayKeySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (generatedSignature === razorpaySignature) {
        // Update the order status in the database to "Paid"
        const order = await Order.findOneAndUpdate(
          { orderId: razorpayOrderId },
          {
            status: "Placed",
            paymentStatus: "Paid",
            paymentId: razorpayPaymentId,
          },
          { new: true }
        );

        if (!order) {
          throw new Error("Order not found for the given Razorpay order ID.");
        }

        return {
          success: true,
          message: "Payment verified successfully!",
          order,
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

  deleteOrder : async (id) => {
    try {
      const deletedOrder = await Order.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );
  
      if (!deletedOrder) {
        throw new Error(`Order with ID ${id} not found.`);
      }
  
      return deletedOrder; // Return the updated order with deletedAt field set
    } catch (error) {
      throw new Error("Failed to delete order: " + error.message);
    }
  },
  

  cancelOrder: async (id) => {
    try {
      const order = await Order.findById(id);

      if (!order) {
        throw new Error(`Order with ID ${id} not found.`);
      }

      // Check if the order is already canceled or if it's in a state that can't be canceled
      if (order.status === "Cancelled") {
        throw new Error(`Order with ID ${id} is already canceled.`);
      }

      // Update the order status to "Cancelled"
      order.status = "Cancelled";
      await order.save();

      return order;
    } catch (error) {
      throw new Error("Failed to cancel order: " + error.message);
    }
  },
};

module.exports = OrderService;

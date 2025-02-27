const razorpay = require("../config/RazorpayConfig"); // Razorpay instance
const crypto = require("crypto");
const Order = require("../models/Order"); // Order model
require("dotenv").config();
const WebhookService = require("./webhookService");

const InvoiceService = require("./InvoiceService");
const OrderService = {
  getOrdersByDateRange: async (
    status = null,
    paymentStatus = null,
    startDate,
    endDate,
    page = 1,
    limit = 10
  ) => {
    try {
      // Construct query object, only add filters if values are provided
      let query = {};

      if (status) {
        query.status = status;
      }

      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Calculate pagination skip and limit
      const skip = (page - 1) * limit;

      // Fetch the orders based on the constructed query and pagination
      const orders = await Order.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sorting by createdAt in descending order (newest first)

      // Count the total number of orders matching the query
      const totalCount = await Order.countDocuments(query);

      return { orders, totalCount };
    } catch (error) {
      console.error("Error retrieving orders:", error.message);
      throw new Error("Error retrieving orders: " + error.message);
    }
  },

  getOrderCountsByDateRange: async (startDate, endDate) => {
    try {
      // Prepare the filter object based on the provided date range
      const dateFilter = {};
      if (startDate && endDate) {
        dateFilter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      // Aggregate the order counts based on different statuses
      const counts = await Order.aggregate([
        { $match: dateFilter }, // Filter orders based on date range
        {
          $facet: {
            cancelledOrder: [
              { $match: { status: "Cancelled" } },
              { $count: "count" },
            ],
            shippedOrder: [
              { $match: { status: "Shipped" } },
              { $count: "count" },
            ],
            deliveredOrder: [
              { $match: { status: "Delivered" } },
              { $count: "count" },
            ],
            paymentPaid: [
              { $match: { paymentStatus: "Paid" } },
              { $count: "count" },
            ],
            paymentUnpaid: [
              { $match: { paymentStatus: "Unpaid" } },
              { $count: "count" },
            ],
            progressOrder: [
              { $match: { status: "In Progress" } },
              { $count: "count" },
            ],
          },
        },
        {
          $project: {
            cancelledOrder: {
              $ifNull: [{ $arrayElemAt: ["$cancelledOrder.count", 0] }, 0],
            },
            shippedOrder: {
              $ifNull: [{ $arrayElemAt: ["$shippedOrder.count", 0] }, 0],
            },
            deliveredOrder: {
              $ifNull: [{ $arrayElemAt: ["$deliveredOrder.count", 0] }, 0],
            },
            paymentPaid: {
              $ifNull: [{ $arrayElemAt: ["$paymentPaid.count", 0] }, 0],
            },
            paymentUnpaid: {
              $ifNull: [{ $arrayElemAt: ["$paymentUnpaid.count", 0] }, 0],
            },
            progressOrder: {
              $ifNull: [{ $arrayElemAt: ["$progressOrder.count", 0] }, 0],
            },
          },
        },
      ]);

      // If no results, return counts as 0
      return counts.length > 0
        ? counts[0]
        : {
            cancelledOrder: 0,
            shippedOrder: 0,
            deliveredOrder: 0,
            paymentPaid: 0,
            paymentUnpaid: 0,
            progressOrder: 0,
          };
    } catch (error) {
      console.error("Error fetching order counts:", error.message);
      throw new Error("Error fetching order counts: " + error.message);
    }
  },

  // Fetch all orders
  getOrdersByAdmin: async ({
    page = 1,
    status,
    paymentStatus,
    startDate,
    endDate,
  }) => {
    const limit = 10; // Number of orders per page
    const skip = (page - 1) * limit; // Calculate how many orders to skip

    const query = { deletedAt: null }; // Default query to exclude soft-deleted orders

    // Apply status filter if provided
    if (status) {
      query.status = status;
    }

    // Apply paymentStatus filter if provided
    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Apply date range filter correctly
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate), // start date
        $lte: new Date(endDate)    // end date
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) }; 
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) }; 
    }
    
    
    console.log("Query:", JSON.stringify(query, null, 2));

    try {
      // Fetch orders based on the query and apply pagination
      const orders = await Order.find(query)
        .skip(skip)
        .limit(limit)
        .populate("items.product")
        .populate("items.variant");

      // Count total orders matching the query (for pagination calculation)
      const totalOrders = await Order.countDocuments(query);
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

  getOrderCountService: async () => {
    try {
      const count = await Order.countDocuments(); // Fetch the total count of orders
      return count;
    } catch (error) {
      throw new Error("Error in getOrderCountService: " + error.message);
    }
  },

  getOrdersByCustomer: async ({
    page = 1,
    userId,
    status,
    paymentStatus,
    startDate,
    endDate,
  }) => {
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = { deletedAt: null, customer: userId }; // Ensure it fetches orders for the logged-in customer

    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    // Apply date range filter if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    try {
      // Fetch orders based on the query and pagination
      const orders = await Order.find(query)
        .skip(skip)
        .limit(limit)

        .populate("items.product")
        .populate("items.variant");

      const totalOrders = await Order.countDocuments(query); // Count documents based on query
      const totalPages = Math.ceil(totalOrders / limit);

      return {
        orders,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new Error("Failed to fetch orders for customer: " + error.message);
    }
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
    billingAddress,
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
        billingAddress,
        paymentStatus: paymentMode === "COD" ? "Unpaid" : "Processing",
        createdAt: new Date(),
        orderSummary,
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
      billingAddress,
      orderSummary
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
        billingAddress: billingAddress || existingOrder.billingAddress,
        orderSummary: orderSummary || existingOrder.orderSummary,
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
      // Allowed status values
      const validStatuses = [
        "Pending",
        "Placed",
        "Cancelled",
        "Shipped",
        "Packaging",
        "In Progress",
        "Completed",
        "Delivered",
      ];

      if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status value: ${status}`);
      }

      // Update the order status
      const updatedOrder = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      );

      if (!updatedOrder) {
        throw new Error("Order not found.");
      }

      // If order is completed, generate invoice, upload to Cloudinary, and save
      if (status === "Delivered") {
        const invoiceUrl = await InvoiceService.generateAndUploadInvoice(updatedOrder);

        updatedOrder.invoiceUrl = invoiceUrl; // Save invoice URL in DB
        await updatedOrder.save();

        // await WebhookService.sendOrderCompletedWebhook(updatedOrder);
      }

      return updatedOrder;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      throw new Error("Failed to update order status. Please try again.");
    }
  },

  getInvoice: async (id) => {
    try {
      const order = await Order.findById(id);
      if (!order) throw new Error("Order not found.");
      if (!order.invoiceUrl) throw new Error("Invoice not generated.");
      return order.invoiceUrl; // Return Cloudinary invoice URL
    } catch (error) {
      console.error("Error fetching invoice:", error.message);
      throw new Error(error.message);
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

  deleteOrder: async (id) => {
    try {
      const deletedOrder = await Order.findByIdAndUpdate(
        id,
        { deletedAt: new Date() },
        { new: true }
      );

      if (!deletedOrder) {
        throw new Error(`Order with ID ${id} not found.`);
      }
      console.log('Deleted Order:', deletedOrder);
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

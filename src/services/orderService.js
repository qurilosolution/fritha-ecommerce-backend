const Order = require("../models/Order");
const Product = require("../models/Product");

const orderService = {
  // Fetch all orders
  getOrders: async () => {
    try {
      const orders = await Order.find().populate({
        path: "products.product",
        select: "name price discount mrp",
      });
      return orders;
    } catch (error) {
      throw new Error("Failed to fetch orders: " + error.message);
    }
  },

  // Fetch a single order by ID
  getOrderById: async (id) => {
    try {
      const order = await Order.findById(id).populate({
        path: "products.product",
        select: "name price discount mrp",
      });
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (error) {
      throw new Error("Failed to fetch order: " + error.message);
    }
  },

  createOrder: async (customer, products, status) => {
    try {
      let totalAmount = 0;

      const orderProducts = await Promise.all(
        products.map(async (orderProduct) => {
          const product = await Product.findById(orderProduct.product);
          if (!product) {
            throw new Error(
              `Product with ID ${orderProduct.product} not found.`
            );
          }

          
          // Calculate total amount based on MRP and quantity
          const productTotal = product.mrp * orderProduct.quantity;
          totalAmount += productTotal;

          
          return {
            product: product._id,
            quantity: orderProduct.quantity,
            price: product.price,
            discount: product.discount,
            mrp: product.mrp,
          };
        })
      );
     
      // Create and save the order
      const order = new Order({
        customer,
        products: orderProducts,
        totalAmount,
        status,
      });

      await order.save();
      return order;
    } catch (error) {
      throw new Error("Failed to create order: " + error.message);
    }
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    try {
      const order = await Order.findById(id);
      if (!order) {
        throw new Error("Order not found");
      }

      order.status = status;
      await order.save();
      console.log("Order Created:", order);
      return order;
    } catch (error) {
      throw new Error("Failed to update order status: " + error.message);
    }
  },

  // Delete an order
  deleteOrder: async (id) => {
    try {
      const order = await Order.findByIdAndDelete(id);
      if (!order) {
        throw new Error("Order not found");
      }
      return { success: true, message: "Order deleted successfully" };
    } catch (error) {
      throw new Error("Failed to delete order: " + error.message);
    }
  },
};

module.exports = orderService;

const OrderService = require("../services/orderService");

const orderResolver = {
  Query: {
    // Fetch all orders
    getOrders: async () => {
      try {
        return await OrderService.getOrders();
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
    // Create a new order
    createOrder: async (_, { customer, products, status }) => {
      try {
        return await OrderService.createOrder(customer, products, status);
      } catch (error) {
        throw new Error(error.message);
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
        return await OrderService.deleteOrder(id);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
};

module.exports = orderResolver;

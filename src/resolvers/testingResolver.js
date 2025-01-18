const { CustomerModel } = require('../models/customerModel'); // Adjust the import based on your file structure

const testResolver = {
  Query: {
    async getCustomer(_, { id }) {
      return await CustomerModel.findById(id).populate('couponUsed.couponId');
    },
    async listCustomers() {
      return await CustomerModel.find().populate('couponUsed.couponId');
    },
  },

  Mutation: {
    async createCustomer(_, { input }) {
      const newCustomer = new CustomerModel(input);
      return await newCustomer.save();
    },

    async updateCustomer(_, { id, input }) {
      return await CustomerModel.findByIdAndUpdate(id, input, { new: true });
    },

    async addAddress(_, { customerId, address }) {
      const customer = await CustomerModel.findById(customerId);
      customer.addresses.push(address);
      return await customer.save();
    },

    async addCouponUsage(_, { customerId, couponUsage }) {
      const customer = await CustomerModel.findById(customerId);
      customer.couponUsed.push(couponUsage);
      return await customer.save();
    },
  },
};

module.exports = testResolver;

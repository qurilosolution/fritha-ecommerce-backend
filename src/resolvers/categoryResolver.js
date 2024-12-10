const categoryService = require('../services/categoryService');

const categoryResolver = {
  Query: {
    getCategories: categoryService.getCategories,
    getCategoryById: categoryService.getCategoryById,
  },
  Mutation: {
    createCategory: categoryService.createCategory,
    updateCategory: categoryService.updateCategory,
    deleteCategory: categoryService.deleteCategory,
  },
};

module.exports = categoryResolver;

const subcategoryService = require('../services/subcategoryService');

const subcategoryResolver = {
  Mutation: {
    createSubcategory: subcategoryService.createSubcategory,
    updateSubcategory: subcategoryService.updateSubcategory,
    deleteSubcategory: subcategoryService.deleteSubcategory,
  },
};

module.exports = subcategoryResolver;

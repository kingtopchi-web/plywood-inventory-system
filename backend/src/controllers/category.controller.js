const Category = require('../models/Category.model');
const { createCatalogController } = require('./catalog.factory');

module.exports = createCatalogController(Category, {
  resourceName: 'Category',
  searchFields: ['name', 'code'],
});

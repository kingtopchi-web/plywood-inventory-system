const Subcategory = require('../models/Subcategory.model');
const { createCatalogController } = require('./catalog.factory');

module.exports = createCatalogController(Subcategory, {
  resourceName: 'Subcategory',
  searchFields: ['name', 'code'],
  populate: [{ path: 'categoryId', select: 'name code' }],
});

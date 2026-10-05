const Brand = require('../models/Brand.model');
const { createCatalogController } = require('./catalog.factory');

module.exports = createCatalogController(Brand, {
  resourceName: 'Brand',
  searchFields: ['name', 'code'],
});

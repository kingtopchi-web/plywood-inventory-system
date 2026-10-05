const Branch = require('../models/Branch.model');
const { createCatalogController } = require('./catalog.factory');

module.exports = createCatalogController(Branch, {
  resourceName: 'Branch',
  searchFields: ['name', 'branchCode', 'city', 'phone'],
});

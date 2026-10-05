const Product = require('../models/Product.model');
const { createCatalogController } = require('./catalog.factory');

const mapProductBody = (body) => {
  const data = { ...body };
  if (data.subcategoryId && !data.subCategoryId) {
    data.subCategoryId = data.subcategoryId;
  }
  delete data.subcategoryId;
  if (data.lowStockAlert != null && (data.minimumStock == null || data.minimumStock === '')) {
    data.minimumStock = data.lowStockAlert;
  }
  return data;
};

module.exports = createCatalogController(Product, {
  resourceName: 'Product',
  searchFields: ['name', 'SKU'],
  populate: [
    { path: 'categoryId', select: 'name code' },
    { path: 'subCategoryId', select: 'name code' },
    { path: 'brandId', select: 'name code' },
    { path: 'unitId', select: 'name code' },
  ],
  mapBody: mapProductBody,
});

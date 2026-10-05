const Unit = require('../models/Unit.model');
const { createCatalogController } = require('./catalog.factory');

module.exports = createCatalogController(Unit, {
  resourceName: 'Unit',
  searchFields: ['name', 'code'],
  mapBody: (body) => {
    const data = { ...body };
    if (!data.code && data.shortName) data.code = data.shortName;
    delete data.shortName;
    return data;
  },
});

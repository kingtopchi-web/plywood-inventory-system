const fs = require('fs');
const path = require('path');

const adminSrcDir = path.join(__dirname, '../admin/src/pages');

const pages = {
  branches: {
    file: 'BranchPage.jsx',
    title: 'Branches',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'branchCode', label: 'Branch Code', required: true },
      { name: 'phone', label: 'Phone' },
      { name: 'managerName', label: 'Manager Name' },
      { name: 'address', label: 'Address' },
      { name: 'city', label: 'City' },
      { name: 'state', label: 'State' },
      { name: 'pincode', label: 'Pincode' },
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'branchCode', label: 'Code' },
      { key: 'managerName', label: 'Manager' },
      { key: 'phone', label: 'Phone' }
    ]
  },
  categories: {
    file: 'CategoryPage.jsx',
    title: 'Categories',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'code', label: 'Code', required: true },
      { name: 'description', label: 'Description' }
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'status', label: 'Status' }
    ]
  },
  subcategories: {
    file: 'SubcategoryPage.jsx',
    title: 'Subcategories',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'code', label: 'Code', required: true },
      { name: 'categoryId', label: 'Category ID', required: true },
      { name: 'description', label: 'Description' }
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' },
      { key: 'categoryId', label: 'Category', render: "item => item.categoryId?.name || item.categoryId" },
      { key: 'status', label: 'Status' }
    ]
  },
  brands: {
    file: 'BrandPage.jsx',
    title: 'Brands',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'code', label: 'Code', required: true },
      { name: 'description', label: 'Description' }
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'code', label: 'Code' }
    ]
  },
  units: {
    file: 'UnitPage.jsx',
    title: 'Units',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'shortName', label: 'Short Name', required: true }
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'shortName', label: 'Short Name' }
    ]
  },
  products: {
    file: 'ProductPage.jsx',
    title: 'Products',
    fields: [
      { name: 'name', label: 'Name', required: true },
      { name: 'SKU', label: 'SKU', required: true },
      { name: 'categoryId', label: 'Category ID', required: true },
      { name: 'subcategoryId', label: 'Subcategory ID' },
      { name: 'brandId', label: 'Brand ID', required: true },
      { name: 'unitId', label: 'Unit ID', required: true },
      { name: 'sellingPrice', label: 'Selling Price', required: true, type: 'number' },
      { name: 'basePrice', label: 'Base Price', required: true, type: 'number' },
      { name: 'description', label: 'Description' }
    ],
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'SKU', label: 'SKU' },
      { key: 'categoryId', label: 'Category', render: "item => item.categoryId?.name || item.categoryId" },
      { key: 'brandId', label: 'Brand', render: "item => item.brandId?.name || item.brandId" },
      { key: 'sellingPrice', label: 'Price', render: "item => '₹' + item.sellingPrice" }
    ]
  }
};

Object.entries(pages).forEach(([folder, config]) => {
  const serviceName = folder === 'branches' ? 'branchService' : 
                      folder === 'categories' ? 'categoryService' : 
                      folder === 'subcategories' ? 'subcategoryService' : 
                      folder === 'brands' ? 'brandService' : 
                      folder === 'units' ? 'unitService' : 'productService';
  
  const stateInitial = {};
  config.fields.forEach(f => {
    stateInitial[f.name] = f.type === 'number' ? 0 : '';
  });

  const inputsCode = config.fields.map(f => {
    const val = f.type === 'number' ? 'Number(e.target.value)' : 'e.target.value';
    const typeStr = f.type === 'number' ? 'number' : 'text';
    const reqStr = f.required ? 'required ' : '';
    return '            <Input label="' + f.label + '" ' + reqStr + 'type="' + typeStr + '" value={formData.' + f.name + '} onChange={e => setFormData({...formData, ' + f.name + ': ' + val + '})} />';
  }).join('\n');

  const columnsCode = config.columns.map(c => {
    if (c.render) {
      return '    { key: "' + c.key + '", label: "' + c.label + '", render: ' + c.render + ' }';
    }
    return '    { key: "' + c.key + '", label: "' + c.label + '" }';
  }).join(',\n');

  const titleReplaced = config.title.replace(/ies$/, 'y').replace(/es$/, '').replace(/s$/, '');
  const stateInitStr = JSON.stringify(stateInitial, null, 4);

  const content = [
    "import React, { useState, useEffect } from 'react';",
    "import { PageHeader, Table, Button, Input } from '../../components/common';",
    "import " + serviceName + " from '../../services/" + serviceName + "';",
    "import { useToast } from '../../components/common/Toast';",
    "",
    "const " + titleReplaced + "Page = () => {",
    "  const [data, setData] = useState([]);",
    "  const [loading, setLoading] = useState(true);",
    "  const [showAdd, setShowAdd] = useState(false);",
    "  const { addToast } = useToast();",
    "",
    "  const [formData, setFormData] = useState(" + stateInitStr + ");",
    "",
    "  useEffect(() => {",
    "    loadData();",
    "  }, []);",
    "",
    "  const loadData = async () => {",
    "    try {",
    "      setLoading(true);",
    "      const res = await " + serviceName + ".getAll();",
    "      setData(res.data?.docs || res.data || res || []);",
    "    } catch (err) {",
    "      addToast('error', 'Failed to load data');",
    "    } finally {",
    "      setLoading(false);",
    "    }",
    "  };",
    "",
    "  const handleSubmit = async (e) => {",
    "    e.preventDefault();",
    "    try {",
    "      await " + serviceName + ".create(formData);",
    "      addToast('success', '" + titleReplaced + " created successfully');",
    "      setShowAdd(false);",
    "      setFormData(" + stateInitStr + ");",
    "      loadData();",
    "    } catch (err) {",
    "      addToast('error', err.response?.data?.message || 'Failed to create');",
    "    }",
    "  };",
    "",
    "  const columns = [",
    columnsCode,
    "  ];",
    "",
    "  return (",
    "    <div className='page-container'>",
    "      <PageHeader",
    "        title='" + config.title + " Management'",
    "        actions={<Button onClick={() => setShowAdd(!showAdd)}>+ Add " + titleReplaced + "</Button>}",
    "      />",
    "",
    "      {showAdd && (",
    "        <div className='card' style={{ padding: '24px', marginBottom: '24px' }}>",
    "          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>",
    inputsCode,
    "            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>",
    "              <Button variant='secondary' onClick={() => setShowAdd(false)}>Cancel</Button>",
    "              <Button type='submit'>Save</Button>",
    "            </div>",
    "          </form>",
    "        </div>",
    "      )}",
    "",
    "      <Table columns={columns} data={data} loading={loading} />",
    "    </div>",
    "  );",
    "};",
    "",
    "export default " + titleReplaced + "Page;"
  ].join('\n');

  const destPath = path.join(adminSrcDir, folder, config.file);
  if (!fs.existsSync(path.dirname(destPath))) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
  }
  fs.writeFileSync(destPath, content);
});

console.log('Catalog pages scaffolded with forms successfully');

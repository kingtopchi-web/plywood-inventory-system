import { confirmDelete } from '../../utils/confirmDelete';
import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Button, Input, Select, Modal } from '../../components/common';
import { Trash2, Edit2 } from 'lucide-react';
import productService from '../../services/productService';
import categoryService from '../../services/categoryService';
import subcategoryService from '../../services/subcategoryService';
import brandService from '../../services/brandService';
import unitService from '../../services/unitService';
import { useToast } from '../../components/common/Toast';

const emptyForm = {
  name: '', SKU: '', categoryId: '', subcategoryId: '',
  brandId: '', unitId: '', sellingPrice: '', basePrice: '', description: ''
};

const ProductPage = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    loadDropdowns();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await productService.getAll();
      setData(res?.data?.docs || res?.data || []);
    } catch (err) {
      addToast('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [catRes, subRes, brandRes, unitRes] = await Promise.all([
        categoryService.getAll({ limit: 100 }),
        subcategoryService.getAll({ limit: 100 }),
        brandService.getAll({ limit: 100 }),
        unitService.getAll({ limit: 100 }),
      ]);
      setCategories(catRes?.data?.docs || catRes?.data || []);
      setSubcategories(subRes?.data?.docs || subRes?.data || []);
      setBrands(brandRes?.data?.docs || brandRes?.data || []);
      setUnits(unitRes?.data?.docs || unitRes?.data || []);
    } catch (err) { /* silent */ }
  };

  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.brandId) {
      addToast('error', 'Please fill all required fields'); return;
    }
    try {
      setSaving(true);
      const payload = {
        ...formData,
        sellingPrice: Number(formData.sellingPrice),
        basePrice: Number(formData.basePrice),
      };
      if (editId) {
        await productService.update(editId, payload);
        addToast('success', 'Product updated successfully');
      } else {
        await productService.create(payload);
        addToast('success', 'Product created successfully');
      }
      setShowModal(false);
      setFormData(emptyForm);
      setEditId(null);
      loadData();
    } catch (err) {
      addToast('error', err.message || `Failed to ${editId ? 'update' : 'create'} product`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      SKU: row.SKU,
      categoryId: row.categoryId?._id || row.categoryId || '',
      subcategoryId: row.subcategoryId?._id || row.subcategoryId || '',
      brandId: row.brandId?._id || row.brandId || '',
      unitId: row.unitId?._id || row.unitId || '',
      sellingPrice: row.sellingPrice || '',
      basePrice: row.basePrice || '',
      description: row.description || ''
    });
    setEditId(row._id);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    const isConfirmed = await confirmDelete(row.name || row.productId?.name || 'this item');
    if (!isConfirmed) return;
    try {
      await productService.remove(row._id);
      addToast('success', 'Product deleted');
      loadData();
    } catch (err) {
      addToast('error', err.message || 'Failed to delete');
    }
  };



  const filteredSubcategories = formData.categoryId
    ? subcategories.filter(s => String(s.categoryId?._id || s.categoryId) === formData.categoryId)
    : subcategories;

  const columns = [
    { key: 'name', label: 'Product Name' },
    { key: 'SKU', label: 'SKU' },
    { key: 'categoryId', label: 'Category', render: (row) => row.categoryId?.name || '—' },
    { key: 'brandId', label: 'Brand', render: (row) => row.brandId?.name || '—' },
    { key: 'sellingPrice', label: 'Price', render: (row) => `₹${row.sellingPrice || 0}` },
    { key: 'status', label: 'Status' },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => handleEdit(row)}>
            <Edit2 size={14} /> Edit
          </button>
          <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={() => handleDelete(row)}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Products Management"
        actions={<Button onClick={() => { setFormData(emptyForm); setEditId(null); setShowModal(true); }}>+ Add Product</Button>}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Product' : 'New Product'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '10px 0' }}>
          <Select
            label="Category *"
            required
            value={formData.categoryId}
            onChange={set('categoryId')}
            placeholder={false}
            options={[
              { label: '-- Select Category --', value: '' },
              ...categories.map(c => ({ label: c.name, value: c._id }))
            ]}
          />

          <Select
            label="Subcategory"
            value={formData.subcategoryId}
            onChange={set('subcategoryId')}
            placeholder={false}
            options={[
              { label: '-- Select Subcategory --', value: '' },
              ...filteredSubcategories.map(s => ({ label: s.name, value: s._id }))
            ]}
          />

          <Select
            label="Brand *"
            required
            value={formData.brandId}
            onChange={set('brandId')}
            placeholder={false}
            options={[
              { label: '-- Select Brand --', value: '' },
              ...brands.map(b => ({ label: b.name, value: b._id }))
            ]}
          />

          <Select
            label="Unit"
            value={formData.unitId}
            onChange={set('unitId')}
            placeholder={false}
            options={[
              { label: '-- Select Unit --', value: '' },
              ...units.map(u => ({ label: `${u.name} (${u.code})`, value: u._id }))
            ]}
          />

          <Input label="Product Name" required value={formData.name} onChange={set('name')} />
          <Input label="SKU" required value={formData.SKU} onChange={set('SKU')} placeholder="Unique product code" />

          <Input label="Base Price (₹)" required type="number" min="0" value={formData.basePrice} onChange={set('basePrice')} />
          <Input label="Selling Price (₹)" required type="number" min="0" value={formData.sellingPrice} onChange={set('sellingPrice')} />

          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Description" value={formData.description} onChange={set('description')} />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update Product' : 'Save Product')}</Button>
          </div>
        </form>
      </Modal>

      <Table columns={columns} data={data} loading={loading} />
    </div>
  );
};

export default ProductPage;

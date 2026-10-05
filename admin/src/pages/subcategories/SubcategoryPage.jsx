import { confirmDelete } from '../../utils/confirmDelete';
import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Button, Input, Select, Modal } from '../../components/common';
import { Trash2, Edit2 } from 'lucide-react';
import subcategoryService from '../../services/subcategoryService';
import categoryService from '../../services/categoryService';
import { useToast } from '../../components/common/Toast';

const emptyForm = { name: '', code: '', categoryId: '', description: '' };

const SubcategoryPage = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await subcategoryService.getAll();
      setData(res?.data?.docs || res?.data || []);
    } catch (err) {
      addToast('error', 'Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await categoryService.getAll({ limit: 100 });
      setCategories(res?.data?.docs || res?.data || []);
    } catch (err) { /* silent */ }
  };

  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) { addToast('error', 'Please select a category'); return; }
    try {
      setSaving(true);
      if (editId) {
        await subcategoryService.update(editId, formData);
        addToast('success', 'Subcategory updated successfully');
      } else {
        await subcategoryService.create(formData);
        addToast('success', 'Subcategory created successfully');
      }
      setShowModal(false);
      setFormData(emptyForm);
      setEditId(null);
      loadData();
    } catch (err) {
      addToast('error', err.message || `Failed to ${editId ? 'update' : 'create'} subcategory`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      code: row.code,
      categoryId: row.categoryId?._id || row.categoryId || '',
      description: row.description || ''
    });
    setEditId(row._id);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    const isConfirmed = await confirmDelete(row.name || row.productId?.name || 'this item');
    if (!isConfirmed) return;
    try {
      await subcategoryService.remove(row._id);
      addToast('success', 'Subcategory deleted');
      loadData();
    } catch (err) {
      addToast('error', err.message || 'Failed to delete');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'categoryId', label: 'Category', render: (row) => row.categoryId?.name || '—' },
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
        title="Subcategories Management"
        actions={<Button onClick={() => { setFormData(emptyForm); setEditId(null); setShowModal(true); }}>+ Add Subcategory</Button>}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Subcategory' : 'New Subcategory'}>
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
          <Input label="Subcategory Name" required value={formData.name} onChange={set('name')} />
          <Input label="Code (e.g. BWR)" required value={formData.code} onChange={set('code')} placeholder="Uppercase, unique" />
          <Input label="Description" value={formData.description} onChange={set('description')} />
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update Subcategory' : 'Save Subcategory')}</Button>
          </div>
        </form>
      </Modal>

      <Table columns={columns} data={data} loading={loading} />
    </div>
  );
};

export default SubcategoryPage;

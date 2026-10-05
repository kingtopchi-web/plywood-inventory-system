import { confirmDelete } from '../../utils/confirmDelete';
import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Button, Input, Modal } from '../../components/common';
import { Trash2, Edit2 } from 'lucide-react';
import categoryService from '../../services/categoryService';
import { useToast } from '../../components/common/Toast';

const emptyForm = { name: '', code: '', description: '' };

const CategoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const { addToast } = useToast();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll();
      setData(res?.data?.docs || res?.data || []);
    } catch (err) {
      addToast('error', 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setFormData(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editId) {
        await categoryService.update(editId, formData);
        addToast('success', 'Category updated successfully');
      } else {
        await categoryService.create(formData);
        addToast('success', 'Category created successfully');
      }
      setShowModal(false);
      setFormData(emptyForm);
      setEditId(null);
      loadData();
    } catch (err) {
      addToast('error', err.message || `Failed to ${editId ? 'update' : 'create'} category`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setFormData({ name: row.name, code: row.code, description: row.description || '' });
    setEditId(row._id);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    const isConfirmed = await confirmDelete(row.name || row.productId?.name || 'this item');
    if (!isConfirmed) return;
    try {
      await categoryService.remove(row._id);
      addToast('success', 'Category deleted');
      loadData();
    } catch (err) {
      addToast('error', err.message || 'Failed to delete');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'code', label: 'Code' },
    { key: 'description', label: 'Description' },
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
        title="Categories Management"
        actions={<Button onClick={() => { setFormData(emptyForm); setEditId(null); setShowModal(true); }}>+ Add Category</Button>}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Category' : 'New Category'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '10px 0' }}>
          <Input label="Category Name" required value={formData.name} onChange={set('name')} />
          <Input label="Code (e.g. PLY)" required value={formData.code} onChange={set('code')} placeholder="Uppercase, unique" />
          <div style={{ gridColumn: 'span 2' }}>
            <Input label="Description" value={formData.description} onChange={set('description')} />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update Category' : 'Save Category')}</Button>
          </div>
        </form>
      </Modal>

      <Table columns={columns} data={data} loading={loading} />
    </div>
  );
};

export default CategoryPage;

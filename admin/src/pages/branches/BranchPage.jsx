import { confirmDelete } from '../../utils/confirmDelete';
import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Button, Input, Modal } from '../../components/common';
import { Trash2, Edit2 } from 'lucide-react';
import branchService from '../../services/branchService';
import { useToast } from '../../components/common/Toast';

const emptyForm = {
  name: '', branchCode: '', phone: '', managerName: '',
  address: '', city: '', state: '', pincode: ''
};

const BranchPage = () => {
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
      const res = await branchService.getAll();
      setData(res?.data?.docs || res?.data || []);
    } catch (err) {
      addToast('error', 'Failed to load branches');
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
        await branchService.update(editId, formData);
        addToast('success', 'Branch updated successfully');
      } else {
        await branchService.create(formData);
        addToast('success', 'Branch created successfully');
      }
      setShowModal(false);
      setFormData(emptyForm);
      setEditId(null);
      loadData();
    } catch (err) {
      addToast('error', err.message || `Failed to ${editId ? 'update' : 'create'} branch`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (row) => {
    setFormData({
      name: row.name,
      branchCode: row.branchCode,
      phone: row.phone || '',
      managerName: row.managerName || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      pincode: row.pincode || ''
    });
    setEditId(row._id);
    setShowModal(true);
  };

  const handleDelete = async (row) => {
    const isConfirmed = await confirmDelete(row.name || row.productId?.name || 'this item');
    if (!isConfirmed) return;
    try {
      await branchService.remove(row._id);
      addToast('success', 'Branch deleted');
      loadData();
    } catch (err) {
      addToast('error', err.message || 'Failed to delete branch');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'branchCode', label: 'Code' },
    { key: 'city', label: 'City' },
    { key: 'managerName', label: 'Manager' },
    { key: 'phone', label: 'Phone' },
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
        title="Branches Management"
        actions={<Button onClick={() => { setFormData(emptyForm); setEditId(null); setShowModal(true); }}>+ Add Branch</Button>}
      />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Branch' : 'New Branch'}>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '10px 0' }}>
          <Input label="Branch Name" required value={formData.name} onChange={set('name')} />
          <Input label="Branch Code" required value={formData.branchCode} onChange={set('branchCode')} />
          <Input label="Phone" value={formData.phone} onChange={set('phone')} />
          <Input label="Manager Name" value={formData.managerName} onChange={set('managerName')} />
          <Input label="Address" value={formData.address} onChange={set('address')} />
          <Input label="City" value={formData.city} onChange={set('city')} />
          <Input label="State" value={formData.state} onChange={set('state')} />
          <Input label="Pincode" value={formData.pincode} onChange={set('pincode')} />
          <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <Button variant="secondary" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : (editId ? 'Update Branch' : 'Save Branch')}</Button>
          </div>
        </form>
      </Modal>

      <Table columns={columns} data={data} loading={loading} />
    </div>
  );
};

export default BranchPage;

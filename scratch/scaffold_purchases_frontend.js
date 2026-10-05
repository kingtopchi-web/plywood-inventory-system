const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../admin/src/services');
const pagesDir = path.join(__dirname, '../admin/src/pages/purchases');

if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

const purchaseServiceContent = `import api from './api';

const purchaseService = {
  // Suppliers
  createSupplier: async (data) => {
    const response = await api.post('/purchases/suppliers', data);
    return response.data.data;
  },
  getSuppliers: async () => {
    const response = await api.get('/purchases/suppliers');
    return response.data.data;
  },

  // Purchase Orders
  createOrder: async (data) => {
    const response = await api.post('/purchases/orders', data);
    return response.data.data;
  },
  getOrders: async (filters = {}) => {
    const response = await api.get('/purchases/orders', { params: filters });
    return response.data.data;
  },

  // Purchase Receipts
  createReceipt: async (data) => {
    const response = await api.post('/purchases/receipts', data);
    return response.data.data;
  },

  // Supplier Payments
  createPayment: async (data) => {
    const response = await api.post('/purchases/payments', data);
    return response.data.data;
  }
};

export default purchaseService;
`;

const supplierPageContent = `import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Button, Input } from '../../components/common';
import purchaseService from '../../services/purchaseService';
import { useToast } from '../../components/common/Toast';

export const SupplierPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '', company: '', phone: '', email: '', address: '', GST: '', paymentTerms: '', openingBalance: 0
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await purchaseService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      addToast('error', 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await purchaseService.createSupplier(formData);
      addToast('success', 'Supplier created successfully');
      setShowAdd(false);
      fetchSuppliers();
    } catch (err) {
      addToast('error', err.response?.data?.message || 'Failed to create supplier');
    }
  };

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'phone', label: 'Phone' },
    { key: 'GST', label: 'GST' },
    { key: 'openingBalance', label: 'Opening Bal', render: (s) => \`₹\${s.openingBalance}\` }
  ];

  return (
    <div>
      <PageHeader 
        title="Supplier Management" 
        actions={<Button onClick={() => setShowAdd(!showAdd)}>+ Add Supplier</Button>}
      />

      {showAdd && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            <Input label="Company" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
            <Input label="Phone" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <Input label="GST" value={formData.GST} onChange={e => setFormData({...formData, GST: e.target.value})} />
            <Input label="Payment Terms" value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})} />
            <Input label="Opening Balance" type="number" value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: Number(e.target.value)})} />
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit">Save Supplier</Button>
            </div>
          </form>
        </div>
      )}

      <Table columns={columns} data={suppliers} loading={loading} />
    </div>
  );
};
`;

const poPageContent = `import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Button } from '../../components/common';
import purchaseService from '../../services/purchaseService';
import { useToast } from '../../components/common/Toast';

export const PurchaseOrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await purchaseService.getOrders();
      setOrders(data);
    } catch (err) {
      addToast('error', 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'poNumber', label: 'PO Number' },
    { key: 'supplierId', label: 'Supplier', render: (po) => po.supplierId?.name },
    { key: 'branchId', label: 'Branch', render: (po) => po.branchId?.name },
    { key: 'orderDate', label: 'Date', render: (po) => new Date(po.orderDate).toLocaleDateString() },
    { key: 'totalAmount', label: 'Total', render: (po) => \`₹\${po.totalAmount}\` },
    { key: 'status', label: 'Status' }
  ];

  return (
    <div>
      <PageHeader 
        title="Purchase Orders" 
        actions={<Button onClick={() => addToast('info', 'PO creation UI coming next.')}>+ Create PO</Button>}
      />
      <Table columns={columns} data={orders} loading={loading} />
    </div>
  );
};
`;

fs.writeFileSync(path.join(apiDir, 'purchaseService.js'), purchaseServiceContent);
fs.writeFileSync(path.join(pagesDir, 'SupplierPage.jsx'), supplierPageContent);
fs.writeFileSync(path.join(pagesDir, 'PurchaseOrderPage.jsx'), poPageContent);

console.log('Frontend purchases files created');

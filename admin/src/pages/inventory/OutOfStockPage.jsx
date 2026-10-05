import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Select, Button } from '../../components/common';
import { useToast } from '../../components/common/Toast';
import inventoryService from '../../services/inventoryService';
import branchService from '../../services/branchService';

export const OutOfStockPage = () => {
  const [items, setItems] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    fetchOutOfStock();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll({ limit: 100, status: 'ACTIVE' });
      setBranches(res?.data?.docs || res?.data || []);
    } catch {
      // non-critical
    }
  };

  const fetchOutOfStock = async () => {
    try {
      setLoading(true);
      const params = selectedBranch ? { branchId: selectedBranch } : {};
      const res = await inventoryService.getOutOfStockAlerts(params);
      setItems(res?.data || []);
    } catch (err) {
      addToast(err.message || 'Failed to load out-of-stock items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'branch',
      label: 'Branch',
      render: (row) => row.branch?.name || '—',
    },
    {
      key: 'product',
      label: 'Product',
      render: (row) => row.product?.name || '—',
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {row.product?.SKU || '—'}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Current Qty',
      render: (row) => (
        <span style={{ fontWeight: 700, color: '#ef4444' }}>{row.quantity ?? 0}</span>
      ),
    },
    {
      key: 'minimumStock',
      label: 'Min Stock',
      render: (row) => row.product?.minimumStock ?? '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Out of Stock"
        subtitle={`Products with zero quantity${items.length ? ` — ${items.length} items` : ''}`}
      />

      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
        }}
      >
        <div style={{ minWidth: '240px' }}>
          <Select
            label="Filter by Branch"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            options={[
              { label: 'All Branches', value: '' },
              ...branches.map((b) => ({ label: `${b.branchCode} – ${b.name}`, value: b._id })),
            ]}
          />
        </div>
        <div style={{ paddingBottom: '4px' }}>
          <Button variant="secondary" onClick={fetchOutOfStock}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="card">
        <Table columns={columns} data={items} isLoading={loading} />
      </div>
    </div>
  );
};

export default OutOfStockPage;

import { confirmDelete } from '../../utils/confirmDelete';
import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Pagination, Select, Input, Badge } from '../../components/common';
import { Trash2 } from 'lucide-react';
import { useToast } from '../../components/common/Toast';
import inventoryService from '../../services/inventoryService';
import branchService from '../../services/branchService';

const StockStatusBadge = ({ status }) => {
  const map = {
    IN_STOCK:    { label: 'In Stock',    color: '#10b981', bg: '#d1fae5' },
    LOW_STOCK:   { label: 'Low Stock',   color: '#f97316', bg: '#ffedd5' },
    OUT_OF_STOCK:{ label: 'Out of Stock',color: '#ef4444', bg: '#fee2e2' },
  };
  const s = map[status] || map.IN_STOCK;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '0.78rem',
      fontWeight: 700,
      color: s.color,
      background: s.bg,
    }}>
      {s.label}
    </span>
  );
};

export const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const { addToast } = useToast();
  const LIMIT = 20;

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [selectedBranch, search]);

  useEffect(() => {
    fetchInventory();
  }, [selectedBranch, search, page]);

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll({ limit: 100, status: 'ACTIVE' });
      setBranches(res?.data?.docs || res?.data || []);
    } catch {
      // non-critical
    }
  };

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = { page, limit: LIMIT };
      if (search) params.search = search;

      let res;
      if (selectedBranch) {
        res = await inventoryService.getBranchInventory(selectedBranch, params);
      } else {
        res = await inventoryService.getAllInventory(params);
      }

      const data = res?.data || {};
      setInventory(data.docs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      addToast(err.message || 'Failed to load inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (row) => {
    const isConfirmed = await confirmDelete(row.name || row.productId?.name || 'this item');
    if (!isConfirmed) return;
    try {
      await inventoryService.deleteInventory(row._id);
      addToast('success', 'Inventory record deleted successfully');
      fetchInventory();
    } catch (err) {
      addToast('error', err.response?.data?.message || err.message || 'Failed to delete');
    }
  };

  const columns = [
    {
      key: 'branch',
      label: 'Branch',
      render: (row) => row.branchId?.name || row.branch?.name || '—',
    },
    {
      key: 'product',
      label: 'Product',
      render: (row) => row.productId?.name || '—',
    },
    {
      key: 'sku',
      label: 'SKU',
      render: (row) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
          {row.productId?.SKU || '—'}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => row.productId?.categoryId?.name || '—',
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (row) => row.productId?.brandId?.name || '—',
    },
    {
      key: 'unit',
      label: 'Unit',
      render: (row) => row.productId?.unitId ? `${row.productId.unitId.name} (${row.productId.unitId.code})` : '—',
    },
    {
      key: 'quantity',
      label: 'Current Qty',
      render: (row) => (
        <span style={{ fontWeight: 700, fontSize: '1.05em' }}>{row.quantity ?? 0}</span>
      ),
    },
    {
      key: 'stockStatus',
      label: 'Status',
      render: (row) => <StockStatusBadge status={row.stockStatus} />,
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <button className="ui-btn ui-btn-danger ui-btn-sm" onClick={() => handleDelete(row)}>
          <Trash2 size={14} /> Delete
        </button>
      )
    }
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle={`Current stock levels across all branches${total ? ` — ${total} records` : ''}`}
      />

      {/* Filters */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
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

        <div style={{ minWidth: '240px' }}>
          <Input
            label="Search Product / SKU"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type product name or SKU..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <Table columns={columns} data={inventory} isLoading={loading} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default InventoryPage;

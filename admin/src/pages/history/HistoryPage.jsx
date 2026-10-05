import React, { useState, useEffect } from 'react';
import { PageHeader, Table, Button, Input, Modal } from '../../components/common';
import { Eye, Search, Filter } from 'lucide-react';
import historyService from '../../services/historyService';
import { useToast } from '../../components/common/Toast';

const HistoryPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination (assuming standard Table component supports it, or we handle it via data props)
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  
  // View Modal
  const [showModal, setShowModal] = useState(false);
  const [viewLog, setViewLog] = useState(null);
  
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, [page, actionFilter]);

  const loadData = async (searchQuery = search) => {
    try {
      setLoading(true);
      const res = await historyService.getHistory({
        page,
        limit: 20,
        search: searchQuery,
        action: actionFilter
      });
      
      if (res?.success) {
        setData(res.data?.docs || res.data || []);
        setTotalPages(res.data?.totalPages || 1);
      } else {
        setData(res?.docs || res?.data?.docs || res?.data || []);
        setTotalPages(res?.totalPages || 1);
      }
    } catch (err) {
      addToast('error', 'Failed to load history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadData(search);
  };

  const handleView = (row) => {
    setViewLog(row);
    setShowModal(true);
  };

  const getActionBadgeStyle = (act) => {
    switch (act) {
      case 'STOCK_IN': return { background: '#dcfce7', color: '#166534' };
      case 'STOCK_OUT': return { background: '#fee2e2', color: '#991b1b' };
      case 'CREATE': return { background: '#dbeafe', color: '#1e40af' };
      case 'UPDATE': return { background: '#fef3c7', color: '#92400e' };
      case 'DELETE': return { background: '#fee2e2', color: '#991b1b' };
      default: return { background: '#f3f4f6', color: '#1f2937' };
    }
  };

  const columns = [
    { 
      key: 'createdAt', 
      label: 'Date & Time',
      render: (row) => new Date(row.createdAt).toLocaleString()
    },
    { 
      key: 'action', 
      label: 'Action',
      render: (row) => (
        <span style={{ 
          padding: '4px 8px', 
          borderRadius: '12px', 
          fontSize: '12px', 
          fontWeight: 600,
          ...getActionBadgeStyle(row.action)
        }}>
          {row.action.replace('_', ' ')}
        </span>
      )
    },
    { 
      key: 'entity', 
      label: 'Entity Details',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
            {row.productName || row.entityName || 'N/A'}
          </div>
          {row.sku && <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>SKU: {row.sku}</div>}
        </div>
      )
    },
    { 
      key: 'stockDelta', 
      label: 'Stock Change',
      render: (row) => {
        if (row.action === 'STOCK_IN' || row.action === 'STOCK_OUT') {
          const isAdd = row.action === 'STOCK_IN';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{row.previousStock || 0}</span>
              <span style={{ color: 'var(--text-muted)' }}>→</span>
              <span style={{ fontWeight: 'bold', color: isAdd ? '#16a34a' : '#dc2626' }}>
                {row.newStock || 0}
              </span>
              <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                ({isAdd ? '+' : '-'}{row.quantity})
              </span>
            </div>
          );
        }
        return <span style={{ color: 'var(--text-muted)' }}>-</span>;
      }
    },
    { key: 'performedBy', label: 'Performed By' },
    {
      key: 'actions', 
      label: 'Details',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="ui-btn ui-btn-outline ui-btn-sm" onClick={() => handleView(row)}>
            <Eye size={14} /> View
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Activity Log"
      />

      <div className="card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', flex: 1, width: '100%' }}>
          <div style={{ flex: '1 1 200px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Search size={16} />
            </div>
            <input
              className="ui-input"
              style={{ paddingLeft: '38px', width: '100%' }}
              placeholder="Search by product, SKU, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ flex: '1 1 150px', position: 'relative' }}>
             <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Filter size={16} />
            </div>
            <select
              className="ui-select"
              style={{ paddingLeft: '38px', width: '100%' }}
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Actions</option>
              <option value="STOCK_IN">Stock In</option>
              <option value="STOCK_OUT">Stock Out</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
            </select>
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <Button type="submit" variant="primary">Search</Button>
          </div>
        </form>
      </div>

      <Table columns={columns} data={data} loading={loading} />
      
      {totalPages > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', padding: '0 8px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Showing Page {page} of {totalPages}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
             <Button 
                variant="secondary" 
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
          </div>
        </div>
      )}

      {showModal && viewLog && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Activity Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            
            <div style={{ display: 'flex', gap: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
               <div style={{ flex: 1 }}>
                  <label className="ui-label">Action</label>
                  <div style={{ marginTop: '4px', fontWeight: 600 }}>{viewLog.action.replace('_', ' ')}</div>
               </div>
               <div style={{ flex: 1 }}>
                  <label className="ui-label">Date & Time</label>
                  <div style={{ marginTop: '4px', color: 'var(--text-primary)' }}>{new Date(viewLog.createdAt).toLocaleString()}</div>
               </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
               <div style={{ flex: 1 }}>
                  <label className="ui-label">Performed By</label>
                  <div style={{ marginTop: '4px', color: 'var(--text-primary)' }}>{viewLog.performedBy}</div>
               </div>
               {viewLog.branchId && (
                 <div style={{ flex: 1 }}>
                    <label className="ui-label">Branch</label>
                    <div style={{ marginTop: '4px', color: 'var(--text-primary)' }}>{viewLog.branchId?.name || 'Unknown'}</div>
                 </div>
               )}
            </div>

            <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
               <label className="ui-label">Entity / Product</label>
               <div style={{ marginTop: '4px', color: 'var(--text-primary)' }}>{viewLog.productName || viewLog.entityName}</div>
               {viewLog.sku && <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>SKU: {viewLog.sku}</div>}
            </div>

            {(viewLog.action === 'STOCK_IN' || viewLog.action === 'STOCK_OUT') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>PREVIOUS</div>
                    <div style={{ fontSize: '20px', marginTop: '4px', color: 'var(--text-secondary)' }}>{viewLog.previousStock || 0}</div>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>CHANGE</div>
                    <div style={{ fontSize: '20px', marginTop: '4px', fontWeight: 'bold', color: viewLog.action === 'STOCK_IN' ? '#16a34a' : '#dc2626' }}>
                      {viewLog.action === 'STOCK_IN' ? '+' : '-'}{viewLog.quantity} {viewLog.unit || ''}
                    </div>
                 </div>
                 <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>NEW STOCK</div>
                    <div style={{ fontSize: '20px', marginTop: '4px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{viewLog.newStock || 0}</div>
                 </div>
              </div>
            )}

            {viewLog.notes && (
              <div>
                 <label className="ui-label">Notes / Remarks</label>
                 <div style={{ marginTop: '8px', padding: '12px', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '13.5px', lineHeight: 1.5 }}>
                   {viewLog.notes}
                 </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default HistoryPage;

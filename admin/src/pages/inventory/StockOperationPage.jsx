import React, { useState, useEffect } from 'react';
import { PageHeader, Button, Input, Select } from '../../components/common';
import { useToast } from '../../components/common/Toast';
import inventoryService from '../../services/inventoryService';
import branchService from '../../services/branchService';
import productService from '../../services/productService';

/**
 * StockOperationPage
 *
 * operationType: 'STOCK_IN' | 'STOCK_OUT'
 */
export const StockOperationPage = ({ operationType, title, subtitle }) => {
  const [branches, setBranches] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const [currentStock, setCurrentStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  useEffect(() => {
    fetchPrerequisites();
  }, []);

  useEffect(() => {
    if (selectedBranch && selectedProduct) {
      fetchCurrentStock();
    } else {
      setCurrentStock(null);
    }
  }, [selectedBranch, selectedProduct]);

  const fetchPrerequisites = async () => {
    try {
      setLoading(true);
      const [bRes, pRes] = await Promise.all([
        branchService.getAll({ limit: 100, status: 'ACTIVE' }),
        productService.getAll({ limit: 1000, status: 'ACTIVE' }),
      ]);
      const availableBranches = bRes?.data?.docs || bRes?.data || [];
      setBranches(availableBranches);
      setProducts(pRes?.data?.docs || pRes?.data || []);
      if (availableBranches.length === 1) setSelectedBranch(availableBranches[0]._id);
    } catch (err) {
      addToast(err.message || 'Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentStock = async () => {
    try {
      const res = await inventoryService.getProductStock(selectedBranch, selectedProduct);
      setCurrentStock(res?.data?.quantity ?? 0);
    } catch {
      setCurrentStock(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedBranch || !selectedProduct) {
      return addToast('Please select a branch and product', 'error');
    }

    const numericQty = Number(quantity);
    if (!quantity || isNaN(numericQty) || numericQty <= 0) {
      return addToast('Quantity must be greater than zero', 'error');
    }

    if (operationType === 'STOCK_OUT' && currentStock !== null && numericQty > currentStock) {
      return addToast(
        `Insufficient stock. Current stock: ${currentStock}, Requested: ${numericQty}`,
        'error'
      );
    }

    try {
      setSubmitting(true);
      const payload = { branchId: selectedBranch, productId: selectedProduct, quantity: numericQty, notes };

      if (operationType === 'STOCK_IN') {
        await inventoryService.stockIn(payload);
      } else {
        await inventoryService.stockOut(payload);
      }

      addToast(`${title} recorded successfully`, 'success');
      await fetchCurrentStock();
      setQuantity('');
      setNotes('');
    } catch (err) {
      addToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const stockLabel = operationType === 'STOCK_IN' ? 'Stock In' : 'Stock Out';
  const stockColor = operationType === 'STOCK_IN' ? '#10b981' : '#ef4444';

  return (
    <div style={{ paddingBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <PageHeader title={title} subtitle={subtitle} />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading inventory data...</div>
        ) : (
          <div
            className="card"
            style={{
              width: '100%',
              padding: '40px',
              borderRadius: '12px',
              marginTop: '16px',
              borderTop: `4px solid ${stockColor}`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: `${stockColor}15`, borderRadius: '50%', color: stockColor, fontSize: '24px' }}>
                {operationType === 'STOCK_IN' ? '📥' : '📤'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {title} Details
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Please fill out the details below to record this transaction.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <Select
                  label="Warehouse Branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  options={branches.map((b) => ({ label: `${b.branchCode} – ${b.name}`, value: b._id }))}
                  placeholder="Select branch..."
                  required
                />

                <Select
                  label="Inventory Product"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  options={products.map((p) => ({ label: `[${p.SKU}] ${p.name}`, value: p._id }))}
                  placeholder="Select product..."
                  required
                />
              </div>

              {currentStock !== null && (
                <div
                  style={{
                    padding: '16px 20px',
                    background: 'var(--bg-secondary)',
                    borderLeft: `4px solid ${stockColor}`,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Current Available Stock</span>
                  <span style={{ color: stockColor, fontSize: '1.25rem', fontWeight: 800 }}>{currentStock} <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>units</span></span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <Input
                  label="Transaction Quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity..."
                  required
                />

                <Input
                  label="Reference / Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="PO number, reason, etc..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
                <Button type="submit" isLoading={submitting} variant="primary" style={{ padding: '12px 32px', fontSize: '1rem', backgroundColor: stockColor }}>
                  Confirm {stockLabel}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockOperationPage;

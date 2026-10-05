import React, { useState } from 'react';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';

export const Table = ({
  columns = [],
  data = [],
  loading = false,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records to display at this time.',
  emptyAction = null,
  className = '',
  pagination = true,
  defaultRowsPerPage = 10,
  children,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(defaultRowsPerPage);
  const isLoadingData = loading || isLoading;

  if (isLoadingData) {
    return <LoadingState message="Loading data..." />;
  }

  // If children provided, use manual composition
  if (children) {
    return (
      <div className="ui-table-container">
        <table className={`ui-table ${className}`}>{children}</table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="ui-table-empty-wrapper">
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / limit);
  const currentData = pagination
    ? data.slice((currentPage - 1) * limit, currentPage * limit)
    : data;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="ui-table-wrapper" style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: '12px',
      backgroundColor: 'var(--bg-card)',
      overflow: 'hidden'
    }}>
      <div className="ui-table-container" style={{ border: 'none', borderRadius: 0 }}>
        <table className={`ui-table ${className}`}>
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={{ width: col.width, textAlign: col.align || 'left' }}
                  className={col.headerClassName || ''}
                >
                  {col.label || col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, rowIdx) => (
              <tr key={row._id || row.id || rowIdx}>
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{ textAlign: col.align || 'left' }}
                    className={col.cellClassName || ''}
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : (row[col.key] !== '' && row[col.key] != null ? row[col.key] : 'NA')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && data.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'transparent',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, data.length)} of {data.length} entries
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Rows:</span>
              <select 
                className="ui-select" 
                style={{ padding: '2px 24px 2px 8px', fontSize: '13px', height: '28px', width: 'auto' }}
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="ui-btn ui-btn-outline ui-btn-sm"
            >
              Previous
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '13px', color: 'var(--text-primary)' }}>
              Page {currentPage} of {totalPages || 1}
            </div>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="ui-btn ui-btn-outline ui-btn-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const TableHead = ({ children }) => <thead>{children}</thead>;
export const TableBody = ({ children }) => <tbody>{children}</tbody>;
export const TableRow = ({ children, onClick, className = '' }) => (
  <tr onClick={onClick} className={className}>{children}</tr>
);
export const TableCell = ({ children, colSpan, style, className = '' }) => (
  <td colSpan={colSpan} style={style} className={className}>{children}</td>
);
export const TableHeaderCell = ({ children, style, className = '' }) => (
  <th style={style} className={className}>{children}</th>
);

export default Table;

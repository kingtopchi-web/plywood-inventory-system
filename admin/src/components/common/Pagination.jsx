import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = '',
}) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  return (
    <div className={`ui-pagination-container ${className}`}>
      <div className="ui-pagination-info">
        {totalItems > 0 ? (
          <span>
            Showing <strong>{startItem}</strong> - <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
          </span>
        ) : (
          <span>Page {currentPage} of {totalPages}</span>
        )}
      </div>

      <div className="ui-pagination-controls">
        {onPageSizeChange && (
          <div className="ui-page-size-selector">
            <span className="ui-page-size-label">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="ui-page-size-select"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="ui-page-buttons">
          <button
            type="button"
            className="ui-page-btn"
            onClick={() => onPageChange(1)}
            disabled={currentPage <= 1}
            title="First Page"
            aria-label="First Page"
          >
            <ChevronsLeft size={16} />
          </button>

          <button
            type="button"
            className="ui-page-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous Page"
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="ui-page-current-indicator">
            {currentPage} / {totalPages || 1}
          </span>

          <button
            type="button"
            className="ui-page-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Next Page"
            aria-label="Next Page"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            className="ui-page-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last Page"
            aria-label="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;

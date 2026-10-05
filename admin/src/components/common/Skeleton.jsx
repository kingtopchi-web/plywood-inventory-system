import React from 'react';

export const Skeleton = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style,
}) => {
  return (
    <div
      className={`ui-skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
};

export const SkeletonText = ({ lines = 3, gap = '8px', className = '' }) => {
  return (
    <div className={`ui-skeleton-text-group ${className}`} style={{ display: 'flex', flexDirection: 'column', gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          height="14px"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`ui-card ${className}`} style={{ padding: '20px' }}>
      <Skeleton height="20px" width="40%" style={{ marginBottom: '12px' }} />
      <Skeleton height="36px" width="60%" style={{ marginBottom: '16px' }} />
      <Skeleton height="14px" width="80%" />
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 4, className = '' }) => {
  return (
    <div className={`ui-table-container ${className}`}>
      <table className="ui-table">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i}>
                <Skeleton height="16px" width="80px" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <Skeleton height="14px" width={c === 0 ? '120px' : '70px'} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Skeleton;

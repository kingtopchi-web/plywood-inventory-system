import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'primary',
  trend = null, // { value: '+12%', isPositive: true }
  className = '',
}) => {
  return (
    <div className={`ui-stat-card variant-${variant} ${className}`}>
      <div className="stat-main">
        <span className="stat-label">{label}</span>
        <div className="stat-value-row">
          <span className="stat-value">{value}</span>
          {trend && (
            <span className={`stat-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
              {trend.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend.value}
            </span>
          )}
        </div>
        {subtext && <span className="stat-subtext">{subtext}</span>}
      </div>

      {Icon && (
        <div className={`stat-icon-box ${variant}`}>
          <Icon size={22} />
        </div>
      )}
    </div>
  );
};

export default StatCard;

import React from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accentColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor = '#0284c7'
}) => {
  return (
    <div className="wm-kpi-card">
      <div className="wm-kpi-header">
        <span className="wm-kpi-title">{title}</span>
        {icon && (
          <div 
            className="wm-kpi-icon-box"
            style={{ color: accentColor, backgroundColor: `${accentColor}18` }}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="wm-kpi-value">{value}</div>

      {(subtitle || trend) && (
        <div className="wm-kpi-footer">
          {trend && (
            <span 
              className={`wm-kpi-trend ${trend.isPositive ? 'wm-trend-positive' : 'wm-trend-neutral'}`}
            >
              {trend.value}
            </span>
          )}
          {subtitle && <span className="wm-kpi-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

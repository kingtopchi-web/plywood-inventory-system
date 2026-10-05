import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { PageHeader, Select } from '../../components/common';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer } from 'recharts';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import ReactECharts from 'echarts-for-react';
import dashboardService from '../../services/dashboardService';
import branchService from '../../services/branchService';
import inventoryService from '../../services/inventoryService';
import { useToast } from '../../components/common/Toast';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding, faBox, faBoxOpen, faTruck, faCalendarCheck,
  faCalendarMinus, faCheckCircle, faExclamationTriangle, faBan
} from '@fortawesome/free-solid-svg-icons';
import '../../styles/dashboard.css';

const StatCard = ({ title, value, icon, color = '#3b82f6', loading }) => (
  <div className="card stat-card" style={{
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeft: `4px solid ${color}`
  }}>
    <div>
      <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </p>
      <h3 className="stat-value" style={{ margin: 0, fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        {loading ? '...' : (value ?? 0)}
      </h3>
    </div>
    <div className="stat-icon-wrapper" style={{ padding: '14px', backgroundColor: `${color}15`, borderRadius: '50%', color, fontSize: '26px' }}>
      {icon}
    </div>
  </div>
);



export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [loading, setLoading] = useState(true);
  const [stockAlerts, setStockAlerts] = useState({ low: 0, out: 0 });
  const { addToast } = useToast();

  useEffect(() => { fetchBranches(); }, []);
  useEffect(() => { fetchStats(); }, [selectedBranch, dateRange]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [lowRes, outRes] = await Promise.all([
          inventoryService.getLowStockAlerts(selectedBranch ? { branchId: selectedBranch } : {}),
          inventoryService.getOutOfStockAlerts(selectedBranch ? { branchId: selectedBranch } : {}),
        ]);
        const lowItems = lowRes?.data || lowRes || [];
        const outItems = outRes?.data || outRes || [];
        setStockAlerts({
          low: Array.isArray(lowItems) ? lowItems.length : 0,
          out: Array.isArray(outItems) ? outItems.length : 0,
        });
      } catch { /* non-critical */ }
    };
    fetchAlerts();
  }, [selectedBranch]);

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll({ limit: 100 });
      // api.js returns { success, data: { docs:[...], total, ... }, message }
      setBranches(res?.data?.docs || res?.data || []);
    } catch (err) {
      console.error('Branch load error:', err);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedBranch) params.branchId = selectedBranch;
      if (dateRange) params.dateRange = dateRange;

      const res = await dashboardService.getStats(params);
      // res = { success, data: { totalBranches, ... }, message }
      setStats(res?.data || res);
    } catch (err) {
      addToast('error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ paddingBottom: '40px' }}>
      {/* Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <PageHeader
          title="Super Admin Dashboard"
        />
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              DATE RANGE
            </label>
            <Select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              placeholder={false}
              options={[
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' },
                { label: 'Last 7 Days', value: 'last7days' },
                { label: 'This Month', value: 'thisMonth' },
                { label: 'Last Month', value: 'lastMonth' },
                { label: 'This Year', value: 'thisYear' }
              ]}
            />
          </div>
          {document.getElementById('dashboard-header-portal') && createPortal(
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Select
                value={selectedBranch}
                onChange={e => setSelectedBranch(e.target.value)}
                placeholder={false}
                options={[
                  { label: '🌐 All Branches (Global)', value: '' },
                  ...branches.map(b => ({ label: `${b.name} (${b.branchCode})`, value: b._id }))
                ]}
              />
            </div>,
            document.getElementById('dashboard-header-portal')
          )}
        </div>
      </div>

      {!selectedBranch ? (
        <>
          {/* GLOBAL VIEW */}
          <h3 style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Global Overview
          </h3>
          <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
            <StatCard title="Total Branches" value={stats?.totalBranches} icon={<FontAwesomeIcon icon={faBuilding} />} color="#6366f1" loading={loading} />
            <StatCard title="Total Current Stock" value={stats?.totalInventoryQuantity?.toLocaleString()} icon={<FontAwesomeIcon icon={faBox} />} color="#3b82f6" loading={loading} />


            <StatCard title="Active Products" value={stats?.totalProducts?.toLocaleString()} icon={<FontAwesomeIcon icon={faCheckCircle} />} color="#8b5cf6" loading={loading} />

          </div>

          {/* CHARTS SECTION */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Highcharts Area Spline Card */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none' }}>
              <h4 style={{ marginBottom: '20px', color: 'var(--text-primary)', fontSize: '15px' }}>Stock Activity Overview</h4>
              <div style={{ height: '300px' }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: { type: 'areaspline', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
                    title: { text: null },
                    xAxis: {
                      categories: stats?.stockActivity?.dates?.map(d => {
                        const date = new Date(d);
                        return date.toLocaleDateString('en-US', { weekday: 'short' });
                      }) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                      lineColor: 'transparent',
                      tickColor: 'transparent',
                      gridLineWidth: 1,
                      gridLineColor: 'rgba(0,0,0,0.05)',
                      gridLineDashStyle: 'Dash',
                      labels: { style: { color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 } }
                    },
                    yAxis: {
                      title: { text: null },
                      gridLineColor: 'rgba(0,0,0,0.05)',
                      gridLineDashStyle: 'Dash',
                      labels: { style: { color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 } }
                    },
                    legend: { itemStyle: { color: 'var(--text-secondary)', fontWeight: 'normal' }, verticalAlign: 'top' },
                    plotOptions: {
                      areaspline: {
                        fillOpacity: 0.5,
                        marker: { radius: 5, lineWidth: 2, lineColor: '#ffffff', symbol: 'circle' },
                        lineWidth: 3
                      }
                    },
                    series: [
                      {
                        name: 'Stock In',
                        data: stats?.stockActivity?.stockIn || [210, 310, 160, 420, 500, 310, 460, 560, 410],
                        color: '#4318ff',
                        fillColor: {
                          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                          stops: [[0, 'rgba(67, 24, 255, 0.3)'], [1, 'rgba(67, 24, 255, 0.0)']]
                        }
                      },
                      {
                        name: 'Stock Out',
                        data: stats?.stockActivity?.stockOut || [100, 130, 110, 190, 220, 160, 230, 260, 190],
                        color: '#00d8b6',
                        dashStyle: 'ShortDash',
                        fillColor: {
                          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                          stops: [[0, 'rgba(0, 216, 182, 0.3)'], [1, 'rgba(0, 216, 182, 0.0)']]
                        }
                      }
                    ],
                    credits: { enabled: false },
                    tooltip: {
                      backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 8, style: { color: 'var(--text-primary)' }
                    }
                  }}
                  containerProps={{ style: { height: '100%', width: '100%' } }}
                />
              </div>
            </div>

            {/* Monthly Stock Activity Line Chart */}
            <div className="card" style={{ padding: '24px', backgroundColor: '#ffffff', border: 'none' }}>
              <h4 style={{ marginBottom: '20px', color: 'var(--text-primary)', fontSize: '15px' }}>Stock Activity Overview (Monthwise)</h4>
              <div style={{ height: '300px' }}>
                <HighchartsReact
                  highcharts={Highcharts}
                  options={{
                    chart: { type: 'areaspline', backgroundColor: 'transparent', style: { fontFamily: 'inherit' } },
                    title: { text: null },
                    xAxis: {
                      categories: stats?.monthlyStockActivity?.months || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                      lineColor: 'transparent',
                      tickColor: 'transparent',
                      gridLineWidth: 1,
                      gridLineColor: 'rgba(0,0,0,0.05)',
                      gridLineDashStyle: 'Dash',
                      labels: { style: { color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 } }
                    },
                    yAxis: {
                      title: { text: null },
                      gridLineColor: 'rgba(0,0,0,0.05)',
                      gridLineDashStyle: 'Dash',
                      labels: { style: { color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 } }
                    },
                    legend: { itemStyle: { color: 'var(--text-secondary)', fontWeight: 'normal' }, verticalAlign: 'top' },
                    plotOptions: {
                      areaspline: {
                        fillOpacity: 0.5,
                        marker: { radius: 5, lineWidth: 2, lineColor: '#ffffff', symbol: 'circle' },
                        lineWidth: 3
                      }
                    },
                    series: [
                      {
                        name: 'Stock In',
                        data: stats?.monthlyStockActivity?.stockIn || [100, 75, 50, 75, 50, 100],
                        color: '#4318ff',
                        fillColor: {
                          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                          stops: [[0, 'rgba(67, 24, 255, 0.3)'], [1, 'rgba(67, 24, 255, 0.0)']]
                        }
                      },
                      {
                        name: 'Stock Out',
                        data: stats?.monthlyStockActivity?.stockOut || [150, 60, 40, 65, 40, 90],
                        color: '#00d8b6',
                        dashStyle: 'ShortDash',
                        fillColor: {
                          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                          stops: [[0, 'rgba(0, 216, 182, 0.3)'], [1, 'rgba(0, 216, 182, 0.0)']]
                        }
                      }
                    ],
                    credits: { enabled: false },
                    tooltip: {
                      backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: 8, style: { color: 'var(--text-primary)' }
                    }
                  }}
                  containerProps={{ style: { height: '100%', width: '100%' } }}
                />
              </div>
            </div>

            {/* Pie Chart Card */}
            <div className="card" style={{ padding: '24px' }}>
              <h4 style={{ marginBottom: '20px', color: 'var(--text-primary)', fontSize: '15px' }}>Inventory Status</h4>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Available', value: Math.max(0, (stats?.totalProducts || 0) - stockAlerts.low - stockAlerts.out) },
                        { name: 'Low Stock', value: stockAlerts.low },
                        { name: 'Out of Stock', value: stockAlerts.out },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f97316" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }} />
                    <RechartsLegend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ECharts Bar Chart Card (Commented out for future use)
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '15px' }}>Stock by Category</h4>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Top 10</span>
              </div>
              <div style={{ height: '300px', width: '100%' }}>
                <ReactECharts 
                  option={{
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#e2e8f0' },
                    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                    xAxis: [
                      {
                        type: 'category',
                        data: (stats?.categoryStock?.categories?.length > 1) 
                              ? stats.categoryStock.categories 
                              : ['Plywood 18mm', 'MDF 12mm', 'Laminates', 'Teak Wood', 'Flush Doors', 'Adhesives', 'Edge Banding'],
                        axisTick: { alignWithLabel: true },
                        axisLine: { lineStyle: { color: '#e2e8f0' } },
                        axisLabel: { color: '#a3aed1', rotate: 30, interval: 0 }
                      }
                    ],
                    yAxis: [
                      {
                        type: 'value',
                        splitLine: { lineStyle: { color: '#f4f7fe', type: 'dashed' } },
                        axisLabel: { color: '#a3aed1' }
                      }
                    ],
                    series: [
                      {
                        name: 'Quantity',
                        type: 'bar',
                        barWidth: '40%',
                        itemStyle: {
                          color: {
                            type: 'linear',
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                              { offset: 0, color: '#4318ff' },
                              { offset: 1, color: 'rgba(67, 24, 255, 0.2)' }
                            ]
                          },
                          borderRadius: [4, 4, 0, 0]
                        },
                        data: (stats?.categoryStock?.quantities?.length > 1)
                              ? stats.categoryStock.quantities
                              : [1200, 850, 640, 450, 310, 250, 150]
                      }
                    ]
                  }} 
                  style={{ height: '100%', width: '100%' }} 
                />
              </div>
            </div>
            */}
          </div>
        </>
      ) : (
        (() => {
          const branch = branches.find(b => b._id === selectedBranch);
          return (
            <>
              {/* BRANCH VIEW */}
              <h3 style={{ marginBottom: '14px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {branch?.name} Activity
              </h3>
              <div className="dashboard-grid" style={{ marginBottom: '32px' }}>
                <div className="card stat-card" style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderLeft: `4px solid #8b5cf6` }}>
                  <div>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Branch Info
                    </p>
                    <h3 className="stat-value" style={{ margin: '0 0 4px 0', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {branch?.name || 'Unknown'}
                    </h3>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <div><strong>Code:</strong> {branch?.branchCode}</div>
                      <div><strong>City:</strong> {branch?.city || 'N/A'}</div>
                      <div><strong>Phone:</strong> {branch?.phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="stat-icon-wrapper" style={{ padding: '14px', backgroundColor: `#8b5cf615`, borderRadius: '50%', color: '#8b5cf6', fontSize: '26px' }}>
                    <FontAwesomeIcon icon={faBuilding} />
                  </div>
                </div>


                <StatCard title="Active Products" value={stats?.branchActiveProducts?.toLocaleString()} icon={<FontAwesomeIcon icon={faCheckCircle} />} color="#10b981" loading={loading} />
              </div>
            </>
          );
        })()
      )}
    </div>
  );
};

export default DashboardPage;

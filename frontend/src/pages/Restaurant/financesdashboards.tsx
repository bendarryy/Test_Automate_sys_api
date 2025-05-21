import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import '../../styles/financesdashboards.css';
import { useApi } from '../../hooks/useApi';

interface ProfitSummary {
  day_profit: number;
  day_change: number;
  week_profit: number;
  week_change: number;
  month_profit: number;
  month_change: number;
}

interface OrderSummary {
  today_orders: number;
  today_change: number;
  week_orders: number;
  week_change: number;
  month_orders: number;
  month_change: number;
}

interface ProfitTrendPoint {
  date: string;
  profit: number;
}

// سيتم تهيئة Chart.js من CDN

type DashboardSection = 'overview' | 'analytics';

const FinancialDashboard = () => {
  // State for API data
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [trendView, setTrendView] = useState<'daily' | 'monthly'>('daily');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSection>('overview');

  const { callApi } = useApi();

  // Extract systemId from localStorage
  const systemId = localStorage.getItem('selectedSystemId');

  // Prepare chart data state
  const [profitTrendData, setProfitTrendData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });

  // ApexCharts options
  const chartOptions = {
    chart: {
      id: 'profit-trend',
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
      zoom: { enabled: true, type: 'x' as const, autoScaleYaxis: true },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: { enabled: true, delay: 150 },
        dynamicAnimation: { enabled: true, speed: 350 }
      },
    },
    xaxis: {
      categories: profitTrendData.labels,
      crosshairs: { show: true, width: 1, position: 'back', opacity: 0.7 },
      labels: { style: { colors: '#666', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: '#666', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    grid: { borderColor: '#f0f0f0' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.3,
        gradientToColors: ['#10b981'],
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    markers: {
      size: 4,
      colors: ['#10b981'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: { size: 6 }
    },
    colors: ['#10b981'],
    tooltip: { theme: 'dark' },
    legend: { show: true, position: 'top' as const, horizontalAlign: 'right' as const }
  };
  const chartSeries = [
    {
      name: 'Profit',
      data: profitTrendData.values,
    },
  ];

  // Fetch data on mount or when trendView changes
  useEffect(() => {
    if (!systemId) {
      setError('No system selected');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all([
      callApi('get', `/restaurant/${systemId}/orders/analytics/profit-summary/`),
      callApi('get', `/restaurant/${systemId}/orders/analytics/profit-trend/?view=${trendView}`),
      callApi('get', `/restaurant/${systemId}/orders/analytics/order-summary/`)
    ])
      .then(([profitSummaryRes, profitTrendRes, orderSummaryRes]: [ProfitSummary, ProfitTrendPoint[], OrderSummary]) => {
        setProfitSummary(profitSummaryRes);
        setOrderSummary(orderSummaryRes);
        // Prepare chart data
        setProfitTrendData({
          labels: profitTrendRes.map((d) => trendView === 'daily' ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })),
          values: profitTrendRes.map((d) => d.profit)
        });
      })
      .catch(() => {
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, [systemId, trendView]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const renderChangeIndicator = (change: number) => (
    <div className={`change ${change >= 0 ? 'positive' : 'negative'}`}>  
      <span>{Math.abs(change)}%</span>
    </div>
  );

  const handleExportReport = () => {
    if (!profitSummary || !orderSummary || !profitTrendData) return;

    // Prepare CSV content
    const csvContent = [
      // Profit Summary
      ['Profit Summary'],
      ['Period', 'Amount', 'Change'],
      ['Today', `$${formatNumber(profitSummary.day_profit)}`, `${profitSummary.day_change}%`],
      ['This Week', `$${formatNumber(profitSummary.week_profit)}`, `${profitSummary.week_change}%`],
      ['This Month', `$${formatNumber(profitSummary.month_profit)}`, `${profitSummary.month_change}%`],
      [],
      // Order Summary
      ['Order Summary'],
      ['Period', 'Count', 'Change'],
      ['Today', orderSummary.today_orders, `${orderSummary.today_change}%`],
      ['This Week', orderSummary.week_orders, `${orderSummary.week_change}%`],
      ['This Month', orderSummary.month_orders, `${orderSummary.month_change}%`],
      [],
      // Profit Trend
      ['Profit Trend'],
      ['Date', 'Profit'],
      ...profitTrendData.labels.map((date, index) => [
        date,
        `$${formatNumber(profitTrendData.values[index])}`
      ])
    ].map(row => row.join(',')).join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderOverviewSection = () => (
    <>
      <div className="profit-section">
        <h2>Total Profit Overview</h2>
        <div className="cards">
          <div className="card">
            <h3>Today's Profit</h3>
            <div className="amount">${formatNumber(profitSummary?.day_profit ?? 0)}</div>
            {renderChangeIndicator(profitSummary?.day_change ?? 0)}
            <div className="vs">vs yesterday</div>
          </div>

          <div className="card">
            <h3>This Week's Profit</h3>
            <div className="amount">${formatNumber(profitSummary?.week_profit ?? 0)}</div>
            {renderChangeIndicator(profitSummary?.week_change ?? 0)}
            <div className="vs">vs last week</div>
          </div>

          <div className="card">
            <h3>This Month's Profit</h3>
            <div className="amount">${formatNumber(profitSummary?.month_profit ?? 0)}</div>
            {renderChangeIndicator(profitSummary?.month_change ?? 0)}
            <div className="vs">vs last month</div>
          </div>
        </div>
      </div>

      <div className="trend-analysis">
        <div className="section-header">
          <h2>Profit Trend Analysis</h2>
          <div className="period-selector">
            <button className={trendView === 'daily' ? 'active' : ''} onClick={() => setTrendView('daily')}>Daily (30 Days)</button>
            <button className={trendView === 'monthly' ? 'active' : ''} onClick={() => setTrendView('monthly')}>Monthly (12 Months)</button>
          </div>
        </div>
        <div className="chart-container">
          <ReactApexChart
            type="area"
            height={260}
            options={{
              ...chartOptions,
              fill: {
                ...chartOptions.fill,
                gradient: {
                  ...chartOptions.fill.gradient,
                  opacityFrom: 0.8,
                  opacityTo: 0.1,
                },
              },
            }}
            series={chartSeries}
          />
        </div>
      </div>

      <div className="orders-section">
        <h2>Order Volume</h2>
        <div className="cards">
          <div className="card">
            <h3>Orders Today</h3>
            <div className="amount">{orderSummary?.today_orders ?? 0}</div>
            {renderChangeIndicator(orderSummary?.today_change ?? 0)}
            <div className="vs">vs yesterday</div>
          </div>

          <div className="card">
            <h3>Orders This Week</h3>
            <div className="amount">{orderSummary?.week_orders ?? 0}</div>
            {renderChangeIndicator(orderSummary?.week_change ?? 0)}
            <div className="vs">vs last week</div>
          </div>

          <div className="card">
            <h3>Orders This Month</h3>
            <div className="amount">{orderSummary?.month_orders ?? 0}</div>
            {renderChangeIndicator(orderSummary?.month_change ?? 0)}
            <div className="vs">vs last month</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAnalyticsSection = () => (
    <div className="analytics-section">
      <h2>Detailed Analytics</h2>
      <div className="cards">
        <div className="card">
          <h3>Average Order Value</h3>
          <div className="amount">
            ${formatNumber((profitSummary?.day_profit ?? 0) / (orderSummary?.today_orders || 1))}
          </div>
          <div className="vs">per order today</div>
        </div>

        <div className="card">
          <h3>Peak Hours</h3>
          <div className="amount">12:00 - 14:00</div>
          <div className="vs">Most active period</div>
        </div>

        <div className="card">
          <h3>Customer Retention</h3>
          <div className="amount">75%</div>
          <div className="vs">Returning customers</div>
        </div>
      </div>

      <div className="trend-analysis">
        <h2>Performance Metrics</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Revenue Growth</h3>
            <div className="amount">+15%</div>
            <div className="vs">vs last month</div>
          </div>
          <div className="metric-card">
            <h3>Order Growth</h3>
            <div className="amount">+8%</div>
            <div className="vs">vs last month</div>
          </div>
          <div className="metric-card">
            <h3>Customer Growth</h3>
            <div className="amount">+12%</div>
            <div className="vs">vs last month</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="dashboard"><div className="loading">Loading...</div></div>;
  if (error) return <div className="dashboard"><div className="error">{error}</div></div>;

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Financial Dashboard</h1>
        <div className="nav">
          <button 
            className={activeSection === 'overview' ? 'active' : ''} 
            onClick={() => setActiveSection('overview')}
          >
            Overview
          </button>
          <button 
            className={activeSection === 'analytics' ? 'active' : ''} 
            onClick={() => setActiveSection('analytics')}
          >
            Analytics
          </button>
          <button className="export" onClick={handleExportReport}>Export Report</button>
        </div>
      </div>

      {activeSection === 'overview' && renderOverviewSection()}
      {activeSection === 'analytics' && renderAnalyticsSection()}
    </div>
  );
};

export default FinancialDashboard;

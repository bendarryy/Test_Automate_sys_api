import { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import styles from '../../styles/financesdashboards.module.css';
import { useApi } from '../../hooks/useApi';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Button } from 'antd';

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
      callApi('get', `/restaurant/${systemId}/orders/analytics/profit-summary/`) as Promise<ProfitSummary>,
      callApi('get', `/restaurant/${systemId}/orders/analytics/profit-trend/?view=${trendView}`) as Promise<ProfitTrendPoint[]>,
      callApi('get', `/restaurant/${systemId}/orders/analytics/order-summary/`) as Promise<OrderSummary>
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
    <div className={`${styles.change} ${change >= 0 ? styles.positive : styles.negative}`}>  
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
      <div className={styles.profitSection}>
        <h2 className={styles.sectionTitle}>Total Profit Overview</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Today's Profit</h3>
            <div className={styles.amount}>${formatNumber(profitSummary?.day_profit ?? 0)}</div>
            {renderChangeIndicator(profitSummary?.day_change ?? 0)}
            <div className={styles.vs}>vs yesterday</div>
          </div>

          <div className={styles.card}>
            <h3>This Week's Profit</h3>
            <div className={styles.amount}>${formatNumber(profitSummary?.week_profit ?? 0)}</div>
            {renderChangeIndicator(profitSummary?.week_change ?? 0)}
            <div className={styles.vs}>vs last week</div>
          </div>

          <div className={styles.card}>
            <h3>This Month's Profit</h3>
            <div className={styles.amount}>${formatNumber(profitSummary?.month_profit ?? 0)}</div>
            {renderChangeIndicator(profitSummary?.month_change ?? 0)}
            <div className={styles.vs}>vs last month</div>
          </div>
        </div>
      </div>

      <div className={styles.trendAnalysis}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Profit Trend Analysis</h2>
          <div className={styles.periodSelector}>
            <button className={trendView === 'daily' ? styles.active : ''} onClick={() => setTrendView('daily')}>Daily (30 Days)</button>
            <button className={trendView === 'monthly' ? styles.active : ''} onClick={() => setTrendView('monthly')}>Monthly (12 Months)</button>
          </div>
        </div>
        <div className={styles.chartContainer}>
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

      <div className={styles.ordersSection}>
        <h2 className={styles.sectionTitle}>Order Volume</h2>
        <div className={styles.cards}>
          <div className={styles.card}>
            <h3>Orders Today</h3>
            <div className={styles.amount}>{orderSummary?.today_orders ?? 0}</div>
            {renderChangeIndicator(orderSummary?.today_change ?? 0)}
            <div className={styles.vs}>vs yesterday</div>
          </div>

          <div className={styles.card}>
            <h3>Orders This Week</h3>
            <div className={styles.amount}>{orderSummary?.week_orders ?? 0}</div>
            {renderChangeIndicator(orderSummary?.week_change ?? 0)}
            <div className={styles.vs}>vs last week</div>
          </div>

          <div className={styles.card}>
            <h3>Orders This Month</h3>
            <div className={styles.amount}>{orderSummary?.month_orders ?? 0}</div>
            {renderChangeIndicator(orderSummary?.month_change ?? 0)}
            <div className={styles.vs}>vs last month</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderAnalyticsSection = () => (
    <div className={styles.analyticsSection}>
      <h2 className={styles.sectionTitle}>Detailed Analytics</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>Average Order Value</h3>
          <div className={styles.amount}>
            ${formatNumber((profitSummary?.day_profit ?? 0) / (orderSummary?.today_orders || 1))}
          </div>
          <div className={styles.vs}>per order today</div>
        </div>

        <div className={styles.card}>
          <h3>Peak Hours</h3>
          <div className={styles.amount}>12:00 - 14:00</div>
          <div className={styles.vs}>Most active period</div>
        </div>

        <div className={styles.card}>
          <h3>Customer Retention</h3>
          <div className={styles.amount}>75%</div>
          <div className={styles.vs}>Returning customers</div>
        </div>
      </div>

      <div className={styles.trendAnalysis}>
        <h2 className={styles.sectionTitle}>Performance Metrics</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.metricCard}>
            <h3>Revenue Growth</h3>
            <div className={styles.amount}>+15%</div>
            <div className={styles.vs}>vs last month</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Order Growth</h3>
            <div className={styles.amount}>+8%</div>
            <div className={styles.vs}>vs last month</div>
          </div>
          <div className={styles.metricCard}>
            <h3>Customer Growth</h3>
            <div className={styles.amount}>+12%</div>
            <div className={styles.vs}>vs last month</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className={styles.dashboard}><LoadingSpinner /></div>;
  if (error) return <div className={styles.dashboard}><div className={styles.error}>{error}</div></div>;

  return (
    <div className={styles.dashboard}>
      <Header
        title="Financial Dashboard"
        breadcrumbs={[
          { title: 'Restaurant', path: '/restaurant' },
          { title: 'Finance' }
        ]}
        actions={
          <Button type="primary" onClick={handleExportReport}>Export Report</Button>
        }
      />
      <div className={styles.nav}>
        <button 
          className={activeSection === 'overview' ? styles.active : ''} 
          onClick={() => setActiveSection('overview')}
        >
          Overview
        </button>
        <button 
          className={activeSection === 'analytics' ? styles.active : ''} 
          onClick={() => setActiveSection('analytics')}
        >
          Analytics
        </button>
      </div>

      {activeSection === 'overview' && renderOverviewSection()}
      {activeSection === 'analytics' && renderAnalyticsSection()}
    </div>
  );
};

export default FinancialDashboard;

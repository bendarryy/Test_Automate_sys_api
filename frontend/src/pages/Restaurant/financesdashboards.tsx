import { useEffect, useRef } from 'react';
import '../../styles/financesdashboards.css';

// سيتم تهيئة Chart.js من CDN

const FinancialDashboard = () => {
  // بيانات تجريبية
  const profitTrendData = {
    labels: ['Apr 6', 'Apr 7', 'Apr 8', 'Apr 9', 'Apr 10', 'Apr 11', 'Apr 12', 'Apr 13', 'Apr 14', 'Apr 15',
            'Apr 16', 'Apr 17', 'Apr 18', 'Apr 19', 'Apr 20', 'Apr 21', 'Apr 22', 'Apr 23', 'Apr 24', 'Apr 25',
            'Apr 26', 'Apr 27', 'Apr 28', 'Apr 29', 'Apr 30', 'May 1', 'May 2', 'May 3', 'May 4', 'May 5'],
    values: [1200, 1300, 1400, 1350, 1450, 1200, 1100, 1300, 1400, 1350, 1300, 1250, 1400, 1500, 1600,
             1700, 1800, 1750, 1600, 1500, 1700, 1800, 1900, 1850, 1800, 1900, 2000, 1950, 1900, 2000]
  };

  const data = {
    today: {
      profit: 2450,
      change: 12.5
    },
    week: {
      profit: 15780,
      change: 10.2
    },
    month: {
      profit: 64320,
      change: -2.5
    },
    orders: {
      today: 124,
      todayChange: 15.3,
      week: 842,
      weekChange: 7.8,
      month: 3256,
      monthChange: -1.2,
      weeklyDistribution: [120, 145, 132, 148, 138, 112, 98]
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const renderChangeIndicator = (change: number) => (
    <div className={`change ${change >= 0 ? 'positive' : 'negative'}`}>
      <div className="indicator-icon">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path fill="currentColor" d={change >= 0 ?
            "M7 14l5-5 5 5H7z" :
            "M7 10l5 5 5-5H7z"
          } />
        </svg>
      </div>
      <span>{Math.abs(change)}%</span>
    </div>
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.async = true;
    script.onload = initChart;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initChart = () => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    new (window as any).Chart(ctx, {
      type: 'line',
      data: {
        labels: profitTrendData.labels,
        datasets: [{
          data: profitTrendData.values,
          fill: true,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 2,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#fff'
        }]
      },
      options: chartConfig
    });
  };

  const chartConfig = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#333',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { size: 10 } }
      },
      y: {
        grid: { color: '#f0f0f0' },
        ticks: { color: '#666', font: { size: 10 } }
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderColor: '#10b981',
        borderWidth: 2,
        fill: true,
        backgroundColor: 'rgba(16, 185, 129, 0.1)'
      },
      point: {
        radius: 0,
        hitRadius: 10,
        hoverRadius: 4,
        hoverBorderWidth: 2,
        backgroundColor: '#10b981',
        borderColor: '#fff'
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Financial Dashboard</h1>
        <p>Track your business performance and financial metrics</p>
        <div className="nav">
          <button className="active">Overview</button>
          <button>Analytics</button>
          <button>Reports</button>
          <button className="export">Export Report</button>
        </div>
      </div>

      <div className="profit-section">
        <h2>Total Profit Overview</h2>
        <div className="cards">
          <div className="card">
            <h3>Today's Profit</h3>
            <div className="amount">${formatNumber(data.today.profit)}</div>
            {renderChangeIndicator(data.today.change)}
            <div className="vs">vs yesterday</div>
          </div>

          <div className="card">
            <h3>This Week's Profit</h3>
            <div className="amount">${formatNumber(data.week.profit)}</div>
            {renderChangeIndicator(data.week.change)}
            <div className="vs">vs last week</div>
          </div>

          <div className="card">
            <h3>This Month's Profit</h3>
            <div className="amount">${formatNumber(data.month.profit)}</div>
            {renderChangeIndicator(data.month.change)}
            <div className="vs">vs last month</div>
          </div>
        </div>
      </div>

      <div className="trend-analysis">
        <div className="section-header">
          <h2>Profit Trend Analysis</h2>
          <div className="period-selector">
            <button className="active">Daily (30 Days)</button>
            <button>Monthly (12 Months)</button>
          </div>
        </div>
        <div className="chart-container">
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>

      <div className="orders-section">
        <h2>Order Volume</h2>
        <div className="cards">
          <div className="card">
            <h3>Orders Today</h3>
            <div className="amount">{data.orders.today}</div>
            {renderChangeIndicator(data.orders.todayChange)}
            <div className="vs">vs yesterday</div>
          </div>

          <div className="card">
            <h3>Orders This Week</h3>
            <div className="amount">{data.orders.week}</div>
            {renderChangeIndicator(data.orders.weekChange)}
            <div className="vs">vs last week</div>
          </div>

          <div className="card">
            <h3>Orders This Month</h3>
            <div className="amount">{data.orders.month}</div>
            {renderChangeIndicator(data.orders.monthChange)}
            <div className="vs">vs last month</div>
          </div>

          <div className="weekly-chart">
            <h3>Weekly Orders</h3>
            <div className="bars">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="bar-wrapper">
                  <div 
                    className="bar" 
                    style={{ 
                      height: `${(data.orders.weeklyDistribution[i] / Math.max(...data.orders.weeklyDistribution)) * 100}%` 
                    }}
                  />
                  <span>{day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;

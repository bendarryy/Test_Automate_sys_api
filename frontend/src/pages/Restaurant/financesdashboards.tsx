// أضفنا استيراد React هنا';
import React, { useEffect, useState } from 'react'; 
import '../../styles/financesdashboards.css';
import { useApi} from "../../hooks/useApi";
interface ProfitData {
  day_profit: number;
  day_change: number;
  week_profit: number;
  week_change: number;
  month_profit: number;
  month_change: number;
}

const ProfitOverview = () => {
  const { callApi,loading } = useApi(); 
  const systemId = localStorage.getItem('selectedSystemId') || '5';
  const [profitData, setProfitData] = useState<ProfitData | null>(null);

  useEffect(() => {

    const fetchProfitData = async () => {
      try {
        const response = await callApi('get', `restaurant/${systemId}/orders/analytics/profit-summary/`);
        setProfitData(response);
      } catch (error) {
        console.error('Error fetching profit data:', error);
      
      }
    };

    fetchProfitData();
  }, [systemId]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const renderChangeIndicator = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change)}%
      </span>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (!profitData) return <div>No data available</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <p>Track your business performance and financial metrics</p>
        <nav className="navigation">
          <button className="active">Overview</button>
          <button>Analytics</button>
          <button>Reports</button>
        </nav>
      </header>

      <div className="profit-overview">
        <h2>Total Profit Overview</h2>
        
        <div className="profit-cards">
          <div className="profit-card">
            <h3>Today's Profit</h3>
            <div className="profit-amount">${formatNumber(profitData.day_profit)}</div>
            {renderChangeIndicator(profitData.day_change)}
            <div className="comparison">vs yesterday</div>
          </div>

          <div className="profit-card">
            <h3>This Week's Profit</h3>
            <div className="profit-amount">${formatNumber(profitData.week_profit)}</div>
            {renderChangeIndicator(profitData.week_change)}
            <div className="comparison">vs last week</div>
          </div>

          <div className="profit-card">
            <h3>This Month's Profit</h3>
            <div className="profit-amount">${formatNumber(profitData.month_profit)}</div>
            {renderChangeIndicator(profitData.month_change)}
            <div className="comparison">vs last month</div>
          </div>
        </div>

        <button className="export-button">
          Export Report
        </button>
      </div>
    </div>
  );
};

export default ProfitOverview;
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import styles from '../../../../styles/financesdashboards.module.css';
import Header from '../../../../components/Header';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { Button } from 'antd';
import { useFinancialDashboard } from './hooks/useFinancialDashboard';
import { prepareCSVContent, formatNumber } from './utils/dashboardUtils';
import ProfitSummaryCards from './components/ProfitSummaryCards';
import ProfitTrendChart from './components/ProfitTrendChart';
import OrderSummaryCards from './components/OrderSummaryCards';
import AnalyticsSection from './components/AnalyticsSection';

const FinancialDashboard: React.FC = () => {
  const location = useLocation();
  const [trendView, setTrendView] = useState<'daily' | 'monthly'>('daily');
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics'>('overview');
  const { profitSummary, orderSummary, profitTrendData, loading, error } = useFinancialDashboard(trendView, location.pathname);

  const handleExportReport = () => {
    if (!profitSummary || !orderSummary || !profitTrendData) return;
    const csvContent = prepareCSVContent(profitSummary, orderSummary, profitTrendData, formatNumber);
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
      {activeSection === 'overview' && (
        <>
          <ProfitSummaryCards profitSummary={profitSummary} />
          <div className={styles.trendAnalysis}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Profit Trend Analysis</h2>
              <div className={styles.periodSelector}>
                <button className={trendView === 'daily' ? styles.active : ''} onClick={() => setTrendView('daily')}>Daily (30 Days)</button>
                <button className={trendView === 'monthly' ? styles.active : ''} onClick={() => setTrendView('monthly')}>Monthly (12 Months)</button>
              </div>
            </div>
            <ProfitTrendChart labels={profitTrendData.labels} values={profitTrendData.values} trendView={trendView} />
          </div>
          <OrderSummaryCards orderSummary={orderSummary} />
        </>
      )}
      {activeSection === 'analytics' && (
        <AnalyticsSection profitSummary={profitSummary} orderSummary={orderSummary} />
      )}
    </div>
  );
};

export default FinancialDashboard;
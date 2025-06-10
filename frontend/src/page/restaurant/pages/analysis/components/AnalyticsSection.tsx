import React from 'react';
import styles from '../../../../../styles/financesdashboards.module.css';
import { ProfitSummary, OrderSummary } from '../types/dashboard';
import { formatNumber } from '../utils/dashboardUtils';

interface Props {
  profitSummary: ProfitSummary | null;
  orderSummary: OrderSummary | null;
}

const AnalyticsSection: React.FC<Props> = ({ profitSummary, orderSummary }) => (
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

export default AnalyticsSection;

import React from 'react';
import styles from '../../../../../styles/financesdashboards.module.css';
import { OrderSummary } from '../types/dashboard';
import { renderChangeIndicator } from '../utils/dashboardUtils';

interface Props {
  orderSummary: OrderSummary | null;
}

const OrderSummaryCards: React.FC<Props> = ({ orderSummary }) => (
  <div className={styles.ordersSection}>
    <h2 className={styles.sectionTitle}>Order Volume</h2>
    <div className={styles.cards}>
      <div className={styles.card}>
        <h3>Orders Today</h3>
        <div className={styles.amount}>{orderSummary?.today_orders ?? 0}</div>
        {renderChangeIndicator(orderSummary?.today_change ?? 0, styles)}
        <div className={styles.vs}>vs yesterday</div>
      </div>
      <div className={styles.card}>
        <h3>Orders This Week</h3>
        <div className={styles.amount}>{orderSummary?.week_orders ?? 0}</div>
        {renderChangeIndicator(orderSummary?.week_change ?? 0, styles)}
        <div className={styles.vs}>vs last week</div>
      </div>
      <div className={styles.card}>
        <h3>Orders This Month</h3>
        <div className={styles.amount}>{orderSummary?.month_orders ?? 0}</div>
        {renderChangeIndicator(orderSummary?.month_change ?? 0, styles)}
        <div className={styles.vs}>vs last month</div>
      </div>
    </div>
  </div>
);

export default OrderSummaryCards;

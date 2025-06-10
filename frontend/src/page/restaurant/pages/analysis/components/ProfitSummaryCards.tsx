import React from 'react';
import styles from '../../../../../styles/financesdashboards.module.css';
import { ProfitSummary } from '../types/dashboard';
import { formatNumber, renderChangeIndicator } from '../utils/dashboardUtils';

interface Props {
  profitSummary: ProfitSummary | null;
}

const ProfitSummaryCards: React.FC<Props> = ({ profitSummary }) => (
  <div className={styles.profitSection}>
    <h2 className={styles.sectionTitle}>Total Profit Overview</h2>
    <div className={styles.cards}>
      <div className={styles.card}>
        <h3>Today's Profit</h3>
        <div className={styles.amount}>${formatNumber(profitSummary?.day_profit ?? 0)}</div>
        {renderChangeIndicator(profitSummary?.day_change ?? 0, styles)}
        <div className={styles.vs}>vs yesterday</div>
      </div>
      <div className={styles.card}>
        <h3>This Week's Profit</h3>
        <div className={styles.amount}>${formatNumber(profitSummary?.week_profit ?? 0)}</div>
        {renderChangeIndicator(profitSummary?.week_change ?? 0, styles)}
        <div className={styles.vs}>vs last week</div>
      </div>
      <div className={styles.card}>
        <h3>This Month's Profit</h3>
        <div className={styles.amount}>${formatNumber(profitSummary?.month_profit ?? 0)}</div>
        {renderChangeIndicator(profitSummary?.month_change ?? 0, styles)}
        <div className={styles.vs}>vs last month</div>
      </div>
    </div>
  </div>
);

export default ProfitSummaryCards;

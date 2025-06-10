import React from 'react';
import { ProfitSummary, OrderSummary } from '../types/dashboard';

export const formatNumber = (num: number): string => new Intl.NumberFormat('en-US').format(num);

export const renderChangeIndicator = (change: number, styles: Record<string, string>): React.ReactElement => {
  const className = `${styles.change} ${change >= 0 ? styles.positive : styles.negative}`;
  return React.createElement('div', { className }, React.createElement('span', null, `${Math.abs(change)}%`));
};

export function prepareCSVContent(
  profitSummary: ProfitSummary,
  orderSummary: OrderSummary,
  profitTrendData: { labels: string[]; values: number[] },
  formatNumber: (num: number) => string
): string {
  return [
    ['Profit Summary'],
    ['Period', 'Amount', 'Change'],
    ['Today', `$${formatNumber(profitSummary.day_profit)}`, `${profitSummary.day_change}%`],
    ['This Week', `$${formatNumber(profitSummary.week_profit)}`, `${profitSummary.week_change}%`],
    ['This Month', `$${formatNumber(profitSummary.month_profit)}`, `${profitSummary.month_change}%`],
    [],
    ['Order Summary'],
    ['Period', 'Count', 'Change'],
    ['Today', orderSummary.today_orders, `${orderSummary.today_change}%`],
    ['This Week', orderSummary.week_orders, `${orderSummary.week_change}%`],
    ['This Month', orderSummary.month_orders, `${orderSummary.month_change}%`],
    [],
    ['Profit Trend'],
    ['Date', 'Profit'],
    ...profitTrendData.labels.map((date: string, index: number) => [
      date,
      `$${formatNumber(profitTrendData.values[index])}`
    ])
  ].map(row => row.join(',')).join('\n');
}

export interface ProfitSummary {
  day_profit: number;
  day_change: number;
  week_profit: number;
  week_change: number;
  month_profit: number;
  month_change: number;
}

export interface OrderSummary {
  today_orders: number;
  today_change: number;
  week_orders: number;
  week_change: number;
  month_orders: number;
  month_change: number;
}

export interface ProfitTrendPoint {
  date: string;
  profit: number;
}

export type DashboardSection = 'overview' | 'analytics';

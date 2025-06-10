import { useEffect, useState } from 'react';
import { useApi } from '../../../../../shared/hooks/useApi';
import { ProfitSummary, OrderSummary, ProfitTrendPoint } from '../types/dashboard';

export function useFinancialDashboard(trendView: 'daily' | 'monthly', pathname?: string) {
  const { callApi, clearAllCache } = useApi();
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [profitTrendData, setProfitTrendData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract systemId from localStorage
  const systemId = localStorage.getItem('selectedSystemId');

  useEffect(() => {
    // Force clear cache on navigation
    clearAllCache();
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
        setProfitTrendData({
          labels: profitTrendRes.map((d) => trendView === 'daily' ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })),
          values: profitTrendRes.map((d) => d.profit)
        });
      })
      .catch(() => {
        setError('Failed to load dashboard data');
      })
      .finally(() => setLoading(false));
  }, [systemId, trendView, callApi, pathname, clearAllCache]);

  return { profitSummary, orderSummary, profitTrendData, loading, error };
}

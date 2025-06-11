import { useEffect, useState } from 'react';
import { GoodsReceiving } from '../types/purchase';
import { getGoodsReceiving } from '../utils/api';

export function useGoodsReceiving(systemId: string) {
  const [records, setRecords] = useState<GoodsReceiving[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!systemId) return;
    setLoading(true);
    getGoodsReceiving(systemId)
      .then(setRecords)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [systemId]);

  return { records, loading, error };
}

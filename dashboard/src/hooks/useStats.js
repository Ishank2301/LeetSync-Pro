import { useState, useEffect, useCallback } from "react";

const API = "/api/v1";

export function useStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const r = await fetch(`${API}/stats`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setStats(await r.json());
      setError(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 10_000); // Poll every 10 s
    return () => clearInterval(id);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export async function triggerBulkSync(limit = 20) {
  const r = await fetch(`${API}/bulk-sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit }),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

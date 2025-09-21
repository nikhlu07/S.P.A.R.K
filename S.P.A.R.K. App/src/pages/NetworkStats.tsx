import React, { useEffect, useState } from 'react';

type Metrics = {
  network?: string;
  asOf?: string;
  metrics?: {
    lending?: { loansCreated: number; totalPrincipal: string; loanRepayments: number; totalRepaid: string; uniqueBorrowers: number; uniqueInvestors: number };
    marketing?: { campaigns: number; couponsClaimed: number; uniqueClaimers: number; viralShares: number };
    business?: { businessesRegistered: number };
    trust?: { usersRegistered: number; trustUpdates: number };
  };
};

const MetricCard: React.FC<{ title: string; value: string | number; subtitle?: string } > = ({ title, value, subtitle }) => (
  <div className="bg-gray-900/50 card-border-glow rounded-xl p-6">
    <div className="text-sm uppercase tracking-wider text-gray-400 font-tech">{title}</div>
    <div className="mt-2 text-3xl font-extrabold text-white font-tech text-glow">{value}</div>
    {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode } > = ({ title, children }) => (
  <section>
    <h2 className="text-2xl font-tech font-bold text-white text-glow mb-4">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  </section>
);

const NetworkStats: React.FC = () => {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 60s default
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      setError(null);
      const res = await fetch('/analytics/metrics-kairos.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load metrics: ${res.status}`);
      const json = await res.json();
      setData(json);
      setLastRefreshed(new Date());
    } catch (e: any) {
      setError(e?.message || 'Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    load();
  }, []);

  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return; // polling disabled
    const id = setInterval(() => {
      load();
    }, refreshInterval);
    return () => clearInterval(id);
  }, [refreshInterval]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-tech text-4xl md:text-5xl font-extrabold text-white tracking-tight text-glow">Network Stats</h1>
        <p className="mt-2 text-gray-400">Live KPIs aggregated from Kairos logs. Updated by the on-demand and background metrics scripts.</p>
        {data?.asOf && <p className="text-xs text-gray-500">As of {new Date(data.asOf).toLocaleString()}</p>}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <button onClick={load} disabled={isLoading} className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-tech disabled:opacity-50">
            {isLoading ? 'Refreshing...' : 'Refresh Now'}
          </button>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span>Auto-refresh:</span>
            <select
              className="bg-gray-900/60 border border-gray-700 rounded-md px-2 py-1 text-white"
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={0}>Off</option>
              <option value={15000}>Every 15s</option>
              <option value={30000}>Every 30s</option>
              <option value={60000}>Every 1m</option>
              <option value={300000}>Every 5m</option>
            </select>
            {lastRefreshed && (
              <span className="text-xs text-gray-500">Last refreshed {lastRefreshed.toLocaleTimeString()}</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      <Section title="Lending">
        <MetricCard title="Loans Created" value={data?.metrics?.lending?.loansCreated ?? 0} />
        <MetricCard title="Total Principal (KAIA)" value={data?.metrics?.lending?.totalPrincipal ?? '0'} />
        <MetricCard title="Repayments" value={data?.metrics?.lending?.loanRepayments ?? 0} />
        <MetricCard title="Total Repaid (KAIA)" value={data?.metrics?.lending?.totalRepaid ?? '0'} />
        <MetricCard title="Unique Borrowers" value={data?.metrics?.lending?.uniqueBorrowers ?? 0} />
        <MetricCard title="Unique Investors" value={data?.metrics?.lending?.uniqueInvestors ?? 0} />
      </Section>

      <Section title="Marketing">
        <MetricCard title="Campaigns" value={data?.metrics?.marketing?.campaigns ?? 0} />
        <MetricCard title="Coupons Claimed" value={data?.metrics?.marketing?.couponsClaimed ?? 0} />
        <MetricCard title="Unique Claimers" value={data?.metrics?.marketing?.uniqueClaimers ?? 0} />
        <MetricCard title="Viral Shares" value={data?.metrics?.marketing?.viralShares ?? 0} />
      </Section>

      <Section title="Business">
        <MetricCard title="Businesses Registered" value={data?.metrics?.business?.businessesRegistered ?? 0} />
      </Section>

      <Section title="Trust">
        <MetricCard title="Users Registered" value={data?.metrics?.trust?.usersRegistered ?? 0} />
        <MetricCard title="Trust Updates" value={data?.metrics?.trust?.trustUpdates ?? 0} />
      </Section>
    </div>
  );
};

export default NetworkStats;
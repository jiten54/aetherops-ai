import React, { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  Activity, 
  ChevronDown, 
  Clock, 
  Database, 
  Cpu, 
  Sliders,
  Filter,
  Check,
  RefreshCw,
  HelpCircle,
  FileText
} from "lucide-react";
import { PageId } from "../types";

export default function AnalyticsView() {
  const [timeRange, setTimeRange] = useState<"5m" | "1h" | "12h" | "24h">("12h");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate highly complex metric streams
  const generateTelemetryTimeSeries = (range: string) => {
    const points = range === "5m" ? 10 : range === "1h" ? 20 : 30;
    const data = [];
    const baseTime = Date.now();
    
    for (let i = points; i >= 0; i--) {
      const step = range === "5m" ? 30 * 1000 : range === "1h" ? 3 * 60 * 1000 : 30 * 60 * 1000;
      const t = new Date(baseTime - i * step);
      
      data.push({
        time: `${t.getUTCHours().toString().padStart(2, "0")}:${t.getUTCMinutes().toString().padStart(2, "0")}`,
        p50: Math.floor(14 + Math.sin(i * 0.4) * 3 + Math.random() * 2),
        p90: Math.floor(22 + Math.sin(i * 0.3) * 6 + Math.random() * 4),
        p99: Math.floor(45 + Math.sin(i * 0.2) * 15 + Math.random() * 8),
        ingressTrafficGbps: parseFloat((2.1 + Math.sin(i * 0.3) * 0.5 + Math.random() * 0.3).toFixed(2)),
        egressTrafficGbps: parseFloat((1.6 + Math.sin(i * 0.35) * 0.4 + Math.random() * 0.25).toFixed(2)),
        dbQueryTimeMs: Math.floor(18 + Math.cos(i * 0.5) * 4 + Math.random() * 5),
        dbWritesSec: Math.floor(450 + Math.sin(i * 0.4) * 80 + Math.random() * 50)
      });
    }
    return data;
  };

  const [metricsData, setMetricsData] = useState(() => generateTelemetryTimeSeries(timeRange));

  useEffect(() => {
    setMetricsData(generateTelemetryTimeSeries(timeRange));
  }, [timeRange]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setMetricsData(generateTelemetryTimeSeries(timeRange));
      setIsRefreshing(false);
    }, 600);
  };

  // Static slow query reports (Palantir style audit logs)
  const slowQueriesList = [
    { id: "q-1", sql: "SELECT * FROM public.user_session WHERE active_state = true AND expires < NOW() ORDER BY expires DESC LIMIT 500;", latency: "142 ms", cost: "High Index Scan", count: "34/min" },
    { id: "q-2", sql: "UPDATE public.transaction_registry SET sync_state = 'complete' WHERE batch_uuid = 'f3b8900c-7b8c';", latency: "95 ms", cost: "Row Lock Contention", count: "12/min" },
    { id: "q-3", sql: "SELECT AVG(response_ms), COUNT(request_id) FROM proxy_routing_logs GROUP BY edge_zone_id;", latency: "188 ms", cost: "Seq Scan on logs", count: "6/min" }
  ];

  return (
    <div id="analytics-view" className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* SRE Filter control block */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-3 bg-[#111827]/40 p-4 border border-[#2A3441]/40 rounded-xl text-left">
        <div className="text-left">
          <h1 className="text-xl font-bold font-sans tracking-tight text-[#F3F4F6] flex items-center gap-x-2">
            <TrendingUp className="w-5 h-5 text-[#3B82F6]" />
            Deep-Dive SLA Metrics Console
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Historical metric trace query. Granular latency distributions (P50, P90, P99), backplane networks, and high-frequency PostgreSQL slow query records.
          </p>
        </div>

        <div className="flex items-center gap-x-2.5">
          {/* Time pickers */}
          <div className="bg-[#111827] border border-[#2A3441]/80 rounded-md p-1 flex gap-x-1">
            {(["5m", "1h", "12h", "24h"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded text-[10.5px] font-mono uppercase tracking-wider cursor-pointer font-semibold transition-all ${
                  timeRange === r
                    ? "bg-[#3B82F6] text-white"
                    : "text-[#94A3B8] hover:text-[#F3F4F6]"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button 
            onClick={handleRefresh}
            className="p-2 rounded bg-[#111827] border border-[#2A3441]/80 hover:bg-[#161B22] text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer"
            title="Refresh active metrics telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#3B82F6]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Chart 1: Latency distribution P50/P90/P99 */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] font-sans">
              Gateway SLA Latency Distribution
            </h2>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Percentile latency mapping of edge networks • Target compliance SLA Limit: 50ms
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#2A3441", borderRadius: "8px" }}
                  labelStyle={{ fontFamily: "JetBrains Mono", color: "#F3F4F6", fontSize: "11px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10.5px", fontFamily: "sans-serif", color: "#94A3B8", marginTop: "10px" }} />
                <Line type="monotone" dataKey="p50" stroke="#3B82F6" name="P50 Median" strokeWidth={1.5} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="p90" stroke="#F59E0B" name="P90 High SLA" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="p99" stroke="#EF4444" name="P99 Critical Edge" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Backplane Traffic */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] font-sans">
              Inter-VPC Ingress vs Egress bandwidth
            </h2>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Consolidated bandwidth limits of Kubernetes virtual interface overlays (Gbps)
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="ingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="egrGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#2A3441", borderRadius: "8px" }}
                  labelStyle={{ fontFamily: "JetBrains Mono", color: "#F3F4F6", fontSize: "11px" }}
                />
                <Legend iconType="rect" wrapperStyle={{ fontSize: "10.5px", fontFamily: "sans-serif", marginTop: "10px" }} />
                <Area type="monotone" dataKey="ingressTrafficGbps" stroke="#3B82F6" name="VPC Ingress Rate" fillOpacity={1} fill="url(#ingGradient)" strokeWidth={1} />
                <Area type="monotone" dataKey="egressTrafficGbps" stroke="#10B981" name="VPC Egress Rate" fillOpacity={1} fill="url(#egrGradient)" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Database Query Latency over Time */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] font-sans">
              PostgreSQL Core Cluster Query Response
            </h2>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Average roundtrip response query delays (ms) mapped down to direct SSD writes/sec
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="dbGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#2A3441", borderRadius: "8px" }}
                  labelStyle={{ fontFamily: "JetBrains Mono", color: "#F3F4F6", fontSize: "11px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10.5px", marginTop: "10px" }} />
                <Area type="monotone" dataKey="dbQueryTimeMs" name="Avg Transact Latency" stroke="#10B981" fillOpacity={1} fill="url(#dbGrad)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: High write IOPS */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] font-sans">
              Sustained Disk IOPS Registry
            </h2>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Core database engine write transactions recorded per second
            </span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" opacity={0.2} vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#2A3441", borderRadius: "8px" }}
                  labelStyle={{ fontFamily: "JetBrains Mono", color: "#F3F4F6", fontSize: "11px" }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: "10.5px", marginTop: "10px" }} />
                <Bar dataKey="dbWritesSec" name="Disk Write Operations / sec" fill="#3B82F6" radius={[2, 2, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* PostgreSQL Slow Query Registry table (Palantir SRE style auditing) */}
      <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6]">
            Active SRE Slow Query Ledger
          </h2>
          <span className="text-[10px] font-mono text-[#94A3B8]">
            Automated telemetry capture of transaction queues exceeding standard 50ms index locks
          </span>
        </div>

        <div className="mt-4 border border-[#2A3441]/50 rounded-lg overflow-hidden">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-[#111827] border-b border-[#2A3441]/75 text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">
                <th className="p-3">Query Signature</th>
                <th className="p-3">Average Delay</th>
                <th className="p-3">Identified Impedance</th>
                <th className="p-3 text-right">Frequency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3441]/40 font-mono text-[11px] text-[#F3F4F6]">
              {slowQueriesList.map((q) => (
                <tr key={q.id} className="hover:bg-[#111827]/40 leading-relaxed">
                  <td className="p-3 max-w-sm sm:max-w-md md:max-w-xl truncate text-[#F3F4F6]/90 select-text" title={q.sql}>
                    <code>{q.sql}</code>
                  </td>
                  <td className="p-3 font-semibold text-orange-400">{q.latency}</td>
                  <td className="p-3 text-zinc-400">{q.cost}</td>
                  <td className="p-3 text-right text-[#3B82F6] font-semibold">{q.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

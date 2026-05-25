import React, { useState, useEffect } from "react";
import { 
  Server, 
  Cpu, 
  Database, 
  Zap, 
  Terminal as TerminalIcon, 
  RefreshCw, 
  AlertTriangle, 
  Activity, 
  CheckCircle, 
  Sliders, 
  ArrowUpRight,
  Plus,
  Play
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from "recharts";
import { motion } from "motion/react";
import { GlobalPlaneState, NodeTelemetry, PageId } from "../types";

interface DashboardViewProps {
  systemData: GlobalPlaneState;
  onQuickAction: (actionType: string, payload?: any) => void;
  setCurrentPage: (page: PageId) => void;
  refreshStats: () => void;
  isSyncing: boolean;
}

// Generate Datadog/Bloomberg style mock historical data for recharts
const generateHistoricalData = (hours = 12) => {
  const data = [];
  const baseTime = Date.now();
  for (let i = hours; i >= 0; i--) {
    const t = new Date(baseTime - i * 5 * 60 * 1000); // 5 min intervals
    data.push({
      time: `${t.getUTCHours().toString().padStart(2, "0")}:${t.getUTCMinutes().toString().padStart(2, "0")}`,
      cpu: Math.floor(48 + Math.sin(i * 0.5) * 12 + Math.random() * 6),
      network: parseFloat((1.3 + Math.sin(i * 0.4) * 0.3 + Math.random() * 0.2).toFixed(2)),
      latency: Math.floor(22 + Math.sin(i * 0.3) * 5 + Math.random() * 4)
    });
  }
  return data;
};

export default function DashboardView({ 
  systemData, 
  onQuickAction, 
  setCurrentPage,
  refreshStats,
  isSyncing 
}: DashboardViewProps) {
  const { systemStats, nodes, logs, services } = systemData;
  const [chartData, setChartData] = useState(() => generateHistoricalData());
  const [logFilter, setLogFilter] = useState<"all" | "info" | "warn" | "error" | "success">("all");

  // Occasionally tick up historical data values to feel completely alive
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prev) => {
        const nextTime = new Date();
        const nextObj = {
          time: `${nextTime.getUTCHours().toString().padStart(2, "0")}:${nextTime.getUTCMinutes().toString().padStart(2, "0")}`,
          cpu: Math.floor(45 + Math.random() * 20),
          network: parseFloat((1.2 + Math.random() * 0.8).toFixed(2)),
          latency: Math.floor(20 + Math.random() * 10)
        };
        const updated = [...prev.slice(1), nextObj];
        return updated;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(l => logFilter === "all" || l.level === logFilter);

  // Quick helper to translate severity style
  const getLogClass = (level: string) => {
    switch (level) {
      case "error": return "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25";
      case "warn": return "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25";
      case "success": return "text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25";
      default: return "text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/25";
    }
  };

  return (
    <div id="overview-view" className="flex-1 overflow-y-auto p-6 space-y-6">
      
      {/* Page Header banner */}
      <div className="flex justify-between items-center bg-[#111827]/40 p-4 border border-[#2A3441]/40 rounded-xl">
        <div className="text-left">
          <h1 className="text-xl font-bold font-sans tracking-tight text-[#F3F4F6] flex items-center gap-x-2">
            Operations Telemetry Desk
            <span className="text-[10px] bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 px-2 py-0.5 rounded-full font-mono uppercase font-semibold">
              Primary Node
            </span>
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Real-time status of distributed microservice modules, edge routes, and pipeline sync state.
          </p>
        </div>

        <div className="flex items-center gap-x-3">
          <button 
            onClick={refreshStats}
            className="flex items-center gap-x-1.5 text-xs text-[#94A3B8] hover:text-[#F3F4F6] bg-[#111827] border border-[#2A3441]/80 px-3.5 py-1.75 rounded-md hover:bg-[#161B22] cursor-pointer transition-all focus:outline-none"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#3B82F6]" : ""}`} />
            <span>Force Sync Telemetry</span>
          </button>
          
          <button 
            onClick={() => setCurrentPage("ai-workspace")}
            className="flex items-center gap-x-1.5 text-xs text-[#F3F4F6] bg-[#3B82F6] hover:bg-blue-600 px-3.5 py-1.75 rounded-md cursor-pointer font-medium transition-all focus:outline-none shadow-sm shadow-blue-500/10"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Diagnose with Co-pilot</span>
          </button>
        </div>
      </div>

      {/* SRE Core KPI Cards Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: System Health */}
        <div className="bg-[#161B22]/90 border border-[#2A3441]/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#94A3B8] uppercase">PLANE HEALTH SCORE</span>
            <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center border border-[#10B981]/15">
              <CheckCircle className="w-4 h-4 text-[#10B981]" />
            </div>
          </div>
          <div className="mt-3 text-left">
            <h3 className="text-2xl font-bold font-sans tracking-tight text-[#F3F4F6] leading-none mb-1.5">
              {systemStats.healthScore}%
            </h3>
            <div className="flex items-center text-[10px] font-mono text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block mr-1.5 animate-pulse"></span>
              99.987% SLA Threshold compliant
            </div>
          </div>
        </div>

        {/* KPI 2: Global CPU Load */}
        <div className="bg-[#161B22]/90 border border-[#2A3441]/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#94A3B8] uppercase">CORE CPU CORES</span>
            <div className="w-7 h-7 rounded-lg bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/15">
              <Cpu className="w-4 h-4 text-[#3B82F6]" />
            </div>
          </div>
          <div className="mt-3 text-left">
            <h3 className="text-2xl font-bold font-sans tracking-tight text-[#F3F4F6] leading-none mb-1.5">
              {systemStats.globalCpu}%
            </h3>
            <div className="flex items-center text-[10px] font-mono text-[#94A3B8]">
              4 clusters / 16 hyper-threads active
            </div>
          </div>
        </div>

        {/* KPI 3: Memory Density */}
        <div className="bg-[#161B22]/90 border border-[#2A3441]/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#94A3B8] uppercase">RAM ALLOCATION</span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/15">
              <Database className="w-4 h-4 text-[#F59E0B]" />
            </div>
          </div>
          <div className="mt-3 text-left">
            <h3 className="text-2xl font-bold font-sans tracking-tight text-[#F3F4F6] leading-none mb-1.5">
              {systemStats.globalMemory}%
            </h3>
            <div className="flex items-center text-[10px] font-mono text-[#F59E0B]">
              Buffer capacity remaining: OK
            </div>
          </div>
        </div>

        {/* KPI 4: Net Throughput */}
        <div className="bg-[#161B22]/90 border border-[#2A3441]/80 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono font-bold tracking-wider text-[#94A3B8] uppercase">NET THROUGHPUT</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/15">
              <Zap className="w-4 h-4 text-[#3B82F6]" />
            </div>
          </div>
          <div className="mt-3 text-left">
            <h3 className="text-2xl font-bold font-sans tracking-tight text-[#F3F4F6] leading-none mb-1.5">
              {systemStats.networkThroughputGbps} Gbps
            </h3>
            <div className="flex items-center text-[10px] font-mono text-[#10B981]">
              99.999% Packet delivery score
            </div>
          </div>
        </div>
      </div>

      {/* SRE Core Analytics: Bloomberg / Datadog style Grafana charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Card 1: Combined Cluster CPU Load */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] font-sans">
                Consolidated Processor Cycles
              </h2>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                Continuous 5m samples • Active kernel metrics
              </span>
            </div>
            <div className="flex items-center gap-x-1.5 bg-[#111827] px-2 py-1 rounded border border-[#2A3441]/50 text-[10px] font-mono text-[#94A3B8]">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#3B82F6] inline-block opacity-80" />
              <span>OVERHEAD</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3441" opacity={0.3} vertical={false} />
                <XAxis dataKey="time" stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#94A3B8" opacity={0.5} tickLine={false} fontSize={10} fontFamily="JetBrains Mono" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#2A3441", borderRadius: "8px" }}
                  labelStyle={{ fontFamily: "JetBrains Mono", color: "#F3F4F6", fontSize: "11px" }}
                  itemStyle={{ fontFamily: "sans-serif", color: "#94A3B8", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={1} fill="url(#cpuGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart Card 2: Packet Ingress / Latency Chart */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="text-left">
              <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] font-sans">
                Interface Traffic & SLA Latency
              </h2>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                WAN Ingress rate (Gbps) / TCP Roundtrip time (ms)
              </span>
            </div>
            <div className="flex gap-x-3 text-[10px] font-mono">
              <div className="flex items-center gap-x-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-400 opacity-80" />
                <span className="text-[#94A3B8]">INGRESS</span>
              </div>
              <div className="flex items-center gap-x-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-400 opacity-80" />
                <span className="text-[#94A3B8]">LATENCY</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.01}/>
                  </linearGradient>
                  <linearGradient id="latGradient" x1="0" y1="0" x2="0" y2="1">
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
                  itemStyle={{ fontFamily: "sans-serif", color: "#94A3B8", fontSize: "11px" }}
                />
                <Area type="monotone" dataKey="network" stroke="#3B82F6" strokeWidth={1.5} fillOpacity={1} fill="url(#netGradient)" />
                <Area type="monotone" dataKey="latency" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#latGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Nodes Overview Matrix & Microactions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Blocks: Node Server Instances */}
        <div className="xl:col-span-2 bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6]">
                Compute Nodes Registry
              </h2>
              <span className="text-[10px] font-mono text-[#94A3B8]">
                Raw server status metrics and active virtualization points
              </span>
            </div>
            <button 
              onClick={() => setCurrentPage("services")} 
              className="text-[10px] font-mono text-[#3B82F6] hover:text-[#3B82F6]/80 flex items-center gap-x-0.5"
            >
              Manage Containers <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          {/* Nodes Table/Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.map((node) => {
              const isHigh = node.cpu >= 80;
              return (
                <div 
                  key={node.id}
                  className={`bg-[#111827]/80 rounded-lg p-3.5 border ${
                    node.status === "warning" 
                      ? "border-orange-500/40 bg-orange-500/5" 
                      : "border-[#2A3441]/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div className="flex items-center gap-x-2">
                      <Server className={`w-4 h-4 ${node.status === "warning" ? "text-orange-400" : "text-[#3B82F6]"}`} />
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-[#F3F4F6] font-mono">{node.name}</span>
                        <span className="text-[9px] font-mono text-[#94A3B8] uppercase">{node.zone}</span>
                      </div>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase tracking-wide leading-none ${
                      node.status === "healthy" 
                        ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20" 
                        : "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20"
                    }`}>
                      {node.status}
                    </span>
                  </div>

                  {/* CPU Progress */}
                  <div className="space-y-1 mt-1">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#94A3B8]">
                      <span>Workload Capacity</span>
                      <span className={isHigh ? "text-orange-400 font-bold" : "text-[#F3F4F6]"}>{node.cpu}%</span>
                    </div>
                    <div className="w-full bg-[#1F2937]/80 rounded-full h-1overflow-hidden">
                      <div 
                        className={`h-1 rounded-full transition-all ${
                          isHigh ? "bg-[#F59E0B]" : "bg-[#3B82F6]"
                        }`}
                        style={{ width: `${node.cpu}%` }}
                      />
                    </div>
                  </div>

                  {/* RAM Allocation */}
                  <div className="space-y-1 mt-2.5">
                    <div className="flex justify-between items-center text-[10px] font-mono text-[#94A3B8]">
                      <span>Swap Resident Mem</span>
                      <span className="text-[#F3F4F6]">{node.mem}%</span>
                    </div>
                    <div className="w-full bg-[#1F2937]/80 rounded-full h-1 overflow-hidden">
                      <div 
                        className="h-1 bg-emerald-500 rounded-full" 
                        style={{ width: `${node.mem}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#2A3441]/30">
                    <span className="text-[9.5px] font-mono text-[#94A3B8]">Net: {node.network} MB/s</span>
                    {node.status === "warning" && (
                      <button
                        onClick={() => onQuickAction("resolve_node_warning", node.id)}
                        className="text-[9px] font-mono text-[#F59E0B] hover:underline bg-[#F59E0B]/15 px-2 py-0.5 border border-[#F59E0B]/25 rounded cursor-pointer"
                      >
                        Adjust Pacing
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6]">
              Aether Control Actions
            </h2>
            <p className="text-[10px] font-sans text-[#94A3B8] mt-0.5">
              Direct operations triggers targeted to container worker pools.
            </p>

            <div className="flex flex-col gap-y-2 mt-4">
              <button 
                onClick={() => onQuickAction("increase_pods")}
                className="w-full flex items-center justify-between text-xs text-[#94A3B8] bg-[#111827] border border-[#2A3441]/65 hover:border-[#3B82F6]/50 hover:bg-[#111827]/80 hover:text-[#F3F4F6] px-3 py-2 rounded-lg transition-all text-left cursor-pointer"
              >
                <span className="font-medium font-sans">Scale Ingress Clusters</span>
                <span className="font-mono text-[10px] text-[#3B82F6] flex items-center"><Plus className="w-3.5 h-3.5" /> ADD_POD</span>
              </button>
              
              <button 
                onClick={() => onQuickAction("cycle_cache")}
                className="w-full flex items-center justify-between text-xs text-[#94A3B8] bg-[#111827] border border-[#2A3441]/65 hover:border-[#3B82F6]/50 hover:bg-[#111827]/80 hover:text-[#F3F4F6] px-3 py-2 rounded-lg transition-all text-left cursor-pointer"
              >
                <span className="font-medium font-sans">Evict Redis Cache Key Store</span>
                <span className="font-mono text-[10px] text-emerald-400 flex items-center"><RefreshCw className="w-3 h-3 mr-0.5" /> FLUSH</span>
              </button>

              <button 
                onClick={() => onQuickAction("stabilize_nodes")}
                className="w-full flex items-center justify-between text-xs text-[#94A3B8] bg-[#111827] border border-[#2A3441]/65 hover:border-[#3B82F6]/50 hover:bg-[#111827]/80 hover:text-[#F3F4F6] px-3 py-2 rounded-lg transition-all text-left cursor-pointer"
              >
                <span className="font-medium font-sans">Automated Workload Balancing</span>
                <span className="font-mono text-[10px] text-blue-400 flex items-center"><Play className="w-3 h-3 mr-0.5" /> RE-DENSITY</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#2A3441]/40 text-center bg-[#111827]/50 rounded-lg p-2 border border-[#2A3441]/25">
            <span className="text-[10px] text-[#94A3B8] block text-left">Enterprise Configuration Node-A</span>
            <div className="flex justify-between items-center mt-1">
              <span className="text-[11px] font-mono text-[#F3F4F6] font-semibold">aether-prod-core-33s</span>
              <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20 px-1.5 py-0.2 rounded font-mono">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal Realtime Logs Console */}
      <div className="bg-[#111827]/90 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm text-left">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-2 mb-3 px-1">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] flex items-center gap-x-2">
              <TerminalIcon className="w-4 h-4 text-[#3B82F6]" />
              Distributed Logs Terminal
            </h2>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Live telemetry ingress reports • Microservice streaming standard outputs
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-x-1.5 gap-y-1.5 text-[10.5px] font-mono">
            {(["all", "info", "success", "warn", "error"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setLogFilter(filter)}
                className={`px-2 py-0.75 rounded-md border text-[10px] uppercase font-mono tracking-wide cursor-pointer transition-all ${
                  logFilter === filter
                    ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                    : "bg-[#111827] border-[#2A3441]/60 text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#161B22]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Console Box */}
        <div className="bg-[#0B0F14] border border-[#2A3441]/80 rounded-lg p-4 font-mono text-xs overflow-y-auto max-h-72 space-y-2 select-text custom-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="text-[#94A3B8]/50 text-center py-6 text-xs">
              NO MATCHING SYSTEM LOGS FOUND IN STREAM QUEUE
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="flex flex-col sm:flex-row items-start font-mono text-[11px] leading-relaxed border-b border-[#111827] pb-1.5 hover:bg-[#111827]/25 px-1 rounded transition-colors">
                {/* Timestamp */}
                <span className="text-[#94A3B8]/60 shrink-0 select-none mr-3 leading-none sm:pt-0.5">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                
                {/* Level Badge */}
                <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wide leading-none select-none shrink-0 font-bold border mr-3 border-transparent ${getLogClass(log.level)}`}>
                  {log.level}
                </span>

                {/* Source Badge */}
                <span className="text-zinc-400 font-bold shrink-0 select-none mr-2">
                  [{log.source}]:
                </span>

                {/* Message */}
                <span className="text-[#F3F4F6] text-left break-all font-mono leading-tight">
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

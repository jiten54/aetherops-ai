import React, { useState } from "react";
import { 
  Network, 
  Server, 
  Settings, 
  RotateCw, 
  Activity, 
  HardDrive, 
  User, 
  Cpu, 
  TrendingUp, 
  ChevronRight,
  Database,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RefreshCcw,
  Zap
} from "lucide-react";
import { PageId, ServiceTelemetry, GlobalPlaneState } from "../types";
import { motion } from "motion/react";

interface MonitoringViewProps {
  systemData: GlobalPlaneState;
  onScalePod: (serviceId: string, amount: number) => void;
  onResetService: (serviceId: string) => void;
  setCurrentPage: (page: PageId) => void;
}

export default function MonitoringView({ 
  systemData, 
  onScalePod, 
  onResetService,
  setCurrentPage 
}: MonitoringViewProps) {
  const { services, nodes } = systemData;
  const [selectedServiceId, setSelectedServiceId] = useState<string>("s-1");

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  // Helper to translate tier icons
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "database": return <Database className="w-4 h-4 text-emerald-400" />;
      case "cache": return <Cpu className="w-4 h-4 text-orange-400" />;
      case "routing": return <Network className="w-4 h-4 text-blue-400" />;
      default: return <Server className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div id="monitoring-view" className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col lg:flex-row gap-x-6 gap-y-6">
      
      {/* Left panel: Topology Map and Service Clusters list */}
      <div className="flex-1 space-y-6 text-left">
        
        {/* Topology Panel */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] flex items-center gap-x-2">
              <Network className="w-4 h-4 text-[#3B82F6]" />
              Active System Topology Routing Map
            </h2>
            <span className="text-[10px] font-mono text-[#94A3B8]">
              Interactive physical route tracing from external user clients to localized worker databases
            </span>
          </div>

          {/* SVG Topology Chart */}
          <div className="mt-5 bg-[#0B0F14] border border-[#2A3441]/60 rounded-xl p-4 flex items-center justify-center relative overflow-hidden h-64 select-none">
            
            {/* SVG Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="blueGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Connections Users -> Ingress Router */}
              <path d="M 60,110 C 130,110 130,110 200,110" stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" fill="none" opacity="0.4" />
              <path d="M 60,110 C 130,110 130,110 200,110" stroke="url(#blueGlow)" strokeWidth="1.5" fill="none" strokeDasharray="10 15" strokeDashoffset="2" className="animate-pulse" />

              {/* Connections Ingress -> Core API */}
              <path d="M 330,110 C 370,110 370,110 410,110" stroke="#2A3441" strokeWidth="1" fill="none" />
              
              {/* Core API -> Auth, DB, Cache */}
              <path d="M 540,110 C 580,110 585,50 630,50" stroke="#2A3441" strokeWidth="1" fill="none" />
              <path d="M 540,110 C 580,110 585,110 630,110" stroke="#2A3441" strokeWidth="1" fill="none" />
              <path d="M 540,110 C 580,110 585,170 630,170" stroke="#2A3441" strokeWidth="1" fill="none" />
            </svg>

            {/* Logical Blocks Absolute Overlays */}
            <div className="relative w-full h-full flex justify-between items-center px-4">
              
              {/* Block 1: Clients */}
              <div className="flex flex-col items-center z-10">
                <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[#2A3441]/70 flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <span className="text-[10px] font-mono mt-1.5 text-[#94A3B8]">CLIENT USERS</span>
                <span className="text-[9px] font-mono text-[#10B981]">HTTP Traffic</span>
              </div>

              {/* Block 2: Ingress Router */}
              <button 
                onClick={() => setSelectedServiceId("s-1")}
                className={`flex flex-col items-center z-10 cursor-pointer focus:outline-none transition-all ${selectedServiceId === "s-1" ? "scale-105" : "hover:opacity-90"}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-col shadow-lg border ${
                  selectedServiceId === "s-1" ? "bg-[#3B82F6]/10 border-[#3B82F6] shadow-[#3B82F6]/5" : "bg-[#111827] border-[#2A3441]"
                }`}>
                  <Network className={`w-6 h-6 ${selectedServiceId === "s-1" ? "text-[#3B82F6]" : "text-gray-400"}`} />
                </div>
                <span className="text-[10px] font-mono mt-1.5 text-[#F3F4F6] font-semibold">INGRESS ROUTER</span>
                <span className="text-[9px] font-mono text-[#10B981]">4 Pods Healthy</span>
              </button>

              {/* Block 3: API Gateway */}
              <button 
                onClick={() => setSelectedServiceId("s-2")}
                className={`flex flex-col items-center z-10 cursor-pointer focus:outline-none transition-all ${selectedServiceId === "s-2" ? "scale-105" : "hover:opacity-90"}`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-col shadow-lg border ${
                  selectedServiceId === "s-2" ? "bg-[#3B82F6]/10 border-[#3B82F6]" : "bg-[#111827] border-[#2A3441]"
                }`}>
                  <Settings className={`w-6 h-6 ${selectedServiceId === "s-2" ? "text-[#3B82F6]" : "text-gray-400"}`} />
                </div>
                <span className="text-[10px] font-mono mt-1.5 text-[#F3F4F6] font-semibold">API GATEWAY</span>
                <span className="text-[9px] font-mono text-[#10B981]">6 Pods Active</span>
              </button>

              {/* Backend Cluster Nodes Col */}
              <div className="flex flex-col gap-y-4 justify-center">
                {/* Auth */}
                <button 
                  onClick={() => setSelectedServiceId("s-3")}
                  className={`flex items-center gap-x-2.5 bg-[#111827] px-3 py-1.75 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedServiceId === "s-3" ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-[#2A3441]/70"
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-[#2A3441]/40 flex items-center justify-center">
                    <Server className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#F3F4F6] leading-none font-semibold">User-Auth</span>
                    <span className="text-[9px] font-mono text-[#94A3B8] leading-none mt-1">s-3 • 3 Replicas</span>
                  </div>
                </button>

                {/* Postgres */}
                <button 
                  onClick={() => setSelectedServiceId("s-4")}
                  className={`flex items-center gap-x-2.5 bg-[#111827] px-3 py-1.75 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedServiceId === "s-4" ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-[#2A3441]/70"
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-[#2A3441]/40 flex items-center justify-center">
                    <Database className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#F3F4F6] leading-none font-semibold">Postgres-SQL</span>
                    <span className="text-[9px] font-mono text-emerald-400 leading-none mt-1">s-4 • Cluster OK</span>
                  </div>
                </button>

                {/* Redis */}
                <button 
                  onClick={() => setSelectedServiceId("s-5")}
                  className={`flex items-center gap-x-2.5 bg-[#111827] px-3 py-1.75 rounded-lg border text-left cursor-pointer transition-all ${
                    selectedServiceId === "s-5" ? "border-[#3B82F6] bg-[#3B82F6]/5" : "border-[#2A3441]/70"
                  }`}
                >
                  <div className="w-7 h-7 rounded bg-[#2A3441]/40 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#F3F4F6] leading-none font-semibold">Redis Cache</span>
                    <span className="text-[9px] font-mono text-orange-400 leading-none mt-1">s-5 • 3 Replicas</span>
                  </div>
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Services List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => {
            const isSelected = selectedServiceId === service.id;
            return (
              <div 
                key={service.id}
                onClick={() => setSelectedServiceId(service.id)}
                className={`bg-[#161B22]/95 border p-4.5 rounded-xl cursor-pointer text-left transition-all relative ${
                  isSelected 
                    ? "border-[#3B82F6] bg-[#161B22]/100 shadow-md shadow-blue-500/5 scale-[1.01]" 
                    : "border-[#2A3441]/80 hover:border-[#2A3441] hover:bg-[#161B22]/100"
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#2A3441]/60 flex items-center justify-center">
                      {getTierIcon(service.tier)}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="text-xs font-semibold text-[#F3F4F6]">{service.name}</h3>
                      <span className="text-[9px] font-mono text-[#94A3B8] uppercase">{service.tier} Service</span>
                    </div>
                  </div>
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-mono uppercase border shrink-0 leading-none font-bold ${
                    service.status === "active" 
                      ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20" 
                      : "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20"
                  }`}>
                    {service.status}
                  </span>
                </div>

                {/* Quick Telemetry Line metrics */}
                <div className="grid grid-cols-3 gap-y-2 pt-2 border-t border-[#2A3441]/40 text-left">
                  <div>
                    <span className="text-[9px] font-mono text-[#94A3B8] block">TCP LAYOUT</span>
                    <span className="text-xs font-semibold text-[#F3F4F6] font-mono">{service.currentResponseMs}ms</span>
                    <span className="text-[8px] font-mono text-[#3B82F6] block">SLA: {service.targetResponseMs}ms</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-[#94A3B8] block">WORK RATE</span>
                    <span className="text-xs font-semibold text-[#F3F4F6] font-mono">{(service.requestRateSecs / 1000).toFixed(1)}k/s</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-[#94A3B8] block">POD INSTS</span>
                    <span className="text-xs font-semibold text-[#F3F4F6] font-mono">{service.podsCount} running</span>
                  </div>
                </div>

                {isSelected && (
                  <div className="absolute right-3.5 bottom-3 text-[#3B82F6] flex items-center gap-x-0.5 text-[9px] font-mono">
                    ACTIVE <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right panel: Selected Service Detail & Container scale controls */}
      <div className="w-full lg:w-96 shrink-0 text-left bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div className="space-y-6">
          
          {/* Service Title header */}
          <div className="border-b border-[#2A3441]/60 pb-4">
            <div className="flex items-center gap-x-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-[#0B0F14] border border-[#2A3441]/80 flex items-center justify-center">
                {getTierIcon(selectedService.tier)}
              </div>
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-[#F3F4F6]">{selectedService.name}</h2>
                <span className="text-[9.5px] font-mono text-[#3B82F6]">{selectedService.id.toUpperCase()} • CLUSTER CONFIG</span>
              </div>
            </div>
            
            <p className="text-[11.5px] text-[#94A3B8]">
              High capacity microservice container routing requests inside our VPC. Current routing latency is balanced in node regions.
            </p>
          </div>

          {/* SLA Analysis */}
          <div className="space-y-3 bg-[#111827] rounded-lg p-3.5 border border-[#2A3441]/40">
            <h3 className="text-[10px] font-mono tracking-wider text-[#94A3B8] uppercase">CORE SLA METRIC BARS</h3>

            <div className="space-y-2">
              {/* Target Response times */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-[#94A3B8]">Target SLA Latency</span>
                  <span className="text-[#F3F4F6] font-semibold">{selectedService.targetResponseMs} ms</span>
                </div>
                <div className="w-full bg-[#1F2937]/80 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>

              {/* Actual Latencies */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-[#94A3B8]">Actual Transit SLA</span>
                  <span className={`font-semibold ${selectedService.currentResponseMs > selectedService.targetResponseMs ? "text-[#EF4444]" : "text-[#10B981]"}`}>
                    {selectedService.currentResponseMs} ms
                  </span>
                </div>
                <div className="w-full bg-[#1F2937]/80 rounded-full h-1 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${Math.min(100, (selectedService.currentResponseMs / selectedService.targetResponseMs) * 100)}%` }} 
                  />
                </div>
              </div>

              {/* Ingress Error Rates */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10.5px] font-mono">
                  <span className="text-[#94A3B8]">HTTP Error Rate</span>
                  <span className="text-[#F3F4F6] font-semibold">{selectedService.errorRate}%</span>
                </div>
                <div className="w-full bg-[#1F2937]/80 rounded-full h-1 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${selectedService.errorRate * 12}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Pod Scaling Console Controls */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-mono tracking-wider text-[#94A3B8] uppercase">CONTAINER POD REPLICAS ({selectedService.podsCount})</h3>

            <div className="flex items-center gap-x-2">
              <button 
                onClick={() => onScalePod(selectedService.id, -1)}
                disabled={selectedService.podsCount <= 1}
                className="flex-1 text-center font-mono py-1.5 rounded-md border border-[#2A3441] text-xs text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#111827] focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                SCALE_DOWN
              </button>
              
              <button 
                onClick={() => onScalePod(selectedService.id, 1)}
                disabled={selectedService.podsCount >= 8}
                className="flex-1 text-center font-mono py-1.5 bg-[#3B82F6] rounded-md text-xs font-semibold text-white hover:bg-blue-600 focus:outline-none cursor-pointer disabled:opacity-50"
              >
                SCALE_UP (+1)
              </button>
            </div>
          </div>

          {/* Node binding overview */}
          <div className="space-y-2">
            <h3 className="text-[10px] font-mono tracking-wider text-[#94A3B8] uppercase">PHYSICAL CORE HOST BINDING</h3>
            <div className="bg-[#0B0F14] rounded-lg p-2.5 border border-[#2A3441]/40 font-mono text-[9px] space-y-1.5 text-[#94A3B8]">
              <div className="flex justify-between">
                <span>VPC_ID</span>
                <span className="text-[#F3F4F6]">vpc-99ac-f8e2</span>
              </div>
              <div className="flex justify-between">
                <span>SUBNET_IP_ZONE</span>
                <span className="text-[#F3F4F6]">10.0.44.0/24</span>
              </div>
              <div className="flex justify-between">
                <span>DOCKER_IMAGE_TAG</span>
                <span className="text-[#3B82F6]">aether/{selectedService.id}:v2.14.8</span>
              </div>
              <div className="flex justify-between">
                <span>ORCHESTRATION</span>
                <span className="text-[#10B981]">K8S_PROXY_OK</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons footer */}
        <div className="pt-4 border-t border-[#2A3441]/60 mt-6 flex gap-x-2">
          <button 
            onClick={() => onResetService(selectedService.id)}
            className="flex-1 cursor-pointer hover:bg-[#1F2937] text-center font-mono text-[10px] uppercase py-2 bg-[#111827] border border-[#2A3441] text-zinc-300 font-semibold rounded-md flex items-center justify-center gap-x-1"
          >
            <RefreshCcw className="w-3.5 h-3.5 text-zinc-400" /> RESTART_SERVICE
          </button>
          
          <button 
            onClick={() => setCurrentPage("ai-workspace")}
            className="flex-1 cursor-pointer bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/40 text-[#3B82F6] font-semibold text-center font-mono text-[10px] py-2 rounded-md flex items-center justify-center gap-x-1"
          >
            <Zap className="w-3.5 h-3.5" /> CORE_DIAGNOSE
          </button>
        </div>

      </div>

    </div>
  );
}

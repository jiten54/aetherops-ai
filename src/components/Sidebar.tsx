import React from "react";
import { 
  LayoutGrid, 
  Network, 
  LineChart, 
  GitBranch, 
  Bot, 
  ShieldAlert, 
  Settings, 
  Server,
  Sparkles,
  Terminal,
  LogOut,
  Sliders
} from "lucide-react";
import { PageId } from "../types";
import { motion } from "motion/react";

interface SidebarProps {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  activeIncidentsCount: number;
  healthScore: number;
  uptimeSla: number;
}

export default function Sidebar({ 
  currentPage, 
  setCurrentPage, 
  activeIncidentsCount,
  healthScore,
  uptimeSla
}: SidebarProps) {
  
  const navItems = [
    { id: "overview" as PageId, label: "Console Overview", icon: LayoutGrid, count: null },
    { id: "services" as PageId, label: "Service Clusters", icon: Network, count: null },
    { id: "analytics" as PageId, label: "SLA Metrics", icon: LineChart, count: null },
    { id: "timeline" as PageId, label: "Release Registry", icon: GitBranch, count: null },
    { id: "ai-workspace" as PageId, label: "Aether AI Workspace", icon: Sparkles, count: null, glow: true },
    { id: "incidents" as PageId, label: "Incidents Matrix", icon: ShieldAlert, count: activeIncidentsCount },
  ];

  return (
    <aside 
      id="main-sidebar"
      className="w-64 bg-[#0B0F14] border-r border-[#2A3441]/80 h-screen flex flex-col justify-between select-none shrink-0"
    >
      {/* Top Brand Block */}
      <div className="flex flex-col pt-6 px-5 gap-y-7">
        <div className="flex items-center gap-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3B82F6] to-[#60A5FA] flex items-center justify-center shadow-md shadow-blue-500/10">
            <Server className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-[#F3F4F6] font-sans">
              AETHER PLANE
            </span>
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-widest leading-none mt-0.5">
              Enterprise SRE v2.14
            </span>
          </div>
        </div>

        {/* System Health Summary Bar */}
        <div className="bg-[#111827] border border-[#2A3441]/50 rounded-lg p-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-mono text-[#94A3B8] uppercase tracking-wider">Control Plane Load</span>
            <span className="text-[10px] font-mono text-[#10B981] font-medium">{healthScore}% OK</span>
          </div>
          <div className="w-full bg-[#1F2937] rounded-full h-1 overflow-hidden">
            <motion.div 
              className="bg-[#3B82F6] h-full rounded-full" 
              initial={{ width: "0%" }}
              animate={{ width: `${healthScore}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-[9px] text-[#94A3B8] font-mono">
            <span>SLA: {uptimeSla}%</span>
            <span className="flex items-center gap-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              LIVE FEED
            </span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex flex-col gap-y-1">
          <span className="text-[10px] font-mono text-[#94A3B8]/60 uppercase tracking-widest pl-2 mb-2">
            Operations
          </span>
          {navItems.map((item) => {
            const isActive = currentPage === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`relative group w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs font-medium tracking-tight transition-all text-left outline-none ${
                  isActive 
                    ? "bg-[#161B22] text-[#F3F4F6] border border-[#2A3441]/50" 
                    : item.glow
                    ? "text-[#3B82F6] hover:text-[#60A5FA] hover:bg-[#111827]/65 border border-transparent"
                    : "text-[#94A3B8] hover:text-[#F3F4F6] hover:bg-[#111827]/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-x-2.5">
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? "text-[#3B82F6]" 
                      : item.glow 
                      ? "text-[#3B82F6] group-hover:animate-pulse" 
                      : "text-[#94A3B8] group-hover:text-[#F3F4F6]"
                  }`} />
                  <span className="font-sans font-medium">{item.label}</span>
                </div>

                {item.count !== null && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none ${
                    item.count > 0 
                      ? "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20 animate-pulse" 
                      : "bg-[#111827] text-[#94A3B8]"
                  }`}>
                    {item.count}
                  </span>
                )}

                {item.glow && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-[#3B82F6] shadow-sm shadow-blue-500 animate-ping"></span>
                )}

                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-indicator" 
                    className="absolute left-0 top-2 bottom-2 w-0.75 bg-[#3B82F6] rounded-r-full"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Configuration Block */}
      <div className="p-4 border-t border-[#2A3441]/60 flex flex-col gap-y-3 bg-[#0B0F14]">
        {/* Environment Selector Mock */}
        <div className="flex items-center justify-between text-xs font-medium text-[#94A3B8] bg-[#111827] px-2.5 py-1.5 rounded border border-[#2A3441]/40">
          <div className="flex items-center gap-x-1.5 font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            <span>CLUSTER_US_EAST</span>
          </div>
          <Sliders className="w-3.5 h-3.5 text-[#94A3B8]/80 cursor-pointer hover:text-white" />
        </div>

        {/* Profile User Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2.5 overflow-hidden">
            <div className="relative w-8 h-8 rounded-full bg-[#2A3441] border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
              <span className="text-xs text-[#F3F4F6] font-mono select-none font-semibold">JM</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#0B0F14]"></span>
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-[11px] font-semibold text-[#F3F4F6] font-sans truncate">
                jitenmoni8@gmail.com
              </span>
              <span className="text-[10px] font-mono text-[#94A3B8]/80 truncate leading-none mt-0.5">
                Principal Architect
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

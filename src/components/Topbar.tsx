import React, { useState, useEffect } from "react";
import { 
  Search, 
  Clock, 
  Terminal, 
  Bell, 
  Cpu, 
  Check, 
  Activity,
  Command,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GlobalPlaneState, PageId } from "../types";

interface TopbarProps {
  systemData: GlobalPlaneState;
  onSearchCmdClick: () => void;
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
}

export default function Topbar({ systemData, onSearchCmdClick, currentPage, setCurrentPage }: TopbarProps) {
  const [utcTime, setUtcTime] = useState("");

  // Keep a precise digital chronometer syncing UTC time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: 2026-05-25 08:32:48 UTC (matching system time format requested)
      const yr = now.getUTCFullYear();
      const mo = String(now.getUTCMonth() + 1).padStart(2, "0");
      const dy = String(now.getUTCDate()).padStart(2, "0");
      const hr = String(now.getUTCHours()).padStart(2, "0");
      const mi = String(now.getUTCMinutes()).padStart(2, "0");
      const sc = String(now.getUTCSeconds()).padStart(2, "0");
      setUtcTime(`${yr}-${mo}-${dy} ${hr}:${mi}:${sc} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const hasCritError = systemData.nodes.some(n => n.status === "critical") || systemData.services.some(s => s.status === "failing");
  const hasWarning = systemData.nodes.some(n => n.status === "warning") || systemData.services.some(s => s.status === "warning");

  return (
    <header 
      id="command-topbar"
      className="bg-[#0B0F14]/90 backdrop-blur-md border-b border-[#2A3441]/60 h-14 px-6 flex items-center justify-between shrink-0 z-40 select-none"
    >
      {/* Search / Command Gateway */}
      <div className="flex items-center gap-x-4 w-96">
        <button
          onClick={onSearchCmdClick}
          className="w-full flex items-center justify-between bg-[#111827] hover:bg-[#161B22] border border-[#2A3441]/70 px-3 py-1.5 rounded-md text-xs text-[#94A3B8]/80 cursor-pointer text-left transition-all group focus:outline-none focus:border-[#3B82F6]/60"
        >
          <div className="flex items-center gap-x-2.5">
            <Search className="w-3.5 h-3.5 text-[#94A3B8]/60 group-hover:text-[#F3F4F6]" />
            <span className="font-sans font-medium text-[11px] leading-none">Find SRE clusters, diagnostics...</span>
          </div>
          <div className="flex items-center gap-x-0.5 bg-[#1F2937]/80 group-hover:bg-[#1F2937] px-1.5 py-0.5 rounded border border-[#2A3441]/60 text-[9px] font-mono leading-none tracking-normal text-[#F3F4F6]/80 select-none">
            <Command className="w-2.5 h-2.5 inline mr-0.5 text-[#94A3B8]/60" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Global Indicator Light Header */}
      <div className="flex items-center gap-x-8">
        <div className="flex items-center gap-x-3.5 bg-[#111827]/40 px-3.5 py-1.5 rounded-lg border border-[#2A3441]/30">
          {/* Status Dot */}
          <div className="relative">
            <span className={`w-2 h-2 rounded-full block ${hasCritError ? "bg-[#EF4444]" : hasWarning ? "bg-[#F59E0B]" : "bg-[#10B981]"}`}></span>
            <span className={`absolute -inset-0.5 rounded-full block animate-ping ${hasCritError ? "bg-[#EF4444]/40" : hasWarning ? "bg-[#F59E0B]/40" : "bg-[#10B981]/40"}`}></span>
          </div>

          <div className="flex flex-col text-left">
            <span className="text-[10px] font-mono text-[#94A3B8]/60 uppercase tracking-widest leading-none">Global Status</span>
            <span className="text-[11px] font-sans font-medium text-[#F3F4F6] mt-0.5">
              {hasCritError ? "SLA Threat Warning" : hasWarning ? "Vulnerabilities Monitored" : "All Clusters Operational"}
            </span>
          </div>
        </div>

        {/* Chronometer & Quick Links */}
        <div className="flex items-center gap-x-4">
          {/* Precise Time Display */}
          <div className="flex items-center gap-x-2 text-[10px] font-mono text-[#94A3B8] bg-[#111827] px-3 py-1.5 rounded border border-[#2A3441]/40 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="tabular-nums font-semibold tracking-wide text-[#F3F4F6]">{utcTime || "2026-05-25 08:32:48 UTC"}</span>
          </div>

          {/* Quick AI Assist Bubble */}
          <button
            onClick={() => setCurrentPage("ai-workspace")}
            className={`cursor-pointer w-8.5 h-8.5 rounded-lg border transition-all flex items-center justify-center relative shadow-sm ${
              currentPage === "ai-workspace"
                ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]"
                : "bg-[#111827] hover:bg-[#161B22] border-[#2A3441]/80 text-[#94A3B8] hover:text-[#F3F4F6]"
            }`}
            title="Launch Intelligent Diagnostics Co-pilot"
          >
            <Activity className="w-4.5 h-4.5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#3B82F6] rounded-full border border-[#0B0F14] animate-pulse"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

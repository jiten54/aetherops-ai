/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  PageId, 
  GlobalPlaneState, 
  NodeTelemetry, 
  ServiceTelemetry, 
  IngressLog, 
  DeploymentEvent, 
  IncidentAlert, 
  ChatMessage 
} from "./types";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import DashboardView from "./components/DashboardView";
import MonitoringView from "./components/MonitoringView";
import AnalyticsView from "./components/AnalyticsView";
import TimelineView from "./components/TimelineView";
import IncidentsView from "./components/IncidentsView";
import AIWorkspace from "./components/AIWorkspace";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Command, 
  Server, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Database, 
  Terminal, 
  Check, 
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCcw,
  Sliders
} from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("overview");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Chat memory queue
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: "1", role: "assistant", content: `### Aether Systems Intelligence Online

I am connected to the current host backplane. All physical compute clusters and PostgreSQL nodes are synchronized with active telemetry registers. 

*How can I assist you with your SRE operations today?* You can ask me to **diagnose the high load nodes**, **propose index patches for the slow queries ledger**, or **scale our ingress cluster instances**.`, timestamp: "08:32" }
  ]);

  // Master telemetry status state loaded from backend API
  const [systemData, setSystemData] = useState<GlobalPlaneState>({
    nodes: [],
    services: [],
    logs: [],
    deployments: [],
    incidents: [],
    systemStats: {
      globalCpu: 45,
      globalMemory: 66,
      activePods: 18,
      networkThroughputGbps: "1.74",
      uptimeSla: 99.987,
      healthScore: 98.4
    }
  });

  // Fetch telemetry status from the backend custom Express server
  const fetchStatusFromBackend = async (showSpinner = false) => {
    if (showSpinner) setIsSyncing(true);
    try {
      const res = await fetch("/api/infra/status");
      if (!res.ok) throw new Error("Backend system failed to report healthy SLA status");
      const data = await res.json();
      setSystemData(data);
    } catch (err) {
      console.error("Failure fetching live infrastructure status from server:", err);
    } finally {
      if (showSpinner) {
        setTimeout(() => setIsSyncing(false), 500);
      }
    }
  };

  // Setup periodic polling interval to keep metrics ticking dynamically
  useEffect(() => {
    fetchStatusFromBackend(true);
    const interval = setInterval(() => {
      fetchStatusFromBackend(false);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Global hotkey binding for Raycast-style command center (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handler for posting prompts to server-side Gemini Proxy endpoint
  const handleSendAiMessage = async (text: string) => {
    // Append user message immediately
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    
    const updatedHistory = [...chatHistory, userMsg];
    setChatHistory(updatedHistory);
    setIsAiGenerating(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory.map(m => ({ role: m.role, content: m.content })),
          systemCtx: systemData // grounds Gemini model with extreme precision on real-time state!
        })
      });

      if (!res.ok) throw new Error("Diagnostics API failed to generate response payload");
      const data = await res.json();
      
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: data.text || "Diagnostic payload resolved containing null data streams.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI Assistant connection failure:", err);
      const errMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        content: `### SRE Operations Core Timeout Error
The diagnostic neural link timed out while polling. The backend connection proxy failed to hand-shake.
- **Cause**: Telemetry gateway latency exceeded baseline SLA constraints (5000ms).
- **Resolution**: Check security policy definitions or confirm your \`GEMINI_API_KEY\` is configured inside the Secrets panel.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleClearChatHistory = () => {
    setChatHistory([]);
  };

  // Operational trigger handlers matching premium visual components
  const handleScalePod = (serviceId: string, amount: number) => {
    setSystemData((prev) => {
      const updatedServices = prev.services.map((s) => {
        if (s.id === serviceId) {
          const nextCount = Math.max(1, Math.min(8, s.podsCount + amount));
          return { ...s, podsCount: nextCount };
        }
        return s;
      });
      return { ...prev, services: updatedServices };
    });
  };

  const handleResetService = (serviceId: string) => {
    // Cycles container pods
    const serviceName = systemData.services.find(s => s.id === serviceId)?.name || "Target Service";
    // Trigger log append
    const logId = String(Date.now());
    const newLog: IngressLog = {
      id: logId,
      timestamp: new Date().toISOString(),
      level: "success",
      source: "orchestrator",
      message: `Full microservice rolling recycle complete for cluster [${serviceName}]. Refreshed container image indices.`
    };
    setSystemData(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs]
    }));
  };

  // Resolve warning loads
  const handleMitigateIncident = (incidentId: string) => {
    setSystemData((prev) => {
      const updatedIncidents = prev.incidents.map((i) => {
        if (i.id === incidentId) {
          return { ...i, status: i.status === "active" ? ("mitigated" as const) : ("resolved" as const) };
        }
        return i;
      });
      return { ...prev, incidents: updatedIncidents };
    });
  };

  // Quick action menu overrides
  const handleQuickAction = (actionType: string, payload?: any) => {
    if (actionType === "increase_pods") {
      handleScalePod("s-1", 1);
    } else if (actionType === "cycle_cache") {
      handleResetService("s-5");
    } else if (actionType === "resolve_node_warning") {
      setSystemData((prev) => {
        const updatedNodes = prev.nodes.map((n) => {
          if (n.id === payload) {
            return { ...n, cpu: 52, status: "healthy" as const };
          }
          return n;
        });
        return { ...prev, nodes: updatedNodes };
      });
    } else if (actionType === "stabilize_nodes") {
      setSystemData((prev) => {
        const balancedNodes = prev.nodes.map(n => ({ ...n, cpu: Math.floor(45 + Math.random() * 10), status: "healthy" as const }));
        return {
          ...prev,
          nodes: balancedNodes,
          systemStats: { ...prev.systemStats, healthScore: 100 }
        };
      });
    }
  };

  // Timeline canary deployment pusher
  const handleTriggerCanary = (newDeploy: DeploymentEvent) => {
    setSystemData((prev) => ({
      ...prev,
      deployments: [newDeploy, ...prev.deployments]
    }));
  };

  // Filtering for Raycast Spotlight list of activities
  const searchItems = [
    { label: "Navigate to SRE Dashboard Console", category: "Navigation", action: () => { setCurrentPage("overview"); setIsSearchOpen(false); } },
    { label: "Inspect Service Clusters and Network pods", category: "Navigation", action: () => { setCurrentPage("services"); setIsSearchOpen(false); } },
    { label: "Query High-Frequency Analytics Grafana Graphs", category: "Navigation", action: () => { setCurrentPage("analytics"); setIsSearchOpen(false); } },
    { label: "Review Release Registry Audit History", category: "Navigation", action: () => { setCurrentPage("timeline"); setIsSearchOpen(false); } },
    { label: "Interact with Neural AI Diagnostics agent", category: "Navigation", action: () => { setCurrentPage("ai-workspace"); setIsSearchOpen(false); } },
    { label: "Inspect Active Warning Incidents Matrix", category: "Navigation", action: () => { setCurrentPage("incidents"); setIsSearchOpen(false); } },
    { label: "Action: Stabilize Global Node CPU loads", category: "SRE Actions", action: () => { handleQuickAction("stabilize_nodes"); setIsSearchOpen(false); } },
    { label: "Action: Flush Redis Cache Clusters", category: "SRE Actions", action: () => { handleQuickAction("cycle_cache"); setIsSearchOpen(false); } },
    { label: "Action: Run Canary Deployment pipeline", category: "SRE Actions", action: () => { setCurrentPage("timeline"); setIsSearchOpen(false); } },
  ];

  const filteredSearchItems = searchItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="applet-container" className="h-screen w-screen bg-[#0B0F14] text-[#F3F4F6] overflow-hidden flex flex-row font-sans">
      
      {/* Fixed sidebar */}
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        activeIncidentsCount={systemData.incidents.filter(i => i.status === "active").length}
        healthScore={systemData.systemStats.healthScore}
        uptimeSla={systemData.systemStats.uptimeSla}
      />

      {/* Main Container */}
      <div id="content-pane" className="flex-1 min-w-0 max-w-full flex flex-col h-full bg-[#0B0F14]">
        {/* Command center Topbar */}
        <Topbar 
          systemData={systemData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onSearchCmdClick={() => setIsSearchOpen(true)}
        />

        {/* Dynamic page routes utilizing Framer Motion transitions */}
        <main className="flex-1 min-h-0 relative flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex-1 flex flex-col min-h-0"
            >
              {currentPage === "overview" && (
                <DashboardView 
                  systemData={systemData}
                  onQuickAction={handleQuickAction}
                  setCurrentPage={setCurrentPage}
                  refreshStats={() => fetchStatusFromBackend(true)}
                  isSyncing={isSyncing}
                />
              )}

              {currentPage === "services" && (
                <MonitoringView 
                  systemData={systemData}
                  onScalePod={handleScalePod}
                  onResetService={handleResetService}
                  setCurrentPage={setCurrentPage}
                />
              )}

              {currentPage === "analytics" && (
                <AnalyticsView />
              )}

              {currentPage === "timeline" && (
                <TimelineView 
                  deployments={systemData.deployments}
                  onTriggerDeploy={handleTriggerCanary}
                />
              )}

              {currentPage === "incidents" && (
                <IncidentsView 
                  incidents={systemData.incidents}
                  onMitigateIncident={handleMitigateIncident}
                  setCurrentPage={setCurrentPage}
                />
              )}

              {currentPage === "ai-workspace" && (
                <AIWorkspace 
                  systemData={systemData}
                  chatHistory={chatHistory}
                  onSendMessage={handleSendAiMessage}
                  onClearChat={handleClearChatHistory}
                  isGenerating={isAiGenerating}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Raycast Spotlight search command palette Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div id="raycast-spotlight" className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-xs select-none">
            {/* Click backdrop to exit */}
            <div className="absolute inset-x-0 inset-y-0" onClick={() => setIsSearchOpen(false)} />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.97, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -5 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="relative w-full max-w-xl bg-[#161B22] border border-[#2A3441] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[380px]"
            >
              {/* Search input bar */}
              <div className="h-12 px-4 flex items-center border-b border-[#2A3441]/75 gap-x-3 bg-[#111827]/40">
                <Search className="w-4 h-4 text-[#94A3B8]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a command or navigate cluster paths..."
                  className="bg-transparent text-xs text-[#F3F4F6] w-full focus:outline-none placeholder:text-[#94A3B8]/60 text-left"
                  autoFocus
                />
                <span className="text-[10px] bg-[#1F2937] border border-[#2A3441] px-1.5 py-0.5 rounded font-mono text-[#94A3B8]">ESC</span>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1 bg-[#161B22] custom-scrollbar">
                {filteredSearchItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-[#94A3B8]/40 font-mono">
                    NO COMMANDS MATCH "{searchQuery.toUpperCase()}"
                  </div>
                ) : (
                  filteredSearchItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={item.action}
                      className="w-full text-left text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between hover:bg-[#111827] hover:text-white transition-all group cursor-pointer focus:outline-none"
                    >
                      <div className="flex items-center gap-x-2.5 max-w-md truncate">
                        <Terminal className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#3B82F6] shrink-0" />
                        <span className="text-zinc-200 group-hover:text-white font-medium truncate">{item.label}</span>
                      </div>
                      <span className="text-[9px] font-mono text-[#94A3B8]/50 uppercase tracking-wide group-hover:text-[#3B82F6]">
                        {item.category}
                      </span>
                    </button>
                  ))
                )}
              </div>

              {/* Spotlight footer */}
              <div className="h-9 px-4 border-t border-[#2A3441]/55 flex items-center justify-between text-[9px] font-mono text-[#94A3B8]/60 select-none bg-[#111827]/30">
                <span>Select command to trigger</span>
                <span className="flex items-center gap-x-1.5 uppercase font-mono">
                  <span>Enter <kbd className="font-sans font-bold">↵</kbd> to execute</span>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

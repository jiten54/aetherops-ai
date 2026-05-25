import React from "react";
import { 
  ShieldAlert, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  Sparkles, 
  HelpCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { IncidentAlert, PageId } from "../types";

interface IncidentsViewProps {
  incidents: IncidentAlert[];
  onMitigateIncident: (id: string) => void;
  setCurrentPage: (page: PageId) => void;
}

export default function IncidentsView({ incidents, onMitigateIncident, setCurrentPage }: IncidentsViewProps) {
  
  const getSevClass = (sev: string) => {
    switch (sev) {
      case "critical": return "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/20 animate-pulse";
      case "high": return "bg-[#EF4444]/10 text-red-400 border-red-500/20";
      case "medium": return "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/20";
      default: return "bg-blue-500/10 text-blue-400 border-blue-500/10";
    }
  };

  return (
    <div id="incidents-view" className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
      
      {/* Overview Banner */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-4 bg-[#111827]/40 p-4 border border-[#2A3441]/40 rounded-xl">
        <div>
          <h1 className="text-xl font-bold font-sans tracking-tight text-[#F3F4F6] flex items-center gap-x-2">
            <ShieldAlert className="w-5 h-5 text-[#EF4444]" />
            Incident Response Matrix
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Tracking severe anomalies, out-of-SLA alerts, and automated orchestration notifications.
          </p>
        </div>

        <div>
          <button 
            onClick={() => setCurrentPage("ai-workspace")}
            className="w-full sm:w-auto font-sans font-semibold text-xs px-4 py-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/35 rounded-md flex items-center justify-center gap-x-1.5 cursor-pointer focus:outline-none"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Consult Diagnostic AI</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Incidents Table: Left 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold tracking-tight text-[#F3F4F6] mb-4">
              Telemetry Alert Registry
            </h2>

            <div className="divide-y divide-[#2A3441]/55 space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="pt-3.5 first:pt-0 flex flex-col sm:flex-row justify-between sm:items-center gap-y-3">
                  <div className="flex items-start gap-x-3.5">
                    <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#2A3441] flex items-center justify-center shrink-0 mt-0.5">
                      <AlertOctagon className={`w-4.5 h-4.5 ${incident.status === "active" ? "text-[#EF4444]" : "text-zinc-500"}`} />
                    </div>

                    <div className="flex flex-col text-left">
                      <h3 className={`text-xs font-semibold ${incident.status === "resolved" ? "text-zinc-500 line-through" : "text-[#F3F4F6]"}`}>
                        {incident.title}
                      </h3>
                      <div className="flex items-center gap-x-3 text-[10.5px] font-mono text-[#94A3B8] mt-1.5 flex-wrap gap-y-1">
                        <span className={`px-1.5 py-0.2 border rounded font-mono text-[9px] uppercase leading-none font-bold ${getSevClass(incident.severity)}`}>
                          {incident.severity}
                        </span>
                        <span>{incident.timestamp}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="flex items-center gap-x-1">
                          <User className="w-3.5 h-3.5 text-zinc-500" />
                          Assignee: {incident.assignee}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none border font-semibold ${
                      incident.status === "active"
                        ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20 animate-pulse"
                        : incident.status === "mitigated"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20"
                    }`}>
                      {incident.status === "resolved" ? "RESOLVED" : incident.status.toUpperCase()}
                    </span>

                    {incident.status !== "resolved" && (
                      <button
                        onClick={() => onMitigateIncident(incident.id)}
                        className="px-2.5 py-1 text-[10px] bg-[#111827] hover:bg-[#1C2433] border border-[#2A3441] text-[#F3F4F6] hover:text-white rounded font-mono font-medium transition-all cursor-pointer"
                      >
                        {incident.status === "active" ? "ACKNOWLEDGE" : "RESOLVE"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit guidelines & documentation info on the right */}
        <div className="space-y-6">
          <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-[#F3F4F6] border-b border-[#2A3441]/50 pb-2.5">
              SRE On-Call SLA Runbooks
            </h3>
            
            <div className="space-y-4.5 mt-4">
              <div className="space-y-1">
                <h4 className="text-[11.5px] font-bold text-slate-300">HTTP 502 / Gateways Outages</h4>
                <p className="text-[10.5px] text-[#94A3B8]">
                  If route limits trip in ap-east, downscale ingress routing cache nodes or prompt scaling to containers via the Services Panel.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="text-[11.5px] font-bold text-slate-300">Database Replica Lag Bounds</h4>
                <p className="text-[10.5px] text-[#94A3B8]">
                  PostgreSQL replication streams should not lag master SSD segments by &gt;10MB. Execute SRE checkpoint sweep triggers if limits are breached.
                </p>
              </div>
            </div>
          </div>

          {/* Quick FAQ / Contacts card */}
          <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-4 shadow-sm text-left">
            <span className="text-[9.5px] font-mono text-[#94A3B8]">ESCALATION TARGETS</span>
            <div className="flex justify-between items-center mt-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#F3F4F6]">Sarah Jenkins</span>
                <span className="text-[10px] font-mono text-[#94A3B8]">Lead SRE Engineer</span>
              </div>
              <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 px-1.5 py-0.5 rounded font-mono">PRIMARY</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

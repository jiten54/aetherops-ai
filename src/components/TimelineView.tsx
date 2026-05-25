import React, { useState } from "react";
import { 
  GitBranch, 
  User, 
  Clock, 
  GitCommit, 
  Play, 
  CheckCircle, 
  Sparkles, 
  RefreshCw,
  Server,
  Terminal,
  Layers,
  Check,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DeploymentEvent } from "../types";

interface TimelineViewProps {
  deployments: DeploymentEvent[];
  onTriggerDeploy: (newDeploy: DeploymentEvent) => void;
}

export default function TimelineView({ deployments, onTriggerDeploy }: TimelineViewProps) {
  const [deployState, setDeployState] = useState<"idle" | "building" | "testing" | "canary" | "completed">("idle");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [pipelineLog, setPipelineLog] = useState("");

  const handleStartDeployment = () => {
    if (deployState !== "idle") return;

    setDeployState("building");
    setPipelineProgress(15);
    setPipelineLog("Initializing container registry connection. Checking cluster quotas...");

    // Simulate CI/CD rolling build
    setTimeout(() => {
      setDeployState("testing");
      setPipelineProgress(45);
      setPipelineLog("Building production bundle. Compiling server.ts down to CommonJS. Running Mocha validation tests...");
    }, 1500);

    setTimeout(() => {
      setDeployState("canary");
      setPipelineProgress(75);
      setPipelineLog("CI tests passed [344/344]. Spinning up canary pod pool in cluster US-East. Routing 10% query paths...");
    }, 3000);

    setTimeout(() => {
      setDeployState("completed");
      setPipelineProgress(100);
      setPipelineLog("Canary checks valid. Gradual rollback buffer cleared. 100% traffic shifted. Release completed successfully!");
      
      const newRelease: DeploymentEvent = {
        id: `dep-${Math.floor(1050 + Math.random() * 50)}`,
        version: `v2.14.9-release`,
        author: "jitenmoni8@gmail.com (You)",
        status: "completed",
        timestamp: "Just now",
        description: "Optimized DB connection swap parameters & scaled auth pre-allocation thresholds",
        deployTime: "4m 55s"
      };
      onTriggerDeploy(newRelease);
    }, 5000);

    setTimeout(() => {
      setDeployState("idle");
      setPipelineProgress(0);
      setPipelineLog("");
    }, 8000);
  };

  return (
    <div id="timeline-view" className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
      
      {/* Timeline Header banner with Trigger Deployment */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-y-4 bg-[#111827]/40 p-4 border border-[#2A3441]/40 rounded-xl">
        <div>
          <h1 className="text-xl font-bold font-sans tracking-tight text-[#F3F4F6] flex items-center gap-x-2">
            <Layers className="w-5 h-5 text-[#3B82F6]" />
            Release Registry & Deployment pipeline
          </h1>
          <p className="text-xs text-[#94A3B8] mt-1">
            Audit history of core infrastructure rollouts, semantic updates, and Git deployment nodes.
          </p>
        </div>

        <div>
          <button
            onClick={handleStartDeployment}
            disabled={deployState !== "idle"}
            className={`w-full sm:w-auto font-sans font-medium text-xs px-4 py-2 rounded-md flex items-center justify-center gap-x-2 cursor-pointer transition-all focus:outline-none shadow-sm ${
              deployState !== "idle"
                ? "bg-[#111827] border border-[#2A3441] text-[#94A3B8] cursor-not-allowed"
                : "bg-[#3B82F6] hover:bg-blue-600 text-[#F3F4F6]"
            }`}
          >
            {deployState === "idle" ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Initiate Canary Release (v2.14.9)</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3B82F6]" />
                <span className="capitalize">Canary: {deployState}...</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Deploy Simulation Activity Progress */}
      <AnimatePresence>
        {deployState !== "idle" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[#161B22]/95 border border-[#10B981]/30 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                  <span className="font-mono text-[#10B981] font-semibold uppercase tracking-wider">ROLLING PIPELINE IN PROGRESS</span>
                </div>
                <span className="font-mono text-[#94A3B8]">{pipelineProgress}% COMPLETE</span>
              </div>

              {/* Progress Slider */}
              <div className="w-full bg-[#1F2937] h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-[#10B981] h-full transition-all duration-300 rounded-full"
                  style={{ width: `${pipelineProgress}%` }}
                />
              </div>

              {/* Real-time Simulated Terminal log stream */}
              <div className="bg-[#0B0F14] rounded-lg p-3 border border-[#2A3441]/40 flex items-center gap-x-3.5 text-left font-mono text-[10.5px]">
                <Terminal className="w-4 h-4 text-[#10B981] shrink-0" />
                <p className="text-[#F3F4F6] truncate flex-1 font-mono">{pipelineLog}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chronological Release History */}
      <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#2A3441]/60">
        
        {deployments.map((deploy, index) => {
          const isLatest = index === 0;

          return (
            <div key={deploy.id} className="relative text-left">
              
              {/* Chronological Node Point */}
              <div className={`absolute -left-[35px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border ${
                isLatest 
                  ? "bg-[#3B82F6]/10 border-[#3B82F6] text-[#3B82F6]" 
                  : "bg-[#111827] border-[#2A3441] text-[#94A3B8]"
              }`}>
                {isLatest ? (
                  <Sparkles className="w-3.5 h-3.5" />
                ) : (
                  <GitCommit className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Deployment Details Card */}
              <div className={`p-5 rounded-xl border bg-[#161B22]/95 hover:bg-[#161B22]/100 transition-all ${
                isLatest ? "border-[#3B82F6]/50 shadow-md shadow-blue-500/5" : "border-[#2A3441]/70"
              }`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-y-3 border-b border-[#2A3441]/50 pb-3 mb-3">
                  <div className="flex items-center gap-x-3 flex-wrap gap-y-2">
                    <span className="text-sm font-bold text-[#F3F4F6] font-mono tracking-tight">{deploy.version}</span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20 rounded font-semibold">
                      {deploy.status}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-[#111827] text-[#94A3B8] border border-[#2A3441]/60 rounded">
                      {deploy.id}
                    </span>
                  </div>

                  <div className="flex items-center gap-x-4 text-[10.5px] font-mono text-[#94A3B8]">
                    <span className="flex items-center gap-x-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Duration: {deploy.deployTime}
                    </span>
                    <span className="text-[#2A3441] inline-block">|</span>
                    <span>{deploy.timestamp}</span>
                  </div>
                </div>

                <p className="text-xs text-[#94A3B8] mb-4 pl-1">
                  {deploy.description}
                </p>

                {/* Container detail tags (Linear look) */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-[#111827]/40 px-3 py-2 rounded-lg border border-[#2A3441]/35">
                  <div className="flex items-center gap-x-1.5 text-[10px] font-mono text-zinc-400">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Author: {deploy.author}</span>
                  </div>

                  <span className="text-[#2A3441] hidden sm:inline">|</span>

                  <div className="flex items-center gap-x-1.5 text-[10px] font-mono text-zinc-400">
                    <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Branch: <span className="text-[#3B82F6]">main</span></span>
                  </div>

                  <span className="text-[#2A3441] hidden sm:inline">|</span>

                  <div className="flex items-center gap-x-1.5 text-[10px] font-mono text-zinc-400">
                    <Server className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Pipeline Status: <span className="text-[#10B981]">Checks Passed [344/344]</span></span>
                  </div>
                </div>

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

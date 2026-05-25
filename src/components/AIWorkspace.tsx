import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, 
  Send, 
  Terminal, 
  Cpu, 
  Settings, 
  CheckCircle, 
  AlertTriangle, 
  Share2,
  Trash2,
  Paperclip,
  ArrowRight,
  Database,
  Network
} from "lucide-react";
import { ChatMessage, GlobalPlaneState } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AIWorkspaceProps {
  systemData: GlobalPlaneState;
  chatHistory: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  isGenerating: boolean;
}

export default function AIWorkspace({
  systemData,
  chatHistory,
  onSendMessage,
  onClearChat,
  isGenerating
}: AIWorkspaceProps) {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested diagnostic tasks SREs typically execute
  const suggestions = [
    { title: "Diagnose AP-East Load", prompt: "Identify why compute node ap-east-edge-router-04 is flagging high CPU load warnings." },
    { title: "Review DB Slow Queries", prompt: "Inspect PostgreSQL Slow Query registry and propose indexed queries optimization strategy." },
    { title: "Scale Auth Clusters", prompt: "Draft an orchestration manifest to scale User Auth containers from 3 to 5 pods safely." },
  ];

  // Auto scroll down during chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;

    onSendMessage(inputText);
    setInputText("");
  };

  const handleSuggestionClick = (promptText: string) => {
    if (isGenerating) return;
    onSendMessage(promptText);
  };

  const hasWarning = systemData.nodes.some(n => n.status === "warning");

  return (
    <div id="ai-workspace-view" className="flex-1 h-screen flex flex-col md:flex-row gap-x-6 gap-y-6 p-6 overflow-hidden">
      
      {/* Left Column: Interactive Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl relative overflow-hidden text-left">
        
        {/* Chat Title bar */}
        <div className="h-14 px-5 border-b border-[#2A3441]/60 flex items-center justify-between shrink-0 select-none bg-[#111827]/40">
          <div className="flex items-center gap-x-2.5">
            <div className="w-5 h-5 rounded-full bg-blue-500/15 flex items-center justify-center animate-pulse">
              <Sparkles className="w-3 text-[#3B82F6]" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#F3F4F6] font-sans">
                Aether Neural Diagnostics Terminal
              </h2>
              <span className="text-[9.5px] font-mono text-[#10B981] flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-1.5 animate-pulse" />
                INTELLIGENCE ENGINE ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-x-3.5">
            <button
              onClick={onClearChat}
              className="p-1 px-2.5 text-[10px] font-mono text-[#94A3B8]/80 hover:text-[#EF4444] bg-[#111827] border border-[#2A3441]/65 hover:border-[#EF4444]/20 rounded transition-all cursor-pointer"
            >
              CLEAR_HISTORY
            </button>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-5 custom-scrollbar select-text">
          {chatHistory.length === 0 ? (
            /* Blank Slate View */
            <div className="h-full flex flex-col justify-center items-center text-center max-w-lg mx-auto py-12">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-[#10B981] flex items-center justify-center shadow-lg shadow-blue-500/10 mb-5 relative">
                <Sparkles className="w-6 text-white" />
                <span className="absolute -inset-0.5 rounded-xl border border-blue-500 animate-pulse duration-1000 opacity-60"></span>
              </div>

              <h2 className="text-base font-bold text-[#F3F4F6] font-sans tracking-tight">
                Aether Operations Copilot
              </h2>
              <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed font-sans">
                I am an SRE Artificial Copilot backed by deep neural diagnostic parsing. Mapped with active system telemetry contexts, I can troubleshoot server thermal throttling, query index lockups, scale clusters, or write K8s manifests.
              </p>

              {/* Suggestions panels */}
              <div className="grid grid-cols-1 gap-2.5 w-full mt-6 text-left">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(s.prompt)}
                    className="p-3 bg-[#111827]/60 hover:bg-[#111827] border border-[#2A3441]/65 hover:border-[#3B82F6]/55 rounded-lg flex items-center justify-between text-xs text-[#94A3B8] hover:text-[#F3F4F6] cursor-pointer transition-all group"
                  >
                    <div className="flex flex-col text-left mr-5">
                      <span className="text-[10px] font-mono text-[#3B82F6]">{s.title}</span>
                      <span className="text-[11px] font-sans mt-0.5 truncate max-w-sm sm:max-w-md">{s.prompt}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#2A3441] group-hover:text-[#3B82F6] shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Render active chats */
            <div className="space-y-5">
              {chatHistory.map((message) => {
                const isUser = message.role === "user";
                return (
                  <div 
                    key={message.id}
                    className={`flex items-start gap-x-4 pl-1 ${isUser ? "flex-reverse text-right justify-end" : "justify-start"}`}
                  >
                    {/* Icon */}
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg bg-[#0B0F14] border border-[#2A3441] flex items-center justify-center shrink-0">
                        <Sparkles className="w-3.5 text-[#3B82F6]" />
                      </div>
                    )}

                    {/* Chat Bubble card */}
                    <div className={`p-4 rounded-xl text-xs max-w-2xl text-left border overflow-hidden ${
                      isUser 
                        ? "bg-[#111827]/85 border-[#2A3441]/60 text-[#F3F4F6]" 
                        : "bg-[#161B22]/100 border-[#2A3441]/70 text-[#F3F4F6] shadow-sm"
                    }`}>
                      {/* Markdown parsing (react-markdown compliant as requested) */}
                      <div className="markdown-body font-sans leading-relaxed text-[#F3F4F6]/95 space-y-1 select-text">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>

                      <div className="text-[9px] font-mono text-[#94A3B8]/60 mt-2.5 text-right select-none uppercase">
                        {message.role} • {message.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-[#3B82F6]/10 border border-[#3B82F6]/30 flex items-center justify-center shrink-0">
                        <span className="text-[9.5px] font-mono text-[#3B82F6] font-semibold">ME</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Generating response typing state loader */}
              {isGenerating && (
                <div className="flex items-start gap-x-4 pl-1">
                  <div className="w-7 h-7 rounded-lg bg-[#0B0F14] border border-[#2A3441]/75 flex items-center justify-center animate-spin">
                    <Trash2 className="w-3.5 text-[#3B82F6] animate-pulse" />
                  </div>
                  
                  <div className="p-4 rounded-xl border border-[#2A3441]/60 bg-[#161B22]/100 space-y-2 w-96 text-left shrink-0 shadow-sm">
                    <div className="flex items-center gap-x-1.5">
                      <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      <span className="text-[9px] font-mono text-[#94A3B8] ml-2 uppercase">Core AI reading telemetry...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Text Form Area */}
        <form 
          onSubmit={handleSubmit}
          className="p-4 border-t border-[#2A3441]/60 bg-[#111827]/40 flex gap-x-3 items-center shrink-0"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Aether to troubleshoot load, draft configs, scale service..."
              className="w-full bg-[#0B0F14] border border-[#2A3441]/85 text-[#F3F4F6] text-xs font-sans rounded-xl pl-4 pr-10 py-3 focus:outline-none focus:border-[#3B82F6]/75 transition-all text-left placeholder:text-[#94A3B8]/65"
              disabled={isGenerating}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isGenerating}
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer focus:outline-none ${
                inputText.trim() && !isGenerating
                  ? "bg-[#3B82F6] text-white hover:bg-blue-600"
                  : "bg-transparent text-slate-600 cursor-not-allowed"
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Right Column: Telemetry Snapshot Panel (Gives a hyper-customized developer feel) */}
      <div className="w-full md:w-80 shrink-0 flex flex-col h-full space-y-5 text-left">
        
        {/* Telemetry System grounding status */}
        <div className="bg-[#161B22]/95 border border-[#2A3441]/80 rounded-xl p-5 shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
          <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1">
            <div className="border-b border-[#2A3441]/60 pb-3">
              <h3 className="text-xs font-bold text-[#F3F4F6] font-sans">
                Neural Telemetry Grounds
              </h3>
              <p className="text-[10px] text-[#94A3B8] mt-0.5 leading-relaxed font-sans">
                This JSON payload is fed directly into our Gemini neural framework to ground diagnostic logic in real operations vectors.
              </p>
            </div>

            {/* Simulated Live telemetry nodes */}
            <div className="space-y-3 pt-1">
              <span className="text-[9.5px] font-mono text-[#94A3B8]/80 uppercase block">ACTIVE HOST CONGREGATION</span>
              
              <div className="space-y-2">
                {systemData.nodes.map(n => (
                  <div key={n.id} className="flex justify-between items-center bg-[#111827] px-2.5 py-1.75 rounded border border-[#2A3441]/40 text-[10px] font-mono leading-none">
                    <div className="flex items-center gap-x-1.5 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${n.status === "warning" ? "bg-orange-400" : "bg-[#10B981]"}`} />
                      <span className="text-[#F3F4F6] truncate max-w-[120px]">{n.name}</span>
                    </div>
                    <span className="text-[#94A3B8] shrink-0">CPU: <span className="font-bold text-[#F3F4F6]">{n.cpu}%</span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Active microservice clusters */}
            <div className="space-y-1 pt-3 border-t border-[#2A3441]/30">
              <span className="text-[9.5px] font-mono text-[#94A3B8]/80 uppercase block">CLUSTER REPLICAS BOUND</span>
              <div className="font-mono text-[9px] bg-[#0B0F14] p-2.5 rounded border border-[#2A3441]/45 text-[#3B82F6] space-y-1">
                <div className="flex justify-between">
                  <span>ingress-router</span>
                  <span className="text-white">4 Pods</span>
                </div>
                <div className="flex justify-between">
                  <span>api-gateway</span>
                  <span className="text-white">6 Pods</span>
                </div>
                <div className="flex justify-between">
                  <span>auth-service</span>
                  <span className="text-white">3 Pods</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>postgres-cluster</span>
                  <span className="text-[#10B981]">Master/Replica</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#111827] border border-[#2A3441]/60 p-3 rounded-lg text-center mt-4">
            <span className="text-[9px] font-mono text-[#94A3B8] uppercase block">Assigned Context model</span>
            <span className="text-[11px] font-sans font-bold text-white block mt-0.5">gemini-3.5-flash-latest</span>
          </div>
        </div>

      </div>

    </div>
  );
}

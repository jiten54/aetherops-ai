import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize express app
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK lazily and safely
const apiKey = process.env.GEMINI_API_KEY;
let ai: any = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("=== GoogleGenAI successfully initialized on backend ===");
  } catch (error) {
    console.error("=== GoogleGenAI initialization failed ===", error);
  }
} else {
  console.log("=== Running in AI Sandbox Mock Mode (Add GEMINI_API_KEY in Secrets to activate real Gemini diagnostics) ===");
}

// Global state for infrastructure simulation
interface SystemMetric {
  timestamp: string;
  cpu: number;
  memory: number;
  network: number;
  status: "healthy" | "warning" | "critical";
}

interface Pod {
  id: string;
  name: string;
  node: string;
  status: "running" | "pending" | "failed";
  cpu: number;
  memory: number;
  uptime: string;
}

interface Service {
  id: string;
  name: string;
  tier: "routing" | "application" | "database" | "cache";
  status: "active" | "warning" | "failing";
  podsCount: number;
  targetResponseMs: number;
  currentResponseMs: number;
  requestRateSecs: number;
  errorRate: number;
}

interface IngressLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  source: string;
  message: string;
}

interface Incidents {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "mitigated" | "resolved";
  timestamp: string;
  assignee: string;
}

// Generate static initial logs
let logsQueue: IngressLog[] = [
  { id: "1", timestamp: new Date(Date.now() - 480000).toISOString(), level: "info", source: "ingress", message: "BGP route selection complete for AS64496. Path costs re-calculated." },
  { id: "2", timestamp: new Date(Date.now() - 420000).toISOString(), level: "success", source: "auth-service", message: "Token sync initiated with OAuth 2.0 Identity Server." },
  { id: "3", timestamp: new Date(Date.now() - 360000).toISOString(), level: "warn", source: "redis-cache", message: "Eviction count spike: 1.4k keys evicted (Threshold: 1.0k)." },
  { id: "4", timestamp: new Date(Date.now() - 300000).toISOString(), level: "info", source: "scheduler", message: "Triggering hourly cache invalidation jobs (ID: invalidation_auth_44)." },
  { id: "5", timestamp: new Date(Date.now() - 240000).toISOString(), level: "error", source: "node-4", message: "CPU Core 7 thermal pacing alert - running speed throttled by 15%." },
  { id: "6", timestamp: new Date(Date.now() - 180000).toISOString(), level: "info", source: "postgres-db", message: "Vacuum process finished for transaction registry. Cleaned 432 obsolete rows." },
  { id: "7", timestamp: new Date(Date.now() - 120000).toISOString(), level: "success", source: "api-gateway", message: "Health check passed. Response SLA intact (22ms, P99)." },
  { id: "8", timestamp: new Date(Date.now() - 60000).toISOString(), level: "warn", source: "ap-east-ingress", message: "Transient TCP packet drop detected (1.2% loss) on router-4." }
];

const mockDeployments = [
  { id: "dep-1044", version: "v2.14.8-rc3", author: "Sarah Jenkins (SR. Dev)", status: "completed", timestamp: "Today, 08:15", description: "Prometheus exporter migration & updated telemetry bindings", deployTime: "4m 12s" },
  { id: "dep-1043", version: "v2.14.7", author: "Alex Rivera (Staff Engineer)", status: "completed", timestamp: "Yesterday, 14:32", description: "Scaled connection pool constraints in database gateway layer", deployTime: "3m 44s" },
  { id: "dep-1042", version: "v2.14.6", author: "Infra-Pipeline-Bot", status: "completed", timestamp: "2 days ago, 02:11", description: "Security vulnerability hotfix - openssl patch release", deployTime: "5m 01s" }
];

// Helper to append a simulated log dynamically
function generateNewSimulatedLog(): IngressLog {
  const sources = ["ingress", "redis-cache", "postgres-db", "auth-service", "api-gateway", "node-4", "node-2", "monitoring-agent"];
  const levels: ("info" | "warn" | "error" | "success")[] = ["info", "success", "info", "warn", "info", "error", "success"];
  const messages = {
    "ingress": [
      "Router route tables updated for peer-AS039",
      "SSL/TLS Handshake duration successfully decreased by 4ms (global)",
      "Vercel CDN Edge node AP-Northeast reports connection flush",
      "WAF Rule #3344 block action triggered: SQL Injection attack blocked from 165.22.4.11"
    ],
    "redis-cache": [
      "Eviction check complete. Core database sync healthy.",
      "Connection capacity at 34% total overhead. Scale point distant.",
      "Replication stream delay normalized (+0.21ms behind Master)"
    ],
    "postgres-db": [
      "Slow Query Logged: SELECT * FROM transactions WHERE limit = 1000 (102ms SLA target: 50ms)",
      "Database replica latency is under 5ms, cluster read-replica pool synced.",
      "Checkpoint process started, writing active pages to SSD node-2"
    ],
    "auth-service": [
      "IAM validation cluster scaling event completed: auth-scaler active.",
      "User token generation burst: 450 logins/sec, latency constant at 9ms",
      "Anomalous authentication rate on endpoint /api/v1/auth/token rejected (Rate-limited)"
    ],
    "api-gateway": [
      "Load balancer routing normalized across EU clusters",
      "Rate limit rule bucket reset for IP ranges: Tier-1 enterprise users",
      "Microservice cluster mapping complete: resolved 14 responsive routes"
    ],
    "node-4": [
      "Operating temperature stabilized at 68°C following performance re-tuning",
      "Storage drive SMART health check complete. SSD lifetime rating: 98.4%",
      "Memory leak scan executed - no active leaky descriptors identified on active memory spaces"
    ],
    "node-2": [
      "Database host memory allocation optimally adjusted (+2GB swap freed)",
      "Network packet transit speed verified. Pings stable on primary trunk"
    ],
    "monitoring-agent": [
      "Agent synchronized metrics payload successfully exported to core registry",
      "Datadog Prometheus remote-write target replied with status 200 OK",
      "Calculated anomaly score: 0.12 (Low, normal baseline operations)"
    ]
  };

  const src = sources[Math.floor(Math.random() * sources.length)];
  const lvs = messages[src as keyof typeof messages];
  const msgText = lvs[Math.floor(Math.random() * lvs.length)];
  const lvl = levels[Math.floor(Math.random() * levels.length)];

  return {
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    level: lvl,
    source: src,
    message: msgText
  };
}

// API endpoint for whole status
app.get("/api/infra/status", (req, res) => {
  // Push a new log occasionally to keep the terminal feed ticking
  if (Math.random() > 0.4) {
    logsQueue.unshift(generateNewSimulatedLog());
    if (logsQueue.length > 50) {
      logsQueue.pop();
    }
  }

  // Create real-time dynamic jitter on metrics
  const nodes = [
    { id: "node-1", name: "us-east-ingress-01", cpu: Math.floor(35 + Math.random() * 15), mem: 62, network: Math.floor(450 + Math.random() * 120), status: "healthy", zone: "us-east-1" },
    { id: "node-2", name: "us-central-postgres-primary", cpu: Math.floor(65 + Math.random() * 16), mem: 84, network: Math.floor(210 + Math.random() * 30), status: "healthy", zone: "us-central-2" },
    { id: "node-3", name: "eu-west-auth-service-01", cpu: Math.floor(22 + Math.random() * 10), mem: 46, network: Math.floor(180 + Math.random() * 40), status: "healthy", zone: "eu-west-1" },
    { id: "node-4", name: "ap-east-edge-router-04", cpu: Math.floor(82 + Math.random() * 14), mem: 72, network: Math.floor(890 + Math.random() * 110), status: Math.random() > 0.85 ? "warning" : "healthy", zone: "ap-northeast-1" }
  ];

  const services: Service[] = [
    { id: "s-1", name: "Ingress Router", tier: "routing", status: "active", podsCount: 4, targetResponseMs: 15, currentResponseMs: Math.floor(12 + Math.random() * 5), requestRateSecs: Math.floor(4500 + Math.random() * 600), errorRate: 0.02 },
    { id: "s-2", name: "Core API Gateway", tier: "application", status: "active", podsCount: 6, targetResponseMs: 25, currentResponseMs: Math.floor(23 + Math.random() * 6), requestRateSecs: Math.floor(3900 + Math.random() * 400), errorRate: 0.05 },
    { id: "s-3", name: "User Auth Cluster", tier: "application", status: "active", podsCount: 3, targetResponseMs: 10, currentResponseMs: Math.floor(8 + Math.random() * 4), requestRateSecs: Math.floor(820 + Math.random() * 100), errorRate: 0.01 },
    { id: "s-4", name: "Postgres Database Core", tier: "database", status: "active", podsCount: 2, targetResponseMs: 50, currentResponseMs: Math.floor(48 + Math.random() * 12), requestRateSecs: Math.floor(2400 + Math.random() * 300), errorRate: 0.00 },
    { id: "s-5", name: "Redis Memory Cache", tier: "cache", status: "active", podsCount: 3, targetResponseMs: 5, currentResponseMs: Math.floor(3 + Math.random() * 3), requestRateSecs: Math.floor(12500 + Math.random() * 1500), errorRate: 0.08 }
  ];

  // Incidents
  const incidents: Incidents[] = [
    { id: "inc-1", title: "Ingress SSL overhead peaking in ap-east", severity: "medium", status: "active", timestamp: "15 mins ago", assignee: "Sarah Jenkins" },
    { id: "inc-2", title: "Eviction count above threshold on core redis-cluster", severity: "low", status: "resolved", timestamp: "1 hour ago", assignee: "Unassigned" }
  ];

  res.json({
    nodes,
    services,
    logs: logsQueue,
    deployments: mockDeployments,
    incidents,
    systemStats: {
      globalCpu: Math.floor(nodes.reduce((acc, n) => acc + n.cpu, 0) / nodes.length),
      globalMemory: Math.floor(nodes.reduce((acc, n) => acc + n.mem, 0) / nodes.length),
      activePods: services.reduce((acc, s) => acc + s.podsCount, 0),
      networkThroughputGbps: (nodes.reduce((acc, n) => acc + n.network, 0) / 1000).toFixed(2),
      uptimeSla: 99.987,
      healthScore: 98.4
    }
  });
});

// Prompt command API endpoint for the AI Assistant Workspace
app.post("/api/ai/chat", async (req, res) => {
  const { messages, systemCtx } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Invalid format. Expected messages array." });
  }

  const lastUserMessage = messages[messages.length - 1]?.content || "";

  // Prepare a robust, technical, high-integrity system context
  const baselineSystemInstruction = `
Your name is "AETHER CORE AI", a premium, enterprise-grade cloud systems diagnostic AI. You provide answers to SRE and systems engineers.
You act as an intelligent co-pilot residing within the high-performance Infrastructure Control Plane.

Your personality:
- Extremely concise, direct, helpful, objective, highly technical, and engineer-grade. No overly cheerful intros or summaries. No emojis.
- Speak in the voice of an elite principal systems architect.
- When summarizing metrics or cluster data, use crisp tables, bullet points, or code outlines in Markdown format where appropriate.
- You have real-time access to telemetry and system definitions in the current infrastructure stack (provided below).

Telemetry Context:
${JSON.stringify(systemCtx, null, 2)}

Provide analysis, diagnostic help, system command simulations, or answers to any inquiries. If the user asks you to "adjust traffic", "scale cluster auth-service", or "deploy main-database hotfix", simulate the exact operations console code or output, and output complete YAML or SRE terminal lines as confirmations.
Keep responses completely professional, believable, and clean. Avoid neon fluff.
`;

  // If the API Key Is NOT set, return a beautiful smart fallback that mimics elite system operations and prompts the user how to configure his secrets
  if (!ai) {
    // Generate an intelligent mock response that simulates what a real Gemini model would say, with a notice
    let mockResponse = "";
    
    const queryLower = lastUserMessage.toLowerCase();
    if (queryLower.includes("cpu") || queryLower.includes("node") || queryLower.includes("heavy") || queryLower.includes("high")) {
      mockResponse = `### Telemetry Analysis: High Core Load Verified
The cluster status telemetry indicates elevated load levels on Node AP-East Core:
- **ap-east-edge-router-04**: Current CPU utilization is fluctuating around **82%-94%**.
- **Impact Zone**: Internal SLA response latency has ticked up from standard \`15ms\` to \`18ms\` in the Asia region routing tier due to elevated connection counts.

**Recommended Actions:**
1. Execute traffic shaping rules or push an edge node split constraint.
2. In the sidebar CLI Terminal, execute scaling request:
   \`\`\`bash
   aether cli scale service "Ingress Router" --replica=5
   \`\`\`
   
*Note: This is a simulated operational analysis. Add a real \`GEMINI_API_KEY\` in **Settings > Secrets** to connect the real Gemini diagnostic neural system.*`;
    } else if (queryLower.includes("deploy") || queryLower.includes("pipeline") || queryLower.includes("git")) {
      mockResponse = `### Workspace Build Matrix & Pipeline Status
Review of deployment timeline and current live version registries:
- **Active Release Node**: \`v2.14.8-rc3\` (Sarah Jenkins - Prometheus migration).
- **Compliance Status**: CI/CD pipeline checks passed with zero container scanner alarms.

To simulate rolling back or redeploying any major system module:
- You can command me: *"Rollback to deploy-1043"* or *"Initiate database vacuuming execution"*.

*Note: This is a simulated diagnostic. Add a real \`GEMINI_API_KEY\` in **Settings > Secrets** to connect the real Gemini diagnostic neural system.*`;
    } else if (queryLower.includes("scale") || queryLower.includes("pods") || queryLower.includes("increase")) {
      mockResponse = `### Operational Command Acknowledged
**Task**: Request parsing for capacity expansion in service containers.
**Target Module**: **User Auth Cluster** (Currently at 3 active pods, healthy SLA)

Running scaling prechecks:
- Cluster resource allocation headroom permits the addition of up to 4 pods on active worker nodes without thermal or CPU throttles.
- Orchestrator configuration loaded.

\`\`\`yaml
# Simulated deployment delta
spec:
  replicas: 4 # Incremented from 3
  template:
    metadata:
      labels:
        app: auth-service
\`\`\`

*Note: This is a simulated diagnostic payload. Add a real \`GEMINI_API_KEY\` in **Settings > Secrets** to connect the real Gemini diagnostic neural system.*`;
    } else {
      mockResponse = `### Aether Core Operations Intelligence Online

You are interacting with the AI Co-pilot of the world-class Enterprise Operations Center. 

**I have scanned the active telemetry payload:**
- **System Health**: ${systemCtx?.systemStats?.healthScore || "98.4"}% operational score
- **Active Pods**: ${systemCtx?.systemStats?.activePods || 18} instances running across 4 globally distributed edge servers.
- **Global Network Capacity**: Current traffic is moving at ${systemCtx?.systemStats?.networkThroughputGbps || "1.74"} Gbps.

**Available Commands / Topics you can discuss:**
- *"Analyze ap-east edge router performance"* - Runs an SRE load report on Node 4
- *"Initiate auto-scaling on API gateway cluster"* - Scales up container counts
- *"Summarize database slow-queries"* - Runs a check of PostgreSQL log pipelines
- *"General Q&A"* - Feel free to ask absolute custom questions about Cloud architecture, Kubernetes, AWS migration, or Palantir data logic.

*Note: You are running in AI Sandbox Demo Mode. This assistant is generating high-fidelity simulated diagnostic responses. To activate actual real-time Gemini reasoning on the live system, paste your Gemini API Key directly in **Settings > Secrets**.*`;
    }

    // Delay slightly to feel realistic
    await new Promise((resolve) => setTimeout(resolve, 800));
    return res.json({ text: mockResponse });
  }

  // If we DO have a real Gemini Client, query the Gemini API!
  try {
    // Transform input chat history to the format expected by GoogleGenAI
    const formattedContents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : m.role,
      parts: [{ text: m.content }]
    }));

    // Call Gemini! Uses gemini-3.5-flash as instructed in Gemini-api skill for basic/interactive text tasks
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: baselineSystemInstruction,
        temperature: 0.7,
      },
    });

    const parsedText = response.text || "Diagnostic query returned empty payload.";
    res.json({ text: parsedText });

  } catch (error: any) {
    console.error("Gemini API backend error:", error);
    res.status(500).json({ 
      error: "Gemini API request failed.", 
      details: error.message || String(error)
    });
  }
});

// Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Joined Vite development middleware successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving build assets statically from:", distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AETHER SERVER LIVE] running on port ${PORT}`);
  });
}

startServer();

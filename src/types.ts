/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PageId = "overview" | "services" | "analytics" | "timeline" | "ai-workspace" | "incidents";

export interface SystemStats {
  globalCpu: number;
  globalMemory: number;
  activePods: number;
  networkThroughputGbps: string;
  uptimeSla: number;
  healthScore: number;
}

export interface NodeTelemetry {
  id: string;
  name: string;
  cpu: number;
  mem: number;
  network: number;
  status: "healthy" | "warning" | "critical";
  zone: string;
}

export interface ServiceTelemetry {
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

export interface IngressLog {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "success";
  source: string;
  message: string;
}

export interface DeploymentEvent {
  id: string;
  version: string;
  author: string;
  status: "completed" | "rolling" | "failed";
  timestamp: string;
  description: string;
  deployTime: string;
}

export interface IncidentAlert {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "mitigated" | "resolved";
  timestamp: string;
  assignee: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface GlobalPlaneState {
  nodes: NodeTelemetry[];
  services: ServiceTelemetry[];
  logs: IngressLog[];
  deployments: DeploymentEvent[];
  incidents: IncidentAlert[];
  systemStats: SystemStats;
}

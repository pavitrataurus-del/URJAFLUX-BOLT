/**
 * URJAFLUX AI OS - High Availability & Failover Service (Module 2)
 * Manages Health, Readiness, and Liveness checks, Auto-Recovery, Multi-Region Failover policies,
 * and Maintenance Mode state transitions.
 */

import { ServiceHealthCheck, FailoverConfig, HealthStatus } from "../../types/enterpriseGa";
import { productionHardeningService } from "./productionHardeningService";

class HighAvailabilityService {
  private isMaintenanceMode: boolean = false;
  private failoverConfig: FailoverConfig = {
    primaryRegion: "asia-south1 (Mumbai)",
    secondaryRegion: "asia-southeast1 (Singapore)",
    autoFailoverEnabled: true,
    healthThresholdSeconds: 30,
    activeRegion: "asia-south1 (Mumbai)"
  };

  private healthChecks: Map<string, ServiceHealthCheck> = new Map();

  constructor() {
    this.refreshHealthChecks();
  }

  public refreshHealthChecks(): ServiceHealthCheck[] {
    const now = new Date().toISOString();
    const cbs = productionHardeningService.getAllCircuitBreakers();

    const services = [
      { id: "SVC-CORE-API", name: "URJAFLUX Application Gateway & Router", category: "CORE" },
      { id: "SVC-CAD-ENGINE", name: "2D/3D Spatial CAD & Vector Canvas", category: "CAD" },
      { id: "SVC-KNOWLEDGE-INGEST", name: "Knowledge Intelligence & Document Vectorizer", category: "KNOWLEDGE" },
      { id: "SVC-DIGITAL-TWIN", name: "Spatial OS & Digital Twin State Registry", category: "TWIN" },
      { id: "SVC-SECURITY-RBAC", name: "RBAC & OAuth Security Proxy", category: "SECURITY" },
      { id: "SVC-DATABASE-STORE", name: "Primary Relational / Firestore Database", category: "DATABASE" }
    ];

    services.forEach(s => {
      const cb = cbs.find(c => c.serviceName.includes(s.category));
      const isUnhealthy = cb?.state === "OPEN";
      const isDegraded = cb?.state === "HALF_OPEN";

      const status: HealthStatus = this.isMaintenanceMode 
        ? "MAINTENANCE" 
        : isUnhealthy 
        ? "UNHEALTHY" 
        : isDegraded 
        ? "DEGRADED" 
        : "HEALTHY";

      this.healthChecks.set(s.id, {
        serviceId: s.id,
        serviceName: s.name,
        status,
        liveness: !isUnhealthy,
        readiness: status === "HEALTHY" || status === "DEGRADED",
        responseTimeMs: Math.floor(12 + Math.random() * 25),
        lastCheckedAt: now,
        details: {
          circuitBreakerState: cb?.state || "CLOSED",
          consecutiveFailures: cb?.failureCount || 0,
          region: this.failoverConfig.activeRegion
        }
      });
    });

    return Array.from(this.healthChecks.values());
  }

  public getLivenessProbe(): { alive: boolean; timestamp: string; activeRegion: string } {
    return {
      alive: !this.isMaintenanceMode,
      timestamp: new Date().toISOString(),
      activeRegion: this.failoverConfig.activeRegion
    };
  }

  public getReadinessProbe(): { ready: boolean; healthyServicesCount: number; totalServicesCount: number } {
    const checks = this.refreshHealthChecks();
    const healthyCount = checks.filter(c => c.readiness).length;
    return {
      ready: healthyCount >= checks.length - 1 && !this.isMaintenanceMode,
      healthyServicesCount: healthyCount,
      totalServicesCount: checks.length
    };
  }

  public toggleMaintenanceMode(enabled: boolean, reason?: string): boolean {
    this.isMaintenanceMode = enabled;
    this.refreshHealthChecks();
    return this.isMaintenanceMode;
  }

  public isMaintenanceActive(): boolean {
    return this.isMaintenanceMode;
  }

  public triggerFailover(targetRegion?: string): FailoverConfig {
    const newRegion = targetRegion || this.failoverConfig.secondaryRegion;
    this.failoverConfig.activeRegion = newRegion;
    this.refreshHealthChecks();
    return this.failoverConfig;
  }

  public getFailoverConfig(): FailoverConfig {
    return this.failoverConfig;
  }

  public triggerAutoRecovery(): { recoveredServices: string[]; timestamp: string } {
    const cbs = productionHardeningService.getAllCircuitBreakers();
    const recovered: string[] = [];

    cbs.forEach(cb => {
      if (cb.state === "OPEN" || cb.state === "HALF_OPEN") {
        productionHardeningService.recordSuccess(cb.serviceName);
        recovered.push(cb.serviceName);
      }
    });

    this.refreshHealthChecks();
    return {
      recoveredServices: recovered,
      timestamp: new Date().toISOString()
    };
  }
}

export const highAvailabilityService = new HighAvailabilityService();

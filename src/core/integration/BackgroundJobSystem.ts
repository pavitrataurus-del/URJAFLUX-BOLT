// Module 9: Background Job System Engine
import { BackgroundJob, WorkerPoolNode, JobPriority } from "../../types/integrationPlatform";

export class BackgroundJobSystemStore {
  private jobs: Map<string, BackgroundJob> = new Map();
  private workerPool: WorkerPoolNode[] = [
    { id: "WORKER-01", name: "Worker Node Alpine-01", status: "BUSY", currentJobId: "JOB-9001", jobsCompleted: 420, uptimeSeconds: 86400 * 4 },
    { id: "WORKER-02", name: "Worker Node Alpine-02", status: "IDLE", jobsCompleted: 395, uptimeSeconds: 86400 * 4 },
    { id: "WORKER-03", name: "Worker Node Alpine-03", status: "IDLE", jobsCompleted: 510, uptimeSeconds: 86400 * 5 },
    { id: "WORKER-04", name: "Worker Node Alpine-04 (GPU Cluster)", status: "BUSY", currentJobId: "JOB-9002", jobsCompleted: 180, uptimeSeconds: 86400 * 2 }
  ];

  constructor() {
    this.seedCanonicalJobs();
  }

  private seedCanonicalJobs(): void {
    const defaultJobs: BackgroundJob[] = [
      {
        id: "JOB-9001",
        tenantId: "tenant_org_01",
        jobType: "GEO_SPATIAL_MAGNETIC_COMPUTE",
        payload: { projectId: "PRJ-CAD-8801", gridResolution: "0.1m" },
        priority: "CRITICAL",
        status: "RUNNING",
        workerId: "WORKER-01",
        retryCount: 0,
        maxRetries: 3,
        startedAt: new Date(Date.now() - 45000).toISOString(),
        createdAt: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: "JOB-9002",
        tenantId: "tenant_org_01",
        jobType: "BULK_KNOWLEDGE_DENSE_EMBEDDING",
        payload: { documentId: "KDOC-1001", chunkCount: 124 },
        priority: "HIGH",
        status: "RUNNING",
        workerId: "WORKER-04",
        retryCount: 0,
        maxRetries: 3,
        startedAt: new Date(Date.now() - 120000).toISOString(),
        createdAt: new Date(Date.now() - 150000).toISOString()
      },
      {
        id: "JOB-9003",
        tenantId: "tenant_org_01",
        jobType: "NIGHTLY_CAD_SYNCHRONIZATION",
        payload: { syncTarget: "SHAREPOINT" },
        priority: "NORMAL",
        status: "SCHEDULED",
        cronExpression: "0 2 * * *", // Nightly at 2:00 AM
        retryCount: 0,
        maxRetries: 3,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    defaultJobs.forEach(j => this.jobs.set(j.id, j));
  }

  public enqueueJob(
    tenantId: string,
    jobType: string,
    payload: Record<string, unknown>,
    priority: JobPriority = "NORMAL",
    cronExpression?: string
  ): BackgroundJob {
    const job: BackgroundJob = {
      id: `JOB-${Date.now().toString(36).toUpperCase()}`,
      tenantId,
      jobType,
      payload,
      priority,
      status: cronExpression ? "SCHEDULED" : "QUEUED",
      cronExpression,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString()
    };

    this.jobs.set(job.id, job);
    return job;
  }

  public getJobs(tenantId?: string): BackgroundJob[] {
    const list = Array.from(this.jobs.values());
    if (!tenantId) return list;
    return list.filter(j => j.tenantId === tenantId || j.tenantId === "global_tenant");
  }

  public getWorkerPool(): WorkerPoolNode[] {
    return this.workerPool;
  }
}

export const BackgroundJobSystem = new BackgroundJobSystemStore();

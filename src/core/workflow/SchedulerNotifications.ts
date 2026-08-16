import { NotificationPayload } from "./WorkflowTypes";

export interface CronJob {
  id: string;
  name: string;
  expression: string; // e.g. "*/5 * * * *"
  type: 'PERIODIC' | 'ONE_TIME' | 'MAINTENANCE';
  task: () => Promise<void>;
  lastRun?: string;
  nextRun?: string;
  status: 'ACTIVE' | 'PAUSED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
}

export class EnterpriseScheduler {
  private static instance: EnterpriseScheduler;
  private jobs: CronJob[] = [];
  private history: { jobId: string; runAt: string; status: 'SUCCESS' | 'FAILED'; error?: string }[] = [];

  private constructor() {
    this.seedDefaultJobs();
  }

  public static getInstance(): EnterpriseScheduler {
    if (!EnterpriseScheduler.instance) {
      EnterpriseScheduler.instance = new EnterpriseScheduler();
    }
    return EnterpriseScheduler.instance;
  }

  public registerJob(job: Omit<CronJob, 'status' | 'retryCount' | 'lastRun' | 'nextRun'>): void {
    this.jobs.push({
      ...job,
      status: 'ACTIVE',
      retryCount: 0,
      lastRun: undefined,
      nextRun: new Date(Date.now() + 60000).toISOString() // Simulated next minute run
    });
  }

  public getJobs(): CronJob[] {
    return this.jobs;
  }

  public getHistory() {
    return this.history;
  }

  public async triggerJobNow(id: string): Promise<void> {
    const job = this.jobs.find(j => j.id === id);
    if (!job) return;

    job.lastRun = new Date().toISOString();
    try {
      await job.task();
      this.history.push({ jobId: id, runAt: job.lastRun, status: 'SUCCESS' });
      job.retryCount = 0;
    } catch (err: any) {
      this.history.push({ jobId: id, runAt: job.lastRun, status: 'FAILED', error: err?.message });
      job.retryCount++;
      if (job.retryCount >= job.maxRetries) {
        job.status = 'FAILED';
      } else {
        // Retry policy (exponential backoff simulated)
        const delay = Math.pow(2, job.retryCount) * 100;
        setTimeout(() => {
          this.triggerJobNow(id);
        }, delay);
      }
    }
  }

  private seedDefaultJobs(): void {
    this.jobs = [
      {
        id: 'job_sla_monitor',
        name: 'SLA Guard Monitoring Task',
        expression: '*/1 * * * *',
        type: 'PERIODIC',
        task: async () => {
          console.log('[Scheduler] Evaluating step SLAs against active boundaries...');
        },
        maxRetries: 3,
        retryCount: 0,
        status: 'ACTIVE',
        lastRun: new Date(Date.now() - 30000).toISOString(),
        nextRun: new Date(Date.now() + 30000).toISOString()
      },
      {
        id: 'job_db_vacuum',
        name: 'Database Health Maintenance Check',
        expression: '0 0 * * *',
        type: 'MAINTENANCE',
        task: async () => {
          console.log('[Scheduler] Cleaning transactional event log buffers...');
        },
        maxRetries: 2,
        retryCount: 0,
        status: 'ACTIVE',
        lastRun: new Date(Date.now() - 3600000).toISOString(),
        nextRun: new Date(Date.now() + 82400000).toISOString()
      }
    ];
  }
}

export class NotificationEngine {
  private static instance: NotificationEngine;
  private notifications: NotificationPayload[] = [];

  private constructor() {}

  public static getInstance(): NotificationEngine {
    if (!NotificationEngine.instance) {
      NotificationEngine.instance = new NotificationEngine();
    }
    return NotificationEngine.instance;
  }

  public async send(
    channel: NotificationPayload['channel'],
    recipient: string,
    title: string,
    body: string
  ): Promise<NotificationPayload> {
    const payload: NotificationPayload = {
      id: `notif_${Math.random().toString(36).substring(2, 11)}`,
      channel,
      recipient,
      title,
      body,
      status: 'PENDING',
      retries: 0
    };

    this.notifications.push(payload);

    // Call abstract provider adapter
    await this.dispatchToProvider(payload);

    return payload;
  }

  public getNotifications(): NotificationPayload[] {
    return this.notifications;
  }

  private async dispatchToProvider(notif: NotificationPayload): Promise<void> {
    try {
      // Simulate calling external adapters (Email, SMS, Slack webhooks, Push, etc.)
      console.log(`[Notification Engine] [${notif.channel}] dispatching to ${notif.recipient}: ${notif.title}`);
      
      notif.status = 'SENT';
      notif.sentAt = new Date().toISOString();
    } catch (err) {
      notif.retries++;
      if (notif.retries < 3) {
        await this.dispatchToProvider(notif);
      } else {
        notif.status = 'FAILED';
      }
    }
  }
}

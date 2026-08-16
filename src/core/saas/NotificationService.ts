import { SaaSNotification } from '../../types/saas';
import { structuredLogger } from '../telemetry/StructuredLogger';

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, SaaSNotification[]> = new Map(); // userId -> SaaSNotification[]

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public notifyUser(
    userId: string,
    organizationId: string,
    title: string,
    message: string,
    type: SaaSNotification['type'] = 'INFO'
  ): SaaSNotification {
    const notif: SaaSNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      organizationId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const userNotifs = this.notifications.get(userId) || [];
    userNotifs.unshift(notif);
    this.notifications.set(userId, userNotifs);

    structuredLogger.info('NotificationService', `Notification sent to user ${userId}: ${title}`);
    return notif;
  }

  public getUserNotifications(userId: string): SaaSNotification[] {
    return this.notifications.get(userId) || [];
  }

  public markAsRead(userId: string, notifId: string): boolean {
    const userNotifs = this.notifications.get(userId) || [];
    const notif = userNotifs.find((n) => n.id === notifId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }
}

export const notificationService = NotificationService.getInstance();

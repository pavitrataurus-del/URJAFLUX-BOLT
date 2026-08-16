import { ITimelineEvent } from './MonitoringTypes';
import { DigitalTwinRegistry } from './DigitalTwinRegistry';

export class TimelineEngineService {
  /**
   * Retrieves timeline events in chronological or reverse-chronological order.
   */
  public static getTimeline(digitalTwinId?: string, ascending: boolean = false): ITimelineEvent[] {
    const events = [...DigitalTwinRegistry.getTimelineEvents(digitalTwinId)];
    events.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return ascending ? timeA - timeB : timeB - timeA;
    });
    return events;
  }

  /**
   * Filters timeline events by event type.
   */
  public static filterTimelineByType(
    eventType: ITimelineEvent['eventType'],
    digitalTwinId?: string
  ): ITimelineEvent[] {
    const events = this.getTimeline(digitalTwinId, false);
    return events.filter((e) => e.eventType === eventType);
  }
}

import { IDigitalTwin } from "../models/TwinModels";
import { EventBus } from "../../../../infrastructure/events/EventBus";
import { TwinEventType, createTwinEvent } from "../events/TwinEvents";

export class TwinSerializer {
  private static instance: TwinSerializer;

  private constructor() {}

  public static getInstance(): TwinSerializer {
    if (!TwinSerializer.instance) {
      TwinSerializer.instance = new TwinSerializer();
    }
    return TwinSerializer.instance;
  }

  public serialize(twin: IDigitalTwin): string {
    const serialized = JSON.stringify(twin);
    EventBus.getInstance().publish(createTwinEvent(TwinEventType.TWIN_SERIALIZATION_COMPLETED, { twinId: twin.id }));
    return serialized;
  }

  public deserialize(data: string): IDigitalTwin {
    return JSON.parse(data) as IDigitalTwin;
  }
}

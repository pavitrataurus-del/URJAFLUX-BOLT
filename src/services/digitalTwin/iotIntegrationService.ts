// Module 8: IoT Integration Layer (Sensor Adapters, MQTT Topics & Broker Specs)
import { 
  SensorAdapterConfig, 
  TelemetryReading, 
  SensorType 
} from "../../types/digitalTwin";

export class IotIntegrationService {
  private static instance: IotIntegrationService;
  private sensorAdapters: Map<string, SensorAdapterConfig> = new Map();

  private constructor() {
    this.seedCanonicalSensorAdapters();
  }

  public static getInstance(): IotIntegrationService {
    if (!IotIntegrationService.instance) {
      IotIntegrationService.instance = new IotIntegrationService();
    }
    return IotIntegrationService.instance;
  }

  private seedCanonicalSensorAdapters(): void {
    const adapters: SensorAdapterConfig[] = [
      {
        sensorId: "SNS-TEMP-NE101",
        twinId: "TWIN-RM-101",
        name: "Ishan Executive Suite Precision Temperature Sensor",
        type: "TEMPERATURE",
        mqttTopic: "urjaflux/buildingA/level01/rm101/temperature",
        brokerHost: "mqtt://broker.urjaflux.io:1883",
        pollingIntervalSec: 10,
        minThreshold: 18.0,
        maxThreshold: 26.0,
        isOnline: true,
        batteryLevelPercent: 92
      },
      {
        sensorId: "SNS-HUM-NE101",
        twinId: "TWIN-RM-101",
        name: "Ishan Suite Relative Humidity Transducer",
        type: "HUMIDITY",
        mqttTopic: "urjaflux/buildingA/level01/rm101/humidity",
        brokerHost: "mqtt://broker.urjaflux.io:1883",
        pollingIntervalSec: 15,
        minThreshold: 30.0,
        maxThreshold: 60.0,
        isOnline: true,
        batteryLevelPercent: 88
      },
      {
        sensorId: "SNS-PWR-SE102",
        twinId: "TWIN-RM-102",
        name: "Agni Vault Main Power Meter Transducer",
        type: "POWER_METER",
        mqttTopic: "urjaflux/buildingA/level01/rm102/power_kw",
        brokerHost: "mqtt://broker.urjaflux.io:1883",
        pollingIntervalSec: 5,
        minThreshold: 5.0,
        maxThreshold: 60.0,
        isOnline: true
      },
      {
        sensorId: "SNS-AIR-NW103",
        twinId: "TWIN-RM-103",
        name: "Vayu Lounge CO2 & IAQ Sensor Array",
        type: "AIR_QUALITY_CO2",
        mqttTopic: "urjaflux/buildingA/level01/rm103/co2_ppm",
        brokerHost: "mqtt://broker.urjaflux.io:1883",
        pollingIntervalSec: 10,
        minThreshold: 400,
        maxThreshold: 1000,
        isOnline: true,
        batteryLevelPercent: 95
      },
      {
        sensorId: "SNS-PIR-NW103",
        twinId: "TWIN-RM-103",
        name: "Vayu Lounge Optical Occupancy & PIR Motion Counter",
        type: "OCCUPANCY_COUNT",
        mqttTopic: "urjaflux/buildingA/level01/rm103/occupants",
        brokerHost: "mqtt://broker.urjaflux.io:1883",
        pollingIntervalSec: 2,
        minThreshold: 0,
        maxThreshold: 40,
        isOnline: true
      }
    ];

    adapters.forEach(a => this.sensorAdapters.set(a.sensorId, a));
  }

  public getSensorAdapters(): SensorAdapterConfig[] {
    return Array.from(this.sensorAdapters.values());
  }

  public getSensorById(sensorId: string): SensorAdapterConfig | undefined {
    return this.sensorAdapters.get(sensorId);
  }

  /**
   * Hardware & External Broker Deployment Dependencies Documentation
   */
  public getExternalHardwareDependencies(): { name: string; type: string; requirement: string }[] {
    return [
      { name: "MQTT Message Broker", type: "Infrastructure Service", requirement: "Requires EMQX / Mosquitto MQTT v5.0 Broker on TCP/1883 or WebSocket/8083." },
      { name: "Modbus RTU / BACnet IP Gateway", type: "Hardware Gateway", requirement: "Required for legacy AHU HVAC controllers and Schneider Electric Power Meters." },
      { name: "Zigbee / Thread Border Router", type: "Wireless Gateway", requirement: "Required for battery-powered room climate PIR sensors." }
    ];
  }
}

export const iotIntegrationService = IotIntegrationService.getInstance();

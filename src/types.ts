export const MeterTypes = ["Production", "Consumption"] as const;

export type MeterType = (typeof MeterTypes)[number];

export interface MeterReading {
  meterId: string;
  meterType: MeterType;
  tenant: string | null;
  timestamp: string; // ISO 8601 format
  readingValue: number; // in kWh
  unit: "kWh";
}

export interface Tenant {
  tenantName: string;
  isParticipant: boolean;
}

export interface GridOrigins {
  nuclear: number;
  coal: number;
  gas: number;
  fossil: number;
  renewable: number;
}

export interface TenantMixConsumption {
  pvEnergy: number;
  gridEnergy: GridOrigins;
}

export interface PieChartData {
  name: string;
  value: number;
}

export const MeterTypes = [
 "Production",
 "Consumption",
] as const;

export type MeterType = typeof MeterTypes[number];

export interface MeterReading {
 meterId: string;
 meterType: MeterType;
 tenant: string | null;
 timestamp: string; // ISO 8601 format
 readingValue: number; // in kWh
 unit: 'kWh';
}

export interface Tenant {
    tenantName: string;
    isParticipant: boolean;
}

export interface Consumption {
    pvEnergy: number;
    gridEnergy: number;
}

export interface PieChartData{
    name: string;
    value: number;
}
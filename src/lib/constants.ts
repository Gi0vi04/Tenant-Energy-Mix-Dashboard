import type { Tenant } from "../types";

export const TENANTS: Tenant[] = [
  { tenantName: "Tenant 02", isParticipant: true },
  { tenantName: "Tenant 03", isParticipant: true },
  { tenantName: "Tenant 04", isParticipant: false },
]; // In a real context, this data wouldn't be constant but fetched dynamically.

export const PIE_CELL_COLORS = ["#F97316", "#3B82F6"];

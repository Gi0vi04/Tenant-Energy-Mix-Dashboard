import type { GridOrigins, Tenant } from "../types";

// In a real context, this data wouldn't be constant but fetched dynamically.
export const TENANTS: Tenant[] = [
  { tenantName: "Tenant 02", isParticipant: true },
  { tenantName: "Tenant 03", isParticipant: true },
  { tenantName: "Tenant 04", isParticipant: false },
];

// Percentages taken from the PDF containing the challenge instructions
export const GRID_ENERGY_SHARES: GridOrigins = {
  nuclear: 0.429,
  coal: 0.406,
  gas: 0.037,
  fossil: 0.039,
  renewable: 0.089,
};

export const PIE_CELL_COLORS = [
  "#33C800",
  "#FF6701",
  "#969696",
  "#FFB703",
  "#993401",
  "#028100",
];

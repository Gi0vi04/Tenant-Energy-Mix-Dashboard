import type {
  TenantMixConsumption,
  GridOrigins,
  MeterReading,
  Tenant,
  PieChartData,
} from "../../types";
import rawData from "../../data/data.json";
import { GRID_ENERGY_SHARES, TENANTS } from "../constants";
import { roundToTwo } from "../utils";

export async function fetchAggregatedConsumption(): Promise<PieChartData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = rawData as MeterReading[]; // In a real context, this is where I would fetch the data.

      const result: PieChartData[] = getAggregatedConsumption(data);

      if (result.length == 0) {
        alert("Something went wrong. Please try again.");
        throw new Error("Unexpected error.");
      }

      resolve(result);
    }, 1000);
  });
}

export async function fetchTenantConsumption(
  tenant: Tenant
): Promise<PieChartData[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = rawData as MeterReading[]; // In a real context, this is where I would fetch the data.
      const monthlyProduction = getMonthlyProduction(data);

      const result = getTenantConsumption(tenant, data, monthlyProduction);

      if (!result) {
        alert("Something went wrong. Please try again.");
        throw new Error("Unexpected error.");
      }

      resolve(result);
    }, 1000);
  });
}

function getAggregatedConsumption(data: MeterReading[]): PieChartData[] {
  let result: PieChartData[] = [];

  TENANTS.forEach((tenant) => {
    const tenantConsumptionInYear = getTenantMonthlyConsumption(
      tenant,
      data
    ).reduce((acc, currentValue) => acc + currentValue);

    result.push({
      name: tenant.tenantName,
      value: tenantConsumptionInYear,
    });
  });

  return result;
}

function getTenantConsumption(
  tenant: Tenant,
  data: MeterReading[],
  monthlyProduction: number[]
): PieChartData[] {
  const tenantMonthlyConsumption = getTenantMonthlyConsumption(tenant, data);
  const tenantMixConsumption = getYearlyTenantMixConsumption(
    tenant,
    tenantMonthlyConsumption,
    monthlyProduction
  );

  const result: PieChartData[] = [
    { name: "PV Energy", value: roundToTwo(tenantMixConsumption.pvEnergy) },
    {
      name: "Nuclear",
      value: roundToTwo(tenantMixConsumption.gridEnergy.nuclear),
    },
    { name: "Coal", value: roundToTwo(tenantMixConsumption.gridEnergy.coal) },
    { name: "Gas", value: roundToTwo(tenantMixConsumption.gridEnergy.gas) },
    {
      name: "Renewable",
      value: roundToTwo(tenantMixConsumption.gridEnergy.renewable),
    },
    {
      name: "Fossil",
      value: roundToTwo(tenantMixConsumption.gridEnergy.fossil),
    },
  ];

  return result;
}

function getTenantMonthlyConsumption(tenant: Tenant, data: MeterReading[]) {
  return data
    .filter((element: MeterReading) => element.tenant == tenant?.tenantName)
    .map((element: MeterReading) => element.readingValue);
}

function getYearlyTenantMixConsumption(
  tenant: Tenant,
  tenantMonthlyConsumption: number[],
  monthlyProduction: number[]
): TenantMixConsumption {
  let tenantConsumption: TenantMixConsumption = {
    pvEnergy: 0,
    gridEnergy: {
      nuclear: 0,
      coal: 0,
      gas: 0,
      fossil: 0,
      renewable: 0,
    },
  };

  // If the tenant is not a participant I won't calculate the participantNumber cause I don't need it
  let participantsNumber = 1;
  if (tenant?.isParticipant) {
    participantsNumber = TENANTS.filter(
      (element: Tenant) => element.isParticipant
    ).length;
  }

  let tenantYearlyGridConsumption = 0; // This value will be incremented, then used to calculate the correct proportions based on the grid share values
  for (let i = 0; i < 12; i++) {
    const tenantConsumptionInMonth = tenantMonthlyConsumption[i];
    const productionInMonth = monthlyProduction[i];

    if (tenant?.isParticipant) {
      const pvShareInMonth = productionInMonth / participantsNumber;

      if (tenantConsumptionInMonth <= pvShareInMonth) {
        tenantConsumption.pvEnergy += tenantConsumptionInMonth;
      } else {
        tenantConsumption.pvEnergy += pvShareInMonth;
        tenantYearlyGridConsumption +=
          tenantConsumptionInMonth - pvShareInMonth; // This is the remaining portion that this tenant need from the grid
      }
    } else {
      tenantYearlyGridConsumption += tenantConsumptionInMonth;
    }
  }

  tenantConsumption.gridEnergy = getGridEnergyShares(
    tenantYearlyGridConsumption
  );

  return tenantConsumption;
}

function getMonthlyProduction(data: MeterReading[]) {
  return data
    .filter((element: MeterReading) => element.meterType == "Production")
    .map((element: MeterReading) => element.readingValue);
}

function getGridEnergyShares(tenantYearlyGridConsumption: number): GridOrigins {
  return {
    nuclear: tenantYearlyGridConsumption * GRID_ENERGY_SHARES.nuclear,
    coal: tenantYearlyGridConsumption * GRID_ENERGY_SHARES.coal,
    gas: tenantYearlyGridConsumption * GRID_ENERGY_SHARES.gas,
    fossil: tenantYearlyGridConsumption * GRID_ENERGY_SHARES.fossil,
    renewable: tenantYearlyGridConsumption * GRID_ENERGY_SHARES.renewable,
  };
}

import type { Consumption, MeterReading, Tenant } from "../../types";
import rawData from "../../data/data.json";
import { TENANTS } from "../constants";

export async function fetchEnergyData(option: string): Promise<Consumption> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = rawData as MeterReading[]; // In a real context, this is where I would fetch the data.

      const monthlyProduction = getMonthlyProduction(data);

      const tenant = TENANTS.find(
        (element: Tenant) => element.tenantName == option
      );
      if (!tenant) {
        alert("Something went wrong. Please try again.");
        throw new Error("This tenant does not exists.")
      }
      console.log(tenant);

      const tenantMonthlyConsumption = getTenantMonthlyConsumption(tenant, data);
      const tenantMixConsumption = getYearlyTenantMixConsumption(
        tenant,
        tenantMonthlyConsumption,
        monthlyProduction
      );

      resolve(tenantMixConsumption);
    }, 1000);
  });
}

function getMonthlyProduction(data: MeterReading[]) {
  return data
    .filter((element: MeterReading) => element.meterType == "Production")
    .map((element: MeterReading) => element.readingValue);
}

function getTenantMonthlyConsumption(tenant:Tenant, data: MeterReading[]){
  return data.filter(
        (element: MeterReading) => element.tenant == tenant?.tenantName
      ).map((element: MeterReading) => element.readingValue);
}

function getYearlyTenantMixConsumption(
  tenant: Tenant,
  tenantMonthlyConsumption: number[],
  monthlyProduction: number[]
): Consumption {
  let tenantConsumption: Consumption = { pvEnergy: 0, gridEnergy: 0 };

  // If the tenant is not a participant I won't calculate the participantNumber cause I don't need it
  let participantsNumber = 1;
  if (tenant?.isParticipant) {
    participantsNumber = TENANTS.filter(
      (element: Tenant) => element.isParticipant
    ).length;
  }

  for (let i = 0; i < 12; i++) {
    const tenantConsumptionInMonth = tenantMonthlyConsumption[i];
    const productionInMonth = monthlyProduction[i];

    if (tenant?.isParticipant) {
      const pvShareInMonth = productionInMonth / participantsNumber;

      if(tenantConsumptionInMonth <= pvShareInMonth) tenantConsumption.pvEnergy += tenantConsumptionInMonth;
      else{
        tenantConsumption.pvEnergy += pvShareInMonth;
        tenantConsumption.gridEnergy += tenantConsumptionInMonth - pvShareInMonth;
      }
    }
    else{
      tenantConsumption.gridEnergy += tenantConsumptionInMonth;
    }
  }

  return tenantConsumption;
}

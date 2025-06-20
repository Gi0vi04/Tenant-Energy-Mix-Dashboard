import { useState, useEffect } from "react";
import {
  Container,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  Card,
  Flex,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Spinner,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  Spacer,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  fetchAggregatedConsumption,
  fetchTenantConsumption,
} from "./lib/api/consumption";
import type { PieChartData, Tenant } from "./types";
import { PIE_CELL_COLORS, TENANTS } from "./lib/constants";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";
import { CustomLabel, CustomTooltip } from "./lib/rechartsUtils";

function App() {
  const menuOptions = [
    "Aggregated",
    ...TENANTS.map((element: Tenant) => element.tenantName),
  ]; // For this (small) example I've hardcoded these values
  const [selectedView, setSelectedView] = useState("Aggregated");

  const [pieChartData, setPieChartData] = useState<PieChartData[] | null>(null);
  const [yearlyConsumption, setYearlyConsumption] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function fetchData(option: string) {
    setSelectedView(option);

    setIsLoading(true);
    try {
      let result: PieChartData[] = [];

      if (option == "Aggregated") {
        result = await fetchAggregatedConsumption();
      } else {
        const tenant = TENANTS.find(
          (element: Tenant) => element.tenantName == option
        );
        if (!tenant) {
          alert("Something went wrong. Please try again.");
          throw new Error("This tenant does not exists.");
        }

        result = await fetchTenantConsumption(tenant);
      }

      const yearlyConsumption = result.reduce(
        (acc, currentValue: PieChartData) => acc + currentValue.value,
        0
      );

      setYearlyConsumption(Math.round(yearlyConsumption));
      setPieChartData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData("Aggregated");
  }, []);

  return (
    <Container maxW="3xl">
      <Card m={4}>
        <CardHeader>
          <Heading size="md" mb={2} color="green.500">
            Tenant Energy Mix DashBoard
          </Heading>
          <Text color="gray.600">
            Analyze aggregated consumption or filter by individual user to
            better understand energy habits.
          </Text>
        </CardHeader>
        <Divider />
        <CardBody>
          <Flex justifyContent="space-between" alignItems="center">
            {!isLoading && yearlyConsumption && (
              <Stat color="gray.600">
                <StatLabel>Yearly Consumption</StatLabel>
                <StatNumber fontSize="lg">{yearlyConsumption} kWh</StatNumber>
              </Stat>
            )}
            <Spacer />
            <Menu>
              <MenuButton
                colorScheme="green"
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                {selectedView}
              </MenuButton>
              <MenuList>
                {menuOptions.map((option: string) => (
                  <MenuItem key={option} onClick={() => fetchData(option)}>
                    {option}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          </Flex>
          <Flex justifyContent="center" alignItems="center">
            {isLoading && <Spinner size="md" color="green.500" />}
            {!isLoading && pieChartData && (
              <PieChart width={400} height={250}>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={750}
                  data={pieChartData!}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={CustomLabel}
                  labelLine={false}
                >
                  {pieChartData.map((_, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_CELL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="left"
                />
              </PieChart>
            )}
            {!isLoading && !pieChartData && (
              <Text>Something went wrong. Please try again.</Text>
            )}
          </Flex>
        </CardBody>
      </Card>
    </Container>
  );
}

export default App;

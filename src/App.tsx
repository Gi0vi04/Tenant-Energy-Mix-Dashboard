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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  fetchAggregatedConsumption,
  fetchTenantConsumption,
} from "./lib/api/consumption";
import type { PieChartData, Tenant } from "./types";
import { PIE_CELL_COLORS, TENANTS } from "./lib/constants";
import { Cell, Legend, Pie, PieChart, Tooltip } from "recharts";

function App() {
  const menuOptions = [
    "Aggregated",
    ...TENANTS.map((element: Tenant) => element.tenantName),
  ]; // For this (small) example I've hardcoded these values
  const [viewSelected, setViewSelected] = useState("Aggregated");

  const [data, setData] = useState<PieChartData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchData(option: string) {
    setViewSelected(option);

    setIsLoading(true);
    try {
      if (option == "Aggregated") {
        const res: PieChartData[] = await fetchAggregatedConsumption();
        setData(res);
      } else {
        const tenant = TENANTS.find(
          (element: Tenant) => element.tenantName == option
        );
        if (!tenant) {
          alert("Something went wrong. Please try again.");
          throw new Error("This tenant does not exists.");
        }

        const res = await fetchTenantConsumption(tenant);
        setData(res);
      }
    } catch (err) {
      console.log(err);
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
          <Menu>
            <MenuButton
              colorScheme="green"
              as={Button}
              rightIcon={<ChevronDownIcon />}
            >
              {viewSelected}
            </MenuButton>
            <MenuList>
              {menuOptions.map((option: string) => (
                <MenuItem key={option} onClick={() => fetchData(option)}>
                  {option}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Flex justifyContent="center" p={4} pb={0}>
            {isLoading && <Spinner size="md" color="green.500" />}
            {!isLoading && data && (
              <PieChart width={400} height={250}>
                <Pie
                  dataKey="value"
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={750}
                  data={data!}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_CELL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="left" />
              </PieChart>
            )}
            {!isLoading && !data && (
              <Text>Something went wrong. Please try again.</Text>
            )}
          </Flex>
        </CardBody>
      </Card>
    </Container>
  );
}

export default App;

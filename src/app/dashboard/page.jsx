"use client";

import Grid from "@/components/grid";
import { getBearerToken } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const getDashboard = async (setDashboard, setFetchingDashboard) => {
  setFetchingDashboard(true);
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/dashboard",
      {
        headers: {
          Authorization: await getBearerToken(),
        },
      }
    );
    setDashboard(response.data);
  } catch (error) {
    console.error("Error fetching dashboard:", error);
  } finally {
    setFetchingDashboard(false);
  }
};

const getAllCompanies = async (setCompanies, setFetchingCompanies) => {
  setFetchingCompanies(true);
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/company",
      {
        headers: {
          Authorization: await getBearerToken(),
        },
      }
    );
    setCompanies(response.data);
  } catch (error) {
    console.error("Error fetching companies:", error);
  } finally {
    setFetchingCompanies(false);
  }
};

export default function Dashboard() {
  const [companies, setCompanies] = useState([]);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);

  const [dashboard, setDashboard] = useState({});
  const [fetchingDashboard, setFetchingDashboard] = useState(true);

  useEffect(() => {
    getDashboard(setDashboard, setFetchingDashboard);
    getAllCompanies(setCompanies, setFetchingCompanies);
  }, []);

  const loading = fetchingCompanies || fetchingDashboard;

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      <div className="space-y-4 mb-4">
        <p className="text-lg font-semibold text-gray-800">Dashboard</p>
        <p className="text-sm">
          Overview of vessels, defects, audits and ongoing classes
        </p>
      </div>
      <div className="w-full flex place-items-center mb-6 gap-4">
        <div className="flex-1 w-3/5 space-y-5">
          <div className="w-full p-4 border border-gray-300 rounded-lg shadow-md">
            <div className="flex place-items-center gap-x-2 mb-1">
              <img
                src="/logos/companies.svg"
                alt=""
                className="invert-50 w-4"
              />
              <p className="text-gray-500">Total Companies</p>
            </div>
            <p className="text-lg font-semibold">{dashboard.total_companies}</p>
          </div>
          <div className="w-full p-4 border border-gray-300 rounded-lg shadow-md">
            <div className="flex place-items-center gap-x-2 mb-1">
              <img src="/logos/users.svg" alt="" className="invert-50 w-4" />
              <p className="text-gray-500">Total Users</p>
            </div>
            <p className="text-lg font-semibold">
              {(dashboard.total_crew ?? 0) + (dashboard.total_inspectors ?? 0)}
            </p>
          </div>
          <div className="w-full p-4 border border-gray-300 rounded-lg shadow-md">
            <div className="flex place-items-center gap-x-2 mb-1">
              <img src="/logos/users.svg" alt="" className="invert-50 w-4" />
              <p className="text-gray-500">Total Crew</p>
            </div>
            <p className="text-lg font-semibold">{dashboard.total_crew}</p>
          </div>
          <div className="w-full p-4 border border-gray-300 rounded-lg shadow-md">
            <div className="flex place-items-center gap-x-2 mb-1">
              <img src="/logos/users.svg" alt="" className="invert-50 w-4" />
              <p className="text-gray-500">Total Inspectors</p>
            </div>
            <p className="text-lg font-semibold">
              {dashboard.total_inspectors}
            </p>
          </div>
        </div>
        <div className="h-full w-80 border border-gray-300 p-4 rounded-lg shadow-md">
          <p className="w-full text-center font-semibold text-lg">
            Company Distribution
          </p>
          <PlanDistributionDonut
            planDistribution={dashboard.plan_distribution}
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col p-5 border border-gray-200 rounded-lg shadow-md">
        <p className="text-lg font-semibold">All Companies</p>
        <div className="flex-1">
          <Grid
            rowData={companies}
            colDefs={[
              {
                headerName: "Company Name",
                field: "company_name",
                flex: 2,
                sortable: true,
                filter: true,
              },
              {
                headerName: "Admin Name",
                field: "admin_name",
                flex: 1.5,
                sortable: true,
              },
              {
                headerName: "Email",
                field: "admin_email",
                flex: 2,
                filter: true,
              },
              {
                headerName: "Created On",
                field: "created_at",
                flex: 1,
                valueFormatter: (p) =>
                  new Date(p.value + "Z").toLocaleDateString(),
              },
              {
                headerName: "Action",
                flex: 1,
                cellRenderer: (row) => {
                  const company_name = row.data.company_name;
                  return (
                    <Link
                      href={`/dashboard/companies/${company_name}`}
                      className="w-full h-full flex place-items-center justify-center cursor-pointer"
                    >
                      <button className="w-full h-8 flex place-items-center justify-center border border-gray-200 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white cursor-pointer">
                        View
                      </button>
                    </Link>
                  );
                },
              },
            ]}
            loading={fetchingCompanies}
          />
        </div>
      </div>
    </div>
  );
}

const COLORS = [
  "#32A4C1",
  "#1B6687",
  "#1E40AF",
  "#2563EB",
  "#3B82F6",
  "#60A5FA",
  "#93C5FD",
  "#BDBDBD",
];

const PlanDistributionDonut = ({ planDistribution }) => {
  if (!planDistribution) return null;

  const data = Object.entries(planDistribution).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="w-full h-85 bg-white rounded-xl p-4 flex flex-col">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.value === 0
                      ? "#E0E0E0" // muted grey
                      : COLORS[index % COLORS.length]
                  }
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 text-xs mt-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
            <span className="text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

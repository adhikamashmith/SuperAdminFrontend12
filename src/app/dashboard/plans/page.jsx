"use client";

import Grid from "@/components/grid";
import { getBearerToken } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const getAllPlans = async (setPlans, setFetchingPlans) => {
  setFetchingPlans(true);
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/plan",
      {
        headers: {
          Authorization: await getBearerToken(),
        },
      }
    );
    setPlans(response.data);
  } catch (error) {
    console.error("Error fetching plans:", error);
  } finally {
    setFetchingPlans(false);
  }
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  useEffect(() => {
    getAllPlans(setPlans, setFetchingPlans);
  }, []);
  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-800 bg-white">
      <div className="w-full flex place-items-center justify-between">
        <div>
          <p className="text-xl mb-2">All Plans</p>
          <p className="text-xs text-gray-400">View all Plans here</p>
        </div>
        <Link
          href="/dashboard/plans/create"
          disabled={fetchingPlans}
          className="w-fit border border-gray-200 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white px-4 p-2"
        >
          + Create Plan
        </Link>
      </div>
      <div className="flex-1 w-full rounded-xl mt-4 border border-gray-200 shadow-sm">
        <Grid
          rowData={plans}
          colDefs={[
            {
              headerName: "Plan Name",
              field: "plan_name",
              flex: 2,
              sortable: true,
              filter: true,
            },
            {
              headerName: "Price",
              field: "price",
              flex: 1.5,
              sortable: true,
            },
            {
              headerName: "Max Users",
              field: "max_users",
              flex: 2,
              filter: true,
            },
            {
              headerName: "Cycle",
              field: "cycle",
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
                const plan_name = row.data.plan_name;
                return (
                  <Link
                    href={`/dashboard/plans/${plan_name}`}
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
          loading={fetchingPlans}
        />
      </div>
    </div>
  );
}

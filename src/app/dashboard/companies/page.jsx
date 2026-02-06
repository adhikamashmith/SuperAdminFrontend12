"use client";

import Grid from "@/components/grid";
import { getBearerToken } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [fetchingCompanies, setFetchingCompanies] = useState(true);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    getAllCompanies(setCompanies, setFetchingCompanies);
  }, []);
  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-800 bg-white">
      <div className="w-full flex place-items-center justify-between">
        <div>
          <p className="text-xl mb-2">All Companies</p>
          <p className="text-xs text-gray-400">View all Companies here</p>
        </div>
        <Link
          href="/dashboard/companies/create"
          disabled={fetchingCompanies}
          className="w-fit border border-gray-200 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white px-4 p-2"
        >
          + Create Company
        </Link>
      </div>
      <div className="flex-1 w-full rounded-xl mt-4 border border-gray-200 shadow-sm">
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
                console.log(row.data);
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
  );
}

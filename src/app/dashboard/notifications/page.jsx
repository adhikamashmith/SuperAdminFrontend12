"use client";

import Grid from "@/components/grid";
import { getBearerToken } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";

const getAllNotifications = async (
  setNotifications,
  setFetchingNotifications
) => {
  setFetchingNotifications(true);
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/notification",
      {
        headers: {
          Authorization: await getBearerToken(),
        },
      }
    );
    setNotifications(response.data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  } finally {
    setFetchingNotifications(false);
  }
};

export default function Plans() {
  const [plans, setNotifications] = useState([]);
  const [fetchingNotifications, setFetchingNotifications] = useState(true);
  useEffect(() => {
    getAllNotifications(setNotifications, setFetchingNotifications);
  }, []);
  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-800 bg-white">
      <div className="w-full flex place-items-center justify-between">
        <div>
          <p className="text-xl mb-2">All Notifications</p>
          <p className="text-xs text-gray-400">View all notifications here</p>
        </div>
        <Link
          href="/dashboard/notifications/create"
          disabled={fetchingNotifications}
          className="w-fit border border-gray-200 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white px-4 p-2"
        >
          + Create Notification
        </Link>
      </div>
      <div className="flex-1 w-full rounded-xl mt-4 border border-gray-200 shadow-sm">
        <Grid
          rowData={plans}
          colDefs={[
            {
              headerName: "Notification Title",
              field: "title",
              flex: 2,
              sortable: true,
              filter: true,
            },
            {
              headerName: "Delivery",
              field: "delivery_type",
              flex: 1.5,
              valueFormatter: (p) =>
                p === "SCHEDULE_LATER" ? "Schedule Later" : "Immediate",
              sortable: true,
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
                const notification_id = row.data.notification_id;
                return (
                  <Link
                    href={`/dashboard/notifications/${notification_id}`}
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
          loading={fetchingNotifications}
        />
      </div>
    </div>
  );
}
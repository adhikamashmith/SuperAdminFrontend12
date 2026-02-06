"use client";

import { getBearerToken } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import Select from "react-select";
import { useParams } from "next/navigation";

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
    const companies = response.data;
    const options = [{ label: "All", value: "ALL" }];
    const map = {};
    for (const { company_name } of companies) {
      map[company_name] = company_name;   // ✅ key = name

      options.push({
        label: company_name,
        value: company_name,             // ✅ value = name
      });
    }
    console.log(options, map);
    setCompanies({ options, map });
  } catch (error) {
    console.error("Error fetching companies:", error);
  } finally {
    setFetchingCompanies(false);
  }
};

const getNotification = async (
  notificationId,
  setNotification,
  setFetchingNotification
) => {
  setFetchingNotification(true);
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/${notificationId}`,
      {
        headers: {
          Authorization: await getBearerToken(),
        },
      }
    );
    setNotification(response.data);
  } catch (error) {
    console.error("Error fetching notification:", error);
  } finally {
    setFetchingNotification(false);
  }
};

export default function Plan() {
  const params = useParams();
  const { notificationId } = params;
  const [notification, setNotification] = useState({
    title: "",
    delivery_type: "IMMEDIATE",
    scheduled_at: "",
    message: "",
    recipients: "ALL",
  });
  const [fetchingNotification, setFetchingNotification] = useState(true);

  const [companies, setCompanies] = useState({
    options: [],
    map: {},
  });
  const [fetchingCompanies, setFetchingCompanies] = useState(true);

  useEffect(() => {
    getNotification(notificationId, setNotification, setFetchingNotification);
    getAllCompanies(setCompanies, setFetchingCompanies);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      <div className="w-full flex place-items-center gap-x-2">
        <Link href="/dashboard/notifications">
          <IoIosArrowBack size={25} />
        </Link>
        <p className="text-xl">Notification Details</p>
      </div>
      <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
        <p className="w-full pb-3 border-b border-gray-400 mb-8">
          Notification Details
        </p>
        <div className="grid grid-cols-2 justify-between gap-10">
          <Field
            loading
            title="Notification Title"
            value={notification.title}
          />
          <Dropdown
            loading
            title="Delivery Type"
            options={[
              { label: "Immediate", value: "IMMEDIATE" },
              { label: "Schedule later", value: "SCHEDULE_LATER" },
            ]}
            value={
              notification.delivery_type === "IMMEDIATE"
                ? { label: "Immediate", value: "IMMEDIATE" }
                : { label: "Schedule later", value: "SCHEDULE_LATER" }
            }
            placeholder="Select Delivery Type"
          />
          <div className="mb-10">
            <p className="font-semibold mb-4">Image</p>
            {notification.s3_key ? (
              <img src={notification.s3_url} className="w-40 mb-2" />
            ) : (
              <p>No Image</p>
            )}
          </div>
          {notification.delivery_type === "SCHEDULE_LATER" && (
            <Field
              loading
              type="datetime-local"
              title="Schedule at"
              value={notification.scheduled_at}
            />
          )}
        </div>
        <div className="mb-10 space-y-10">
          <Field
            loading
            type="textarea"
            title="Notification Message"
            value={notification.message}
          />
          <Field
            loading
            type="textarea"
            title="Recipients"
            value={
              notification.recipients === "ALL"
                ? Object.values(companies.map).join(", ")
                : notification.recipients
                    ?.split(",")
                    .map((c) => companies.map[c])
                    .filter(Boolean)
                    .join(", ")
            }
          />
        </div>
        <div className="grid grid-cols-2 justify-between gap-10">
          <Field
            loading
            title="Created at"
            value={new Date(notification.created_at + "Z").toLocaleDateString("en-GB")}
          />
        </div>
      </div>
    </div>
  );
}

export const Field = ({
  type = "text",
  title,
  value,
  onChange,
  loading,
  min,
}) => {
  return (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <input
        disabled={loading}
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-gray-500 bg-[#1F9EBD0F]"
        placeholder={"Enter " + title}
      />
    </div>
  );
};

export const Dropdown = ({ title, value, onChange, options, loading }) => {
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      width: "100%",
      minHeight: "48px",
      padding: "0 4px",
      backgroundColor: "#1F9EBD0F",
      borderColor: state.isFocused ? "#6B7280" : "#D1D5DB",
      borderWidth: "1px",
      borderRadius: "0.5rem",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#6B7280",
      },
    }),

    valueContainer: (base) => ({
      ...base,
      padding: "0.75rem",
    }),

    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),

    indicatorsContainer: (base) => ({
      ...base,
      height: "48px",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    menu: (base) => ({
      ...base,
      borderRadius: "0.5rem",
      border: "1px solid #D1D5DB",
      boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
      zIndex: 50,
    }),

    option: (base, state) => ({
      ...base,
      padding: "0.75rem",
      backgroundColor: state.isFocused ? "#E5E7EB" : "white",
      color: "#374151",
      cursor: "pointer",
    }),

    placeholder: (base) => ({
      ...base,
      color: "#9CA3AF",
    }),

    singleValue: (base) => ({
      ...base,
      color: "#374151",
    }),
  };
  return (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <Select
        isDisabled={loading}
        styles={selectStyles}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={"Select " + title}
      />
    </div>
  );
};
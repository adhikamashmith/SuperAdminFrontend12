"use client";

import { countries, getBearerToken, isValidEmail } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });

import { useRouter } from "next/navigation";

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
    console.error("Error fetching companies:", error);
  } finally {
    setFetchingPlans(false);
  }
};

export default function CreateCompanyPage() {
  const [payload, setPayload] = useState({
    company_name: "",
    admin_name: "",
    admin_email: "",
    country: "",
    plan_name: "",
    start_date: "",
    end_date: "",
    status: null,
    client_documents: [],
    company_documents: [],
  });
  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [creatingCompany, setCreatingCompany] = useState(false);
  const [showCreatedCompanyModal, setShowCreatedCompanyModal] = useState(false);
  const router = useRouter();
  useEffect(() => {
    getAllPlans(setPlans, setFetchingPlans);
  }, []);

  const createCompany = async () => {
    for (const key of Object.keys(payload)) {
      if (key === "client_documents" || key === "company_documents") continue;
      if (!payload[key].trim()) return alert("Please fill all the fields");
      if (key === "admin_email" && !isValidEmail(payload[key]))
        return alert("Please fill a valid email");
    }
    setCreatingCompany(true);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/company/create",
        payload,
        {
          headers: {
            Authorization: await getBearerToken(),
          },
        }
      );
      const company_name = response.data.company_name;
      setShowCreatedCompanyModal(true);
      setTimeout(() => {
        router.push(`/dashboard/companies/${company_name}`);
        setShowCreatedCompanyModal(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating company:", error);

      const message =
        error?.response?.data?.detail?.message || // standardized backend
        error?.response?.data?.detail ||          // legacy backend
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";

      alert(message);
    } finally {
      setCreatingCompany(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      {showCreatedCompanyModal && (
        <div className="absolute top-0 left-0 w-screen h-screen flex place-items-center justify-center bg-black/20 z-10">
          <div className="w-120 h-60 flex flex-col place-items-center justify-center bg-white rounded-xl">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-[#1B6687] to-[#209CBB] flex place-items-center justify-center mb-8">
              <FaCheck size={30} className="text-white" />
            </div>
            <p className="font-semibold text-lg">
              Company created Successfully!!
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex place-items-center gap-x-2">
        <Link href="/dashboard/companies">
          <IoIosArrowBack size={25} />
        </Link>
        <p className="text-xl">Create Company</p>
      </div>
      <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
        <p className="w-full pb-3 border-b border-gray-400 mb-8">
          Company Details
        </p>
        <div className="grid grid-cols-2 justify-between gap-10">
          <Field
            loading={creatingCompany}
            title="Company Name"
            value={payload.company_name}
            onChange={(e) =>
              setPayload((old) => ({ ...old, company_name: e.target.value }))
            }
          />
          <Field
            loading={creatingCompany}
            title="Admin Name"
            value={payload.admin_name}
            onChange={(e) =>
              setPayload((old) => ({ ...old, admin_name: e.target.value }))
            }
          />
          <Field
            loading={creatingCompany}
            type="email"
            title="Admin Email"
            value={payload.admin_email}
            onChange={(e) =>
              setPayload((old) => ({ ...old, admin_email: e.target.value }))
            }
          />
          <Dropdown
            loading={creatingCompany}
            title="Country"
            options={countries.map((c) => ({ label: c.name, value: c.name }))}
            value={
              payload.country
                ? { label: payload.country, value: payload.country }
                : null
            }
            onChange={(option) =>
              setPayload((old) => ({ ...old, country: option?.value }))
            }
            placeholder="Select Country"
          />
          <Dropdown
            loading={creatingCompany}
            title="Plan Selection"
            options={plans.map((plan) => ({
              label: plan.plan_name,
              value: plan.plan_name,
            }))}
            value={
              payload.plan_name
                ? {
                    label: plans.filter((p) => p.plan_name === payload.plan_name)[0]
                      .plan_name,
                    value: payload.plan_name,
                  }
                : null
            }
            onChange={(option) =>
              setPayload((old) => ({ ...old, plan_name: option?.value }))
            }
            placeholder="Select Plan"
          />
          <Dropdown
            loading={creatingCompany}
            title="Status"
            options={[
              { label: "Active", value: "Active" },
              // { label: "In Progress", value: "In Progress" },
              { label: "Inactive", value: "Inactive" },
              // { label: "Some Other Status", value: "Some Other Status" },
            ]}
            value={
              payload.status
                ? {
                    label: payload.status,
                    value: payload.status,
                  }
                : null
            }
            onChange={(option) =>
              setPayload((old) => ({ ...old, status: option?.value }))
            }
            placeholder="Select Status"
          />
          <Field
            loading={creatingCompany}
            type="date"
            title="Start Date"
            value={payload.start_date}
            onChange={(e) =>
              setPayload((old) => ({ ...old, start_date: e.target.value }))
            }
          />
          <Field
            loading={creatingCompany}
            type="date"
            title="End Date"
            value={payload.end_date}
            onChange={(e) =>
              setPayload((old) => ({ ...old, end_date: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="w-full flex place-items-center justify-end gap-x-6">
        <Link
          href={"/dashboard/companies"}
          className="w-40 p-3 rounded-lg bg-white border border-[#209CBB] text-[#0e7893] text-center"
        >
          Cancel
        </Link>
        <button
          onClick={createCompany}
          className="w-40 p-3 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white text-center cursor-pointer"
        >
          Create Company
        </button>
      </div>
    </div>
  );
}

export const Field = ({ type = "text", title, value, onChange, loading }) => {
  return (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <input
        disabled={loading}
        type={type}
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

"use client";

import { countries, getBearerToken, isValidEmail } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import Select from "react-select";
import { useRouter } from "next/navigation";

export default function CreatePlanPage() {
  const [payload, setPayload] = useState({
    plan_name: "",
    price: 0,
    max_users: 1,
    description: "",
    cycle: "MONTHLY",
  });
  const [creatingPlan, setCreatingPlan] = useState(false);
  const [showCreatedPlanModal, setShowCreatedPlanModal] = useState(false);
  const router = useRouter();

  const createPlan = async () => {
    for (const key of Object.keys(payload))
      if (typeof payload[key] === typeof "" && !payload[key].trim())
        return alert("Please fill all the fields");
    setCreatingPlan(true);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/plan/create",
        payload,
        {
          headers: {
            Authorization: await getBearerToken(),
          },
        }
      );
      const plan_name = response.data.plan_name;
      setShowCreatedPlanModal(true);
      setTimeout(() => {
        router.push(`/dashboard/plans/${plan_name}`);
        setShowCreatedPlanModal(false);
      }, 3000);
    } catch (error) {
      alert("Some error occured");
      console.error("Error creating plan:", error);
    } finally {
      setCreatingPlan(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      {showCreatedPlanModal && (
        <div className="absolute top-0 left-0 w-screen h-screen flex place-items-center justify-center bg-black/20 z-10">
          <div className="w-120 h-60 flex flex-col place-items-center justify-center bg-white rounded-xl">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-[#1B6687] to-[#209CBB] flex place-items-center justify-center mb-8">
              <FaCheck size={30} className="text-white" />
            </div>
            <p className="font-semibold text-lg">Plan created Successfully!!</p>
          </div>
        </div>
      )}
      <div className="w-full flex place-items-center gap-x-2">
        <Link href="/dashboard/plans">
          <IoIosArrowBack size={25} />
        </Link>
        <p className="text-xl">Create Plan</p>
      </div>
      <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
        <p className="w-full pb-3 border-b border-gray-400 mb-8">
          Plan Details
        </p>
        <div className="grid grid-cols-2 justify-between gap-10">
          <Field
            loading={creatingPlan}
            title="Plan Name"
            value={payload.plan_name}
            onChange={(e) =>
              setPayload((old) => ({ ...old, plan_name: e.target.value }))
            }
          />
          <Field
            loading={creatingPlan}
            type="number"
            title="Price"
            value={payload.price}
            min={0}
            onChange={(e) =>
              setPayload((old) => ({ ...old, price: e.target.value }))
            }
          />
          <Field
            loading={creatingPlan}
            type="number"
            title="Max Users"
            min={1}
            value={payload.max_users}
            onChange={(e) =>
              setPayload((old) => ({ ...old, max_users: e.target.value }))
            }
          />
          <Dropdown
            loading={creatingPlan}
            title="Cycle"
            options={[
              { label: "Monthly", value: "MONTHLY" },
              { label: "Annualy", value: "ANNUALY" },
            ]}
            value={{
              label: payload.cycle === "MONTHLY" ? "Monthly" : "Annualy",
              value: payload.cycle,
            }}
            onChange={(option) =>
              setPayload((old) => ({ ...old, cycle: option?.value }))
            }
            placeholder="Select Cycle"
          />
          <Field
            loading={creatingPlan}
            type="textarea"
            title="Description"
            value={payload.description}
            onChange={(e) =>
              setPayload((old) => ({ ...old, description: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="w-full flex place-items-center justify-end gap-x-6">
        <Link
          href={"/dashboard/plans"}
          className="w-40 p-3 rounded-lg bg-white border border-[#209CBB] text-[#0e7893] text-center"
        >
          Cancel
        </Link>
        <button
          onClick={createPlan}
          className="w-40 p-3 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white text-center cursor-pointer"
        >
          Create Plan
        </button>
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

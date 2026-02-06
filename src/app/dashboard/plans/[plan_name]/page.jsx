"use client";

import { countries, getBearerToken, isValidEmail } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import Select from "react-select";
import { useParams, useRouter } from "next/navigation";
import { MdEdit } from "react-icons/md";
import Grid from "@/components/grid";

const getPlan = async (plan_name, setPlan, setFetchingPlan) => {
  setFetchingPlan(true);
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/plan/${plan_name}`,
      {
        headers: {
          Authorization: await getBearerToken(),
        },
      }
    );
    setPlan(response.data);
  } catch (error) {
    console.error("Error fetching plan:", error);
  } finally {
    setFetchingPlan(false);
  }
};

export default function Plan() {
  const params = useParams();
  const { plan_name } = params;
  const [plan, setPlan] = useState({
    plan_name: "",
    price: 0,
    max_users: 1,
    description: "",
    cycle: 1,
  });
  const [fetchingPlan, setFetchingPlan] = useState(true);

  const [updatingPlan, setUpdatingPlan] = useState(false);
  const [showUpdatedPlanModal, setShowUpdatedPlanModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const updatePlan = async () => {
    for (const key of Object.keys(plan))
      if (typeof plan[key] === typeof "" && !plan[key].trim())
        return alert("Please fill all the fields");
    setUpdatingPlan(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/plan/${plan_name}`,
        plan,
        {
          headers: {
            Authorization: await getBearerToken(),
          },
        }
      );
      setPlan(response.data);
      setShowUpdatedPlanModal(true);
      setTimeout(() => {
        window.location.reload();
        setShowUpdatedPlanModal(false);
      }, 3000);
    } catch (error) {
      alert("Some error occured");
      console.error("Error updating plan:", error);
    } finally {
      setUpdatingPlan(false);
    }
  };

  useEffect(() => {
    getPlan(plan_name, setPlan, setFetchingPlan);
  }, []);

  const disabled = fetchingPlan || updatingPlan || !isEditing;

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      {showUpdatedPlanModal && (
        <div className="absolute top-0 left-0 w-screen h-screen flex place-items-center justify-center bg-black/20 z-10">
          <div className="w-120 h-60 flex flex-col place-items-center justify-center bg-white rounded-xl">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-[#1B6687] to-[#209CBB] flex place-items-center justify-center mb-8">
              <FaCheck size={30} className="text-white" />
            </div>
            <p className="font-semibold text-lg">Plan updated Successfully!!</p>
          </div>
        </div>
      )}
      <div className="w-full flex place-items-center justify-between gap-x-2">
        <div className="flex place-items-center gap-x-2">
          <Link href="/dashboard/plans">
            <IoIosArrowBack size={25} />
          </Link>
          <p className="text-xl">
            Plan Details{" "}
            <span className="text-sm">
              ({isEditing ? "Editing" : "View"} Mode)
            </span>
          </p>
        </div>
        {!isEditing && (
          <MdEdit
            size={25}
            className="cursor-pointer"
            onClick={() => setIsEditing(true)}
          />
        )}
      </div>
      <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
        <p className="w-full pb-3 border-b border-gray-400 mb-8">
          Plan Details
        </p>
        <div className="grid grid-cols-2 justify-between gap-x-10 gap-y-5">
          <Field
            loading={disabled}
            title="Plan Name"
            value={plan.plan_name}
            onChange={(e) =>
              setPlan((old) => ({ ...old, plan_name: e.target.value }))
            }
          />
          <Field
            loading={disabled}
            type="number"
            title="Price"
            value={plan.price}
            min={0}
            onChange={(e) =>
              setPlan((old) => ({ ...old, price: e.target.value }))
            }
          />
          <Field
            loading={disabled}
            type="number"
            title="Max Users"
            min={1}
            value={plan.max_users}
            onChange={(e) =>
              setPlan((old) => ({ ...old, max_users: e.target.value }))
            }
          />
          <Dropdown
            loading={disabled}
            title="Cycle"
            options={[
              { label: "Monthly", value: "MONTHLY" },
              { label: "Annualy", value: "ANNUALY" },
            ]}
            value={{
              label: plan.cycle === "MONTHLY" ? "Monthly" : "Annualy",
              value: plan.cycle,
            }}
            onChange={(option) =>
              setPlan((old) => ({ ...old, cycle: option?.value }))
            }
            placeholder="Select Cycle"
          />
          <Field
            loading={disabled}
            type="textarea"
            title="Description"
            value={plan.description}
            onChange={(e) =>
              setPlan((old) => ({ ...old, description: e.target.value }))
            }
          />
          <p></p>
          <p>
            Last Updated On {new Date(plan.updated_at + "Z").toLocaleString()}
          </p>
          <p>Created On {new Date(plan.created_at + "Z").toLocaleString()}</p>
        </div>
      </div>
      {isEditing && (
        <div className="w-full flex place-items-center justify-end gap-x-6">
          <button
            onClick={() => window.location.reload()}
            className="w-40 p-3 rounded-lg bg-white border border-[#209CBB] text-[#0e7893] text-center cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={updatePlan}
            className="w-40 p-3 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white text-center cursor-pointer"
          >
            Update Plan
          </button>
        </div>
      )}
      <p className="px-5 font-semibold border-gray-300">
        Companies using this plan
      </p>
      <div className="flex-1 px-5">
        <Grid
          rowData={plan.companies}
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
              headerName: "Country",
              field: "country",
              flex: 2,
              filter: true,
            },
            {
              headerName: "Created On",
              field: "created_at",
              flex: 1,
              valueFormatter: (p) =>
                new Date(p.value + "Z").toLocaleDateString()
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
                      Details
                    </button>
                  </Link>
                );
              },
            },
          ]}
          loading={fetchingPlan}
        />
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

"use client";

import { getBearerToken } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { FaCheck } from "react-icons/fa";
import Select from "react-select";
import { useRouter } from "next/navigation";

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

    for (const company of companies) {
      const name = company.company_name;

      if (!name) continue;

      map[name] = name; // key = value = company_name

      options.push({
        label: name,
        value: name,
      });
    }

    setCompanies({ options, map });
  } catch (error) {
    console.error("Error fetching companies:", error);
  } finally {
    setFetchingCompanies(false);
  }
};

export default function CreateNotificationPage() {
  const [payload, setPayload] = useState({
    title: "",
    delivery_type: "IMMEDIATE",
    scheduled_at: null,
    message: "",
    s3_key: null,
    recipients: "ALL",
  });
  const [creatingNotification, setCreatingNotification] = useState(false);
  const [showCreatedNotificationModal, setShowCreatedNotificationModal] =
    useState(false);
  const [image, setImage] = useState("");
  const router = useRouter();
  const [companies, setCompanies] = useState({
    options: [],
    map: {},
  });
  const [fetchingCompanies, setFetchingCompanies] = useState(true);

  const createNotification = async () => {
    if (!payload.recipients?.trim()) return alert("Please provide recipients");
    if (!payload.title.trim()) return alert("Please provide a title");
    if (!payload.message.trim()) return alert("Please provide a message");
    if (
      payload.delivery_type === "SCHEDULE_LATER" &&
      !payload.scheduled_at?.trim()
    )
      return alert("Please provide a schedule time");
    setCreatingNotification(true);
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/notification/create",
        payload,
        {
          headers: {
            Authorization: await getBearerToken(),
          },
        }
      );
      const notification_id = response.data.notification_id;
      setShowCreatedNotificationModal(true);
      setTimeout(() => {
        router.push(`/dashboard/notifications/${notification_id}`);
        setShowCreatedNotificationModal(false);
      }, 3000);
    } catch (error) {
      alert("Some error occured");
      console.error("Error creating notification:", error);
    } finally {
      setCreatingNotification(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const response = await uploadImage(file);
      const { s3_key, s3_url } = response.data;
      setImage(s3_url);
      setPayload((old) => ({ ...old, s3_key: s3_key }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload document");
    } finally {
      e.target.value = "";
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/notification/add-asset`,
      formData,
      {
        headers: {
          Authorization: await getBearerToken(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
  };

  useEffect(() => {
    getAllCompanies(setCompanies, setFetchingCompanies);
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      {showCreatedNotificationModal && (
        <div className="absolute top-0 left-0 w-screen h-screen flex place-items-center justify-center bg-black/20 z-10">
          <div className="w-120 h-60 flex flex-col place-items-center justify-center bg-white rounded-xl">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-[#1B6687] to-[#209CBB] flex place-items-center justify-center mb-8">
              <FaCheck size={30} className="text-white" />
            </div>
            <p className="font-semibold text-lg">
              Notification created Successfully!!
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex place-items-center gap-x-2">
        <Link href="/dashboard/notifications">
          <IoIosArrowBack size={25} />
        </Link>
        <p className="text-xl">Create Notification</p>
      </div>
      <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
        <p className="w-full pb-3 border-b border-gray-400 mb-8">
          Create Notification
        </p>
        <div className="grid grid-cols-2 justify-between gap-10 mb-10">
          <Field
            loading={creatingNotification}
            title="Notification Title"
            value={payload.title}
            onChange={(e) =>
              setPayload((old) => ({ ...old, title: e.target.value }))
            }
          />
          <Dropdown
            loading={creatingNotification}
            title="Delivery Type"
            options={[
              { label: "Immediate", value: "IMMEDIATE" },
              { label: "Schedule later", value: "SCHEDULE_LATER" },
            ]}
            value={
              payload.delivery_type === "IMMEDIATE"
                ? { label: "Immediate", value: "IMMEDIATE" }
                : { label: "Schedule later", value: "SCHEDULE_LATER" }
            }
            onChange={(option) => {
              setPayload((old) => {
                if (option.value === "IMMEDIATE")
                  return {
                    ...old,
                    delivery_type: option?.value,
                    scheduled_at: null,
                  };
                return { ...old, delivery_type: option?.value };
              });
            }}
            placeholder="Select Delivery Type"
          />
          <div>
            <div className="mb-10">
              <p className="font-semibold mb-4">Image</p>
              {payload.s3_key && <img src={image} className="w-40 mb-2" />}
              {payload.s3_url && image && (
                <div>
                  <button
                    className="border border-gray-200 bg-red-500 text-white px-3 rounded-lg mb-4 cursor-pointer"
                    onClick={() => {
                      setPayload((old) => ({ ...old, s3_key: null }));
                      setImage(null);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
              <input
                type="File"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 hover:file:cursor-pointer"
              />
            </div>
            <Dropdown
              loading={fetchingCompanies}
              title="Recipients"
              isMulti
              options={companies.options}
              value={
                payload.recipients
                  ? payload.recipients === "ALL"
                    ? [{ label: "All", value: "ALL" }]
                    : payload.recipients.split(",").map((company_name) => ({
                        label: companies.map[company_name],
                        value: company_name,
                      }))
                  : null
              }
              onChange={(options) => {
                setPayload((old) => {
                  if (options.length === 0)
                    return {
                      ...old,
                      recipients: null,
                    };
                  const isAll = options.find((o) => o.value === "ALL");
                  if (isAll)
                    return {
                      ...old,
                      recipients: "ALL",
                    };
                  return {
                    ...old,
                    recipients: options.map((o) => o.value).join(","),
                  };
                });
              }}
              placeholder="Select Recipients"
            />
          </div>
          {payload.delivery_type === "SCHEDULE_LATER" && (
            <Field
              loading={creatingNotification}
              type="datetime-local"
              title="Schedule at"
              value={payload.scheduled_at ?? ""}
              onChange={(e) =>
                setPayload((old) => ({ ...old, scheduled_at: e.target.value }))
              }
            />
          )}
        </div>
        <div>
          <Field
            loading={creatingNotification}
            type="textarea"
            title="Notification Message"
            value={payload.message}
            onChange={(e) =>
              setPayload((old) => ({ ...old, message: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="w-full flex place-items-center justify-end gap-x-6">
        <Link
          href={"/dashboard/notifications"}
          className="w-40 p-3 rounded-lg bg-white border border-[#209CBB] text-[#0e7893] text-center"
        >
          Cancel
        </Link>
        <button
          onClick={createNotification}
          className="w-40 p-3 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white text-center cursor-pointer"
        >
          Create Notification
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

export const Dropdown = ({
  title,
  value,
  onChange,
  options,
  loading,
  isMulti = false,
}) => {
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
        isMulti={isMulti}
        closeMenuOnSelect={isMulti && false}
        options={options}
        value={value}
        onChange={onChange}
        placeholder={"Select " + title}
      />
    </div>
  );
};
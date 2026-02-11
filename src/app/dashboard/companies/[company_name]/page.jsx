"use client";

import { countries, getBearerToken, isValidEmail } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosClose, IoMdClose } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { FaCheck, FaFile } from "react-icons/fa";
import { LuFilePlus2 } from "react-icons/lu";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });

import { useParams, useRouter } from "next/navigation";

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

const getCompany = async (company_name, setCompany, setFetchingCompany) => {
  setFetchingCompany(true);
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/company" + "/" + company_name,
      {
        headers: {
          Authorization: await getBearerToken(),
        },
      }
    );
    setCompany(response.data);
  } catch (error) {
    console.error("Error fetching company", error);
  } finally {
    setFetchingCompany(false);
  }
};

const loadPaylod = async (
  company_name,
  setCompany,
  setFetchingCompany,
  setPlans,
  setFetchingPlans
) => {
  try {
    await getAllPlans(setPlans, setFetchingPlans);
    await getCompany(company_name, setCompany, setFetchingCompany);
  } catch (error) {
    alert("Error loading page");
  }
};

export default function CompanyDetailsPage() {
  const { company_name } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState({
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
  const [fetchingCompany, setFetchingCompany] = useState(true);

  const [plans, setPlans] = useState([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);

  const [updatingCompany, setUpdatingCompany] = useState(false);
  const [showUpdatedCompanyModal, setShowUpdatedCompanyModal] = useState(false);

  const [isDeletingDocument, setIsDeletingDocument] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const clientFileInputRef = useRef(null);
  const companyFileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleAddClick = (type) => {
    if (type === "client") clientFileInputRef.current?.click();
    else companyFileInputRef.current?.click();
  };

  const uploadClientDocument = async (company_name, title, file) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    return axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}/client-document`,
      formData,
      {
        headers: {
          Authorization: await getBearerToken(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
  };

  const uploadCompanyDocument = async (company_name, title, file) => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    return axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}/company-document`,
      formData,
      {
        headers: {
          Authorization: await getBearerToken(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const title = file.name;

    try {
      setUploading(true);
      if (type === "client") await uploadClientDocument(company_name, title, file);
      else await uploadCompanyDocument(company_name, title, file);

      await getCompany(company_name, setCompany, setFetchingCompany);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload document");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!company_name) return;

    loadPaylod(
      company_name,
      setCompany,
      setFetchingCompany,
      setPlans,
      setFetchingPlans
    );
  }, [company_name]);

  /* 🔥 UPDATED: updateCompany function to send only specific fields */
  const updateCompany = async () => {
    const requiredFields = [
      "admin_name",
      "admin_email",
      "country",
      "status",
      "start_date",
      "end_date",
    ];

    for (const key of requiredFields) {
      if (!company[key] || !company[key].toString().trim()) {
        return alert("Please fill all the fields");
      }

      if (key === "admin_email" && !isValidEmail(company[key])) {
        return alert("Please fill a valid email");
      }
    }

    setUpdatingCompany(true);

    try {
      /* 🔥 Only sending allowed fields to DB */
      const payload = {
        admin_name: company.admin_name,
        admin_email: company.admin_email,
        country: company.country,
        status: company.status,
        start_date: company.start_date,
        end_date: company.end_date,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}`,
        payload,
        {
          headers: {
            Authorization: await getBearerToken(),
          },
        }
      );

      setCompany(response.data);
      setShowUpdatedCompanyModal(true);
      setIsEditing(false); // Switch back to view mode

      setTimeout(() => {
        setShowUpdatedCompanyModal(false);
      }, 2000);

    } catch (error) {
      alert("Some error occured");
      console.error("Error updating company:", error);
    } finally {
      setUpdatingCompany(false);
    }
  };

  const deleteClientDocument = async (document_id) => {
    setIsDeletingDocument(true);
    try {
      if (confirm("Are you sure you want to delete this document?")) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}/client-document/${document_id}`,
          {
            headers: {
              Authorization: await getBearerToken(),
            },
          }
        );
        getCompany(company_name, setCompany, setFetchingCompany);
      } else return;
    } catch (error) {
      alert("Some error occured");
    } finally {
      setIsDeletingDocument(false);
    }
  };

  const deleteCompanyDocument = async (document_id) => {
    setIsDeletingDocument(true);
    try {
      if (confirm("Are you sure you want to delete this document?")) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}/company-document/${document_id}`,
          {
            headers: {
              Authorization: await getBearerToken(),
            },
          }
        );
        getCompany(company_name, setCompany, setFetchingCompany);
      } else return;
    } catch (error) {
      alert("Some error occured");
    } finally {
      setIsDeletingDocument(false);
    }
  };

  const loading = fetchingCompany || fetchingPlans || updatingCompany;

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      {showUpdatedCompanyModal && (
        <div className="absolute top-0 left-0 w-screen h-screen flex place-items-center justify-center bg-black/20 z-50">
          <div className="w-120 h-60 flex flex-col place-items-center justify-center bg-white rounded-xl shadow-lg">
            <div className="w-16 h-16 rounded-full bg-linear-to-r from-[#1B6687] to-[#209CBB] flex place-items-center justify-center mb-8">
              <FaCheck size={30} className="text-white" />
            </div>
            <p className="font-semibold text-lg">
              Company Updated Successfully!!
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex place-items-center gap-x-2 mb-4">
        <Link href="/dashboard/companies">
          <IoIosArrowBack size={25} />
        </Link>
        <p className="text-xl font-bold">{company.company_name ?? "Loading..."}</p>
      </div>
      <p className="mb-4">View all details about the company here</p>

      <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
        <div className="w-full flex place-items-center justify-between mb-8 pb-3 border-b border-gray-400">
          <p className="font-semibold">
            Company Details{" "}
            <span className="text-sm font-normal">
              ({isEditing ? "Editing" : "View"} Mode)
            </span>
          </p>
          {!isEditing && (
            <MdEdit
              size={25}
              className="cursor-pointer text-blue-500 hover:text-blue-700"
              onClick={() => setIsEditing(true)}
            />
          )}
        </div>

        <div className="grid grid-cols-2 justify-between gap-10">
          {/* 🔥 Company Name - Strictly Read Only */}
          <Field
            loading={true} 
            title="Company Name"
            value={company.company_name}
          />

          {/* 🔥 Plan Name - Read Only here (Changed via Renew) */}
          <Field
            loading={true}
            title="Current Plan"
            value={company.plan_name}
          />

          <Field
            loading={!isEditing || loading}
            title="Admin Name"
            value={company.admin_name}
            onChange={(e) =>
              setCompany((old) => ({ ...old, admin_name: e.target.value }))
            }
          />
          <Field
            loading={!isEditing || loading}
            type="email"
            title="Admin Email"
            value={company.admin_email}
            onChange={(e) =>
              setCompany((old) => ({ ...old, admin_email: e.target.value }))
            }
          />
          <Dropdown
            loading={!isEditing || loading}
            title="Country"
            options={countries.map((c) => ({ label: c.name, value: c.name }))}
            value={
              company.country
                ? { label: company.country, value: company.country }
                : null
            }
            onChange={(option) =>
              setCompany((old) => ({ ...old, country: option?.value }))
            }
            placeholder="Select Country"
          />
          <Dropdown
            loading={!isEditing || loading}
            title="Status"
            options={[
              { label: "Active", value: "Active" },
              { label: "In Progress", value: "In Progress" },
              { label: "Inactive", value: "Inactive" },
            ]}
            value={
              company.status
                ? {
                    label: company.status,
                    value: company.status,
                  }
                : null
            }
            onChange={(option) =>
              setCompany((old) => ({ ...old, status: option?.value }))
            }
            placeholder="Select Status"
          />
          <Field
            loading={!isEditing || loading}
            type="date"
            title="Start Date"
            value={company.start_date?.split("T")[0] || ""}
            onChange={(e) =>
              setCompany((old) => ({ ...old, start_date: e.target.value }))
            }
          />
          <Field
            loading={!isEditing || loading}
            type="date"
            title="End Date"
            value={company.end_date?.split("T")[0] || ""}
            onChange={(e) =>
              setCompany((old) => ({ ...old, end_date: e.target.value }))
            }
          />
        </div>
      </div>

      {/* EDIT MODE BUTTONS */}
      {isEditing && (
        <div className="w-full flex place-items-center justify-end gap-x-6 pr-4">
          <button
            className="w-40 p-3 rounded-lg bg-white border border-gray-400 text-gray-600 text-center cursor-pointer hover:bg-gray-50"
            onClick={() => {
              setIsEditing(false);
              getCompany(company_name, setCompany, setFetchingCompany);
            }}
          >
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={updateCompany}
            className="w-40 p-3 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white text-center cursor-pointer disabled:opacity-50"
          >
            {updatingCompany ? "Updating..." : "Update Company"}
          </button>
        </div>
      )}

      {/* VIEW MODE SECTION */}
      {!isEditing && (
        <div className="w-full">
          {/* 🔥 RENEW PLAN BUTTON */}
          <div className="w-full flex justify-end mb-4 pr-4">
            <button
              onClick={() =>
                router.push(`/dashboard/companies/${company_name}/renew`)
              }
              className="w-48 p-3 rounded-lg bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white text-center cursor-pointer shadow hover:opacity-90"
            >
              Change / Renew Plan
            </button>
          </div>

          {/* CLIENT DOCUMENTS */}
          <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
            <div className="w-full flex place-items-center justify-between mb-8 pb-3 border-b border-gray-400">
              <p className="font-semibold">Client Documents</p>
              <div
                className="cursor-pointer text-blue-600 hover:opacity-80"
                onClick={() => handleAddClick("client")}
              >
                <LuFilePlus2 size={25} />
                <input
                  ref={clientFileInputRef}
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange(e, "client")}
                />
              </div>
            </div>

            <div className="w-full flex place-items-center gap-x-4 overflow-x-auto pb-4">
              {fetchingCompany && "Loading..."}
              {company.client_documents?.length === 0 && <p className="text-sm text-gray-400">No Documents</p>}
              {company.client_documents.map(
                ({ title, document_id, s3_url, created_at }) => (
                  <div
                    key={document_id}
                    className="min-w-50 w-fit h-fit flex flex-col place-items-center p-4 rounded-xl border border-gray-200 cursor-pointer relative group"
                  >
                    <IoIosClose
                      size={35}
                      className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteClientDocument(document_id)}
                    />
                    <div
                      onClick={() => window.open(s3_url)}
                      className="flex flex-col place-items-center"
                    >
                      <FaFile size={60} className="mb-2 text-gray-400" />
                      <p className="max-w-40 truncate text-sm font-medium">{title}</p>
                      <p className="text-[10px] text-gray-500">
                        Uploaded{" "}
                        {new Date(created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* COMPANY DOCUMENTS */}
          <div className="w-full rounded-xl mt-4 p-4 border border-gray-200 shadow-sm m-4">
            <div className="w-full flex place-items-center justify-between mb-8 pb-3 border-b border-gray-400">
              <p className="font-semibold">Company Documents</p>
              <div
                className="cursor-pointer text-blue-600 hover:opacity-80"
                onClick={() => handleAddClick("company")}
              >
                <LuFilePlus2 size={25} />
                <input
                  ref={companyFileInputRef}
                  type="file"
                  hidden
                  onChange={(e) => handleFileChange(e, "company")}
                />
              </div>
            </div>

            <div className="w-full flex place-items-center gap-x-4 overflow-x-auto pb-4">
              {fetchingCompany && "Loading..."}
              {company.company_documents?.length === 0 && <p className="text-sm text-gray-400">No Documents</p>}
              {company.company_documents.map(
                ({ title, document_id, s3_url, created_at }) => (
                  <div
                    key={document_id}
                    className="min-w-50 w-fit h-fit flex flex-col place-items-center p-4 rounded-xl border border-gray-200 cursor-pointer relative group"
                  >
                    <IoIosClose
                      size={35}
                      className="absolute top-1 right-1 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteCompanyDocument(document_id)}
                    />
                    <div
                      onClick={() => window.open(s3_url)}
                      className="flex flex-col place-items-center"
                    >
                      <FaFile size={60} className="mb-2 text-gray-400" />
                      <p className="max-w-40 truncate text-sm font-medium">{title}</p>
                      <p className="text-[10px] text-gray-500">
                        Uploaded{" "}
                        {new Date(created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
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
        className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-gray-500 bg-[#1F9EBD0F] disabled:bg-gray-100 disabled:text-gray-500"
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
      backgroundColor: state.isDisabled ? "#F3F4F6" : "#1F9EBD0F",
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

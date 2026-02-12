"use client";

import { countries, getBearerToken, isValidEmail } from "@/util";
import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IoIosArrowBack, IoIosClose } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { FaCheck, FaFile } from "react-icons/fa";
import { LuFilePlus2 } from "react-icons/lu";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });

import { useParams, useRouter } from "next/navigation";

// --- Data Fetching Functions ---

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

  const [plans, setPlans] = useState([]);
  const [fetchingCompany, setFetchingCompany] = useState(true);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [updatingCompany, setUpdatingCompany] = useState(false);
  const [renewingPlan, setRenewingPlan] = useState(false);
  const [showUpdatedCompanyModal, setShowUpdatedCompanyModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [selectedPlan, setSelectedPlan] = useState(null);

  const clientFileInputRef = useRef(null);
  const companyFileInputRef = useRef(null);

  useEffect(() => {
    if (!company_name) return;
    loadPaylod(company_name, setCompany, setFetchingCompany, setPlans, setFetchingPlans);
  }, [company_name]);

  useEffect(() => {
    if (company.plan_name) {
      setSelectedPlan({ label: company.plan_name, value: company.plan_name });
    }
  }, [company.plan_name]);

  const handleAddClick = (type) => {
    if (type === "client") clientFileInputRef.current?.click();
    else companyFileInputRef.current?.click();
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("title", file.name);
    formData.append("file", file);

    try {
      setUploading(true);
      const endpoint = type === "client" ? "client-document" : "company-document";
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}/${endpoint}`,
        formData,
        {
          headers: {
            Authorization: await getBearerToken(),
            "Content-Type": "multipart/form-data",
          },
        }
      );
      await getCompany(company_name, setCompany, setFetchingCompany);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const updateCompany = async () => {
    const requiredFields = ["admin_name", "admin_email", "country", "status", "start_date", "end_date"];
    for (const key of requiredFields) {
      if (!company[key]) return alert(`Please fill ${key}`);
    }

    setUpdatingCompany(true);
    try {
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
        { headers: { Authorization: await getBearerToken() } }
      );

      setCompany(response.data);
      setShowUpdatedCompanyModal(true);
      setIsEditing(false);
      setTimeout(() => setShowUpdatedCompanyModal(false), 2000);
    } catch (error) {
      alert("Error updating details");
    } finally {
      setUpdatingCompany(false);
    }
  };

  const handleRenewPlan = async () => {
    if (!selectedPlan) return alert("Please select a plan");
    setRenewingPlan(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}/renew`,
        { plan_name: selectedPlan.value },
        { headers: { Authorization: await getBearerToken() } }
      );
      alert("Plan updated successfully!");
      getCompany(company_name, setCompany, setFetchingCompany);
    } catch (error) {
      alert("Failed to renew plan");
    } finally {
      setRenewingPlan(false);
    }
  };

  const deleteDocument = async (type, id) => {
    if (!confirm("Delete this document?")) return;
    try {
      const endpoint = type === "client" ? "client-document" : "company-document";
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/company/${company_name}/${endpoint}/${id}`,
        { headers: { Authorization: await getBearerToken() } }
      );
      getCompany(company_name, setCompany, setFetchingCompany);
    } catch (error) {
      alert("Delete failed");
    }
  };

  if (fetchingCompany) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="w-full h-full flex flex-col p-6 px-10 text-gray-700 bg-white">
      {showUpdatedCompanyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="w-96 p-10 bg-white rounded-xl text-center shadow-xl">
            <FaCheck size={40} className="mx-auto text-[#1B6687] mb-4" />
            <p className="text-lg font-bold">Company Updated Successfully!</p>
          </div>
        </div>
      )}

      <div className="w-full flex items-center gap-x-2 mb-6">
        <Link href="/dashboard/companies"><IoIosArrowBack size={25} /></Link>
        <p className="text-xl font-bold">{company.company_name}</p>
      </div>

      {/* --- DIV 1: COMPANY PROFILE DETAILS --- */}
      <div className="w-full rounded-xl p-6 border border-gray-200 shadow-sm mb-6 bg-white">
        <div className="flex justify-between items-center mb-8 pb-3 border-b border-gray-300">
          <p className="font-bold text-[#1B6687]">1. Company Information</p>
          {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-blue-600 font-medium">
              <MdEdit size={20} /> Edit Details
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-10">
          {/* Company Name: Locked to read-only but looks like a normal white field */}
          <Field
            loading={true}
            title="Company Name"
            value={company.company_name}
            onChange={() => {}}
          />

          <Field
            loading={!isEditing || updatingCompany}
            title="Admin Name"
            value={company.admin_name}
            onChange={(e) => setCompany({ ...company, admin_name: e.target.value })}
          />
          <Field
            loading={!isEditing || updatingCompany}
            title="Admin Email"
            value={company.admin_email}
            onChange={(e) => setCompany({ ...company, admin_email: e.target.value })}
          />
          <Dropdown
            loading={!isEditing || updatingCompany}
            title="Country"
            options={countries.map((c) => ({ label: c.name, value: c.name }))}
            value={company.country ? { label: company.country, value: company.country } : null}
            onChange={(opt) => setCompany({ ...company, country: opt?.value })}
          />
          <Dropdown
            loading={!isEditing || updatingCompany}
            title="Status"
            options={[{ label: "Active", value: "Active" }, { label: "Inactive", value: "Inactive" }]}
            value={company.status ? { label: company.status, value: company.status } : null}
            onChange={(opt) => setCompany({ ...company, status: opt?.value })}
          />
          <Field
            type="date"
            loading={!isEditing || updatingCompany}
            title="Start Date"
            value={company.start_date?.split("T")[0] || ""}
            onChange={(e) => setCompany({ ...company, start_date: e.target.value })}
          />
          <Field
            type="date"
            loading={!isEditing || updatingCompany}
            title="End Date"
            value={company.end_date?.split("T")[0] || ""}
            onChange={(e) => setCompany({ ...company, end_date: e.target.value })}
          />
        </div>

        {isEditing && (
          <div className="flex justify-end gap-x-4 mt-8 pt-4 border-t">
            <button onClick={() => { setIsEditing(false); window.location.reload(); }} className="px-8 py-2 border border-gray-400 rounded-lg">Cancel</button>
            <button onClick={updateCompany} className="px-8 py-2 bg-[#1B6687] text-white rounded-lg">Update Details</button>
          </div>
        )}
      </div>

      {/* --- DIV 2: PLAN MANAGEMENT (RENEW) --- */}
      <div className="w-full rounded-xl p-6 border border-blue-100 shadow-sm mb-6 bg-[#F8FAFC]">
        <div className="mb-8 pb-3 border-b border-blue-200">
          <p className="font-bold text-[#1B6687]">2. Subscription Plan Management</p>
        </div>

        <div className="grid grid-cols-2 gap-10 items-end">
          <Dropdown
            loading={renewingPlan}
            title="Select Plan to Change/Renew"
            options={plans.map((p) => ({ label: p.plan_name, value: p.plan_name }))}
            value={selectedPlan}
            onChange={(opt) => setSelectedPlan(opt)}
          />

          <button
            onClick={handleRenewPlan}
            disabled={renewingPlan}
            className="h-[50px] bg-gradient-to-r from-[#1B6687] to-[#209CBB] text-white rounded-lg font-bold shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {renewingPlan ? "Processing..." : "Renew / Change Plan"}
          </button>
        </div>
        <p className="mt-4 text-xs text-gray-500 italic">* Note: Plan changes take effect immediately and may update the expiry date.</p>
      </div>

      <div className="space-y-6">
        <DocumentSection
          title="Client Documents"
          docs={company.client_documents}
          fileRef={clientFileInputRef}
          onFileChange={(e) => handleFileChange(e, "client")}
          onDelete={(id) => deleteDocument("client", id)}
        />
        <DocumentSection
          title="Company Documents"
          docs={company.company_documents}
          fileRef={companyFileInputRef}
          onFileChange={(e) => handleFileChange(e, "company")}
          onDelete={(id) => deleteDocument("company", id)}
        />
      </div>
    </div>
  );
}

// --- Internal UI Components ---

const Field = ({ type = "text", title, value, onChange, loading }) => (
  <div>
    <p className="font-semibold mb-2">{title}</p>
    <input
      disabled={loading}
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full border border-gray-300 p-3 rounded-lg outline-none ${
        loading 
          ? "bg-white text-gray-900 cursor-default" 
          : "bg-[#1F9EBD0F] focus:border-[#1B6687]"
      }`}
      placeholder={"Enter " + title}
    />
  </div>
);

const Dropdown = ({ title, value, onChange, options, loading }) => {
  const styles = {
    control: (base) => ({
      ...base,
      minHeight: "48px",
      borderRadius: "0.5rem",
      backgroundColor: loading ? "#F9FAFB" : "#1F9EBD0F",
      border: "1px solid #D1D5DB",
    }),
  };
  return (
    <div>
      <p className="font-semibold mb-2">{title}</p>
      <Select isDisabled={loading} styles={styles} options={options} value={value} onChange={onChange} />
    </div>
  );
};

const DocumentSection = ({ title, docs, onDelete, fileRef, onFileChange }) => (
  <div className="w-full rounded-xl p-6 border border-gray-200 shadow-sm bg-white">
    <div className="flex justify-between items-center mb-6 border-b pb-2">
      <p className="font-bold">{title}</p>

      {/* Label wraps the icon and hidden input */}
      <label className="text-blue-600 cursor-pointer">
        <LuFilePlus2 size={25} />
        <input ref={fileRef} type="file" hidden onChange={onFileChange} />
      </label>
    </div>

    <div className="flex gap-4 overflow-x-auto pb-2">
      {docs?.length === 0 && <p className="text-sm text-gray-400">No documents uploaded.</p>}
      {docs?.map((doc) => (
        <div
          key={doc.document_id}
          className="min-w-[150px] p-4 border rounded-xl flex flex-col items-center relative group bg-gray-50"
        >
          <IoIosClose
            size={24}
            className="absolute top-1 right-1 text-red-500 cursor-pointer opacity-0 group-hover:opacity-100"
            onClick={() => onDelete(doc.document_id)}
          />
          <FaFile size={40} className="text-gray-400 mb-2" />
          <p className="text-xs font-medium text-center truncate w-full">{doc.title}</p>
        </div>
      ))}
    </div>
  </div>
);


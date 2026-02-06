"use client";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { useState } from "react";

export default function DashboardLayout({ children }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <AuthGuard>
      <div className="w-screen h-screen flex">
        <div
          className={`h-screen ${
            isExpanded ? "w-65" : "w-20"
          } transition-all ease-in-out`}
        >
          <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
        </div>
        <div className="w-[calc(100%-260px)] flex-1 flex flex-col">
          <div className="w-full h-20 bg-white border-b border-gray-200"></div>
          <div className="w-full flex-1 bg-gray-50 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

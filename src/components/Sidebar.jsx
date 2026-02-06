"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isExpanded, setIsExpanded }) {
  const Tab = ({ href, title, icon, exact = false }) => {
    const path = usePathname();
    const onPath = exact ? path === href : path.startsWith(href);
    return (
      <Link
        onClick={(e) => {
          if (path === href) e.preventDefault();
        }}
        href={href}
        className={`flex place-items-center p-2 px-4 rounded-xl ${
          !isExpanded && "rounded-r-none"
        } gap-1 ${
          onPath && "bg-linear-to-r from-[#1B6687] to-[#209CBB] text-white"
        }`}
      >
        <div
          className={`w-8 h-8 flex place-items-center ${onPath && "invert"}`}
        >
          {icon}
        </div>
        {isExpanded && <p className="flex-1">{title}</p>}
      </Link>
    );
  };
  return (
    <div
      className={`${
        isExpanded ? "w-65" : "w-20"
      } h-screen border-r border-gray-300 flex flex-col gap-8 shadow-lg relative transition-all ease-in-out bg-gray-50`}
    >
      <div
        className="absolute -right-4 top-5 h-8 w-8 bg-white border border-gray-200 rounded-full flex place-items-center justify-center cursor-pointer shadow"
        onClick={() => setIsExpanded((old) => !old)}
      >
        <img
          src="/logos/expand.svg"
          className={`h-2.5 ${
            !isExpanded && "rotate-180"
          } transition-all ease-in-out`}
        />
      </div>
      <div className="h-20 w-full border-b border-gray-200 flex place-items-center justify-center bg-white">
        <img src="/logos/logo.jpg" alt="" />
      </div>
      <div
        className={`flex flex-col ${
          isExpanded ? "px-5" : "pl-4"
        } gap-8 text-gray-800 font-semibold overflow-hidden`}
      >
        <Tab
          href="/dashboard"
          title="Dashboard"
          icon={<img src="/logos/home.svg" />}
          exact
        />
        <Tab
          href="/dashboard/companies"
          title="Companies"
          icon={<img src="/logos/companies.svg" className="scale-105" />}
        />
        {/* <Tab
          href="/dashboard/users"
          title="Users"
          icon={<img src="/logos/users.svg" />}
        /> */}
        <Tab
          href="/dashboard/system-logs"
          title="System Logs"
          icon={<img src="/logos/logs.svg" />}
        />
        <Tab
          href="/dashboard/templates"
          title="Templates"
          icon={<img src="/logos/docs.svg" />}
        />
        <Tab
          href="/dashboard/plans"
          title="Subscription Management"
          icon={<img src="/logos/plans.svg" />}
        />
        <Tab
          href="/dashboard/notifications"
          title="Notification Center"
          icon={<img src="/logos/notifications.svg" />}
        />
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getBearerToken } from "@/util";

export default function AuthGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getBearerToken();
      console.log("========================");
      console.log(token);
      console.log("========================");
      if (!token) {
        return router.push("/login");
      }
    };
    checkAuth();
  }, []);

  return children;
}

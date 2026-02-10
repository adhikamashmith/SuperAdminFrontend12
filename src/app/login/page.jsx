"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  
  const router = useRouter();

  // <-- Add this here
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      // User is already logged in, redirect to dashboard
      router.replace("/dashboard");
    }
  }, []);
  const [payload, setPayload] = useState({
    email: "",
    password: "",
  });
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  // const router = useRouter();

  const login = async (e) => {
    e.preventDefault();
    setInvalid(false);
    
    if (!payload.email || !payload.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      // 1. Fixed URL concatenation
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/$/, "");
      const loginUrl = `${baseUrl}/user/login`;

      const response = await axios.post(
        loginUrl,
        payload,
        {
          // 2. CRUCIAL: This must be true to match your FastAPI/AWS CORS settings
          // withCredentials: true, 
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const { access_token, id_token, refresh_token } = response.data;

      // 3. Set Cookies
      document.cookie = `access_token=${access_token}; path=/; max-age=${60 * 60}; SameSite=Lax`;
      document.cookie = `refresh_token=${refresh_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

      // 4. Set LocalStorage
      localStorage.setItem("access_token", access_token);
      
      // Decode JWT Payload safely
      const idPayload = JSON.parse(atob(id_token.split(".")[1]));
      localStorage.setItem(
        "user",
        JSON.stringify({
          email: idPayload.email,
          sub: idPayload.sub,
        })
      );

      return router.push("/dashboard");
    } catch (error) {
      // 5. Better Error Logging
      console.log(error,"line 66");
      console.error("Login Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setInvalid(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex place-items-center justify-center bg-cyan-700">
      <div className="w-full max-w-130 h-130 bg-white border-2 border-[#ead9e4] rounded-4xl shadow-lg p-8 text-gray-800">
        <div className="w-full h-1/3 space-y-3 flex flex-col place-items-center justify-center">
          <p className="text-2xl font-semibold">Sign in to your Account</p>
          <p className="text-sm">Enter your email and password to login</p>
        </div>
        <form onSubmit={login} className="h-2/3 space-y-4">
          <div>
            <p className="text-xl text-gray-400">Email</p>
            <input
              type="email"
              value={payload.email}
              autoComplete="email"
              onChange={(e) => {
                setInvalid(false);
                setPayload((old) => ({ ...old, email: e.target.value }));
              }}
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-gray-500"
              placeholder="Enter E-Mail"
            />
          </div>
          <div>
            <p className="text-xl text-gray-400">Password</p>
            <input
              type="password"
              value={payload.password}
              autoComplete="current-password"
              onChange={(e) => {
                setInvalid(false);
                setPayload((old) => ({ ...old, password: e.target.value }));
              }}
              className="w-full border border-gray-300 p-3 rounded-lg outline-none focus:border-gray-500"
              placeholder="Enter Password"
            />
            {invalid && (
              <p className="text-red-500 text-sm mt-2 font-medium">Invalid credentials or connection error</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !payload.email || !payload.password}
            className={`w-full border border-gray-200 bg-linear-to-r ${
              loading || !payload.email || !payload.password
                ? "bg-gray-300 cursor-not-allowed"
                : "from-[#1B6687] to-[#209CBB] hover:opacity-90 transition-opacity"
            } text-white text-xl p-4 rounded-lg font-bold`}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
// import { cookies, headers } from "next/headers";
// import axios from "axios";
// import { redirect } from "next/navigation";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata = {
//   title: "Sail Mind Super Admin",
//   description: "Sail Mind Super Admin",
// };

// const getPath = async () => {
//   const headersList = await headers();
//   return headersList.get("x-pathname");
// };

// // const isUserLoggedIn = async () => {
// //   const cookieStore = await cookies();
// //   if (!cookieStore.has("access_token")) return false;
// //   const accessToken = cookieStore.get("access_token").value;
// //   try {
// //     const response = await axios.get(
// //       `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/is-logged-in`,
// //       {
// //         headers: {
// //           Authorization: `Bearer ${accessToken}`,
// //         },
// //       }
// //     );

// //     return true;
// //   } catch (error) {
// //     return false;
// //   }
// // };

// const isUserLoggedIn = async () => {
//   const cookieStore = await cookies();

//   const accessToken = cookieStore.get("access_token")?.value;
//   const refreshToken = cookieStore.get("refresh_token")?.value;

//   // No tokens at all → logged out
//   if (!accessToken && !refreshToken) {
//     return false;
//   }

//   // 1️⃣ Try with access token first
//   if (accessToken) {
//     try {
//       await axios.get(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/is-logged-in`,
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
//       return true;
//     } catch {
//       // fall through to refresh
//     }
//   }

//   // 2️⃣ Try refresh if refresh token exists
//   if (refreshToken) {
//     try {
//       const response = await axios.post(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/user/refresh`,
//         {},
//         {
//           headers: {
//             Cookie: `refresh_token=${refreshToken}`,
//           },
//         }
//       );
//       const cookieStore = await cookies();
//       cookieStore.set("access_token", response.data.access_token, {
//         maxAge: 3600,
//         secure: true,
//         sameSite: "none",
//         path: "/",
//       });

//       // IMPORTANT:
//       // Backend sets new access_token cookie
//       return true;
//     } catch {
//       return false;
//     }
//   }

//   return false;
// };

// export default async function RootLayout({ children }) {
//   const path = await getPath();
//   const isLoggedIn = await isUserLoggedIn();

//   if (path.startsWith("/login") && isLoggedIn) {
//     return redirect("/");
//   }

//   if (!path.startsWith("/login") && !isLoggedIn) {
//     return redirect("/login");
//   }

//   return (
//     <html lang="en">
//       <body
//         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
//       >
//         {children}
//       </body>
//     </html>
//   );
// }

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sail Mind Super Admin",
  description: "Sail Mind Super Admin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

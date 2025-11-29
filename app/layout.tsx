// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ReduxProvider from "@/redux/ReduxProvider";
import AuthInitializer from "@/redux/AuthInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RamChay - Thực phẩm chay sạch",
  description: "Cửa hàng thực phẩm chay uy tín",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${inter.className} bg-cream-light text-gray-800 antialiased flex flex-col min-h-screen`}
      >
        <ReduxProvider>
          <AuthInitializer>
            <main className="grow">{children}</main>
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}

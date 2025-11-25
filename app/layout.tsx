// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
        {/* Header luôn nằm trên cùng */}
        <Header />

        {/* Nội dung chính của từng trang sẽ nằm ở đây */}
        {/* flex-grow giúp đẩy Footer xuống dưới cùng kể cả khi nội dung ngắn */}
        <main className="grow">{children}</main>

        {/* Footer luôn nằm dưới cùng */}
        <Footer />
      </body>
    </html>
  );
}

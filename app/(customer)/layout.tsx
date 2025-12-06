// app/layout.tsx
import "../globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Header luôn nằm trên cùng */}
      <Header />

      {/* Nội dung chính của từng trang sẽ nằm ở đây */}
      {children}

      {/* Footer luôn nằm dưới cùng */}
      <Footer />
    </>
  );
}

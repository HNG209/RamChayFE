// app/layout.tsx
import "../globals.css";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
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

// redux/AuthInitializer.tsx
"use client";

import { useGetMyProfileQuery } from "./services/authApi";

export default function AuthInitializer({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gọi API lấy user ngay khi web load
  // Vì dùng HttpOnly Cookie, trình duyệt tự gửi cookie đi, không cần truyền gì cả
  const { isLoading, isError } = useGetMyProfileQuery();

  //   if (isLoading) return <div>Đang tải dữ liệu...</div>;

  return <>{children}</>;
}

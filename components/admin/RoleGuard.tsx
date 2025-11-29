// components/admin/RoleGuard.tsx
"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { MyProfile } from "@/types/backend";
import Forbidden from "./Forbidden";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as MyProfile | null;

  // Trong lúc đợi check user hoặc redirect login -> Không hiện gì cả (hoặc hiện Loading Spinner)
  if (!user) return <Forbidden />;

  // 2. LOGIC HIỂN THỊ MỚI:
  const hasPermission = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasPermission) {
    // Thay vì alert, trả về giao diện Forbidden
    return <Forbidden />;
  }

  // Nếu ok hết thì hiển thị nội dung trang
  return <>{children}</>;
}

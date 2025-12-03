// components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingBag,
  LogOut,
  ChevronRight, // Thêm icon này để trang trí
} from "lucide-react";
import { useSelector } from "react-redux";
import { useLogoutMutation } from "@/redux/services/authApi";
import { useRouter } from "next/navigation";
import { RootState } from "@/redux/store";
import { MyProfile } from "@/types/backend";
import Image from "next/image";

const ADMIN_MENU = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    allowedRoles: ["ROLE_ADMIN", "ROLE_MANAGER"],
  },
  {
    label: "Sản phẩm",
    href: "/admin/products",
    icon: Package,
    allowedRoles: ["ROLE_MANAGER", "ROLE_ADMIN"],
  },
  {
    label: "Đơn hàng",
    href: "/admin/orders",
    icon: ShoppingBag,
    allowedRoles: ["ROLE_MANAGER"],
  },
  {
    label: "Nhân sự",
    href: "/admin/managers",
    icon: Users,
    allowedRoles: ["ROLE_ADMIN"],
  },
  {
    label: "Quyền hạn",
    href: "/admin/roles",
    icon: Users,
    allowedRoles: ["ROLE_ADMIN"],
  }
];

const AdminAvatar = ({ fullName }: { fullName?: string }) => {
  const letter = fullName ? fullName.charAt(0).toUpperCase() : "A";
  return (
    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-lime-400 to-lime-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shrink-0">
      {letter}
    </div>
  );
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as MyProfile | null;

  // Trả về true nếu user có ít nhất 1 role khớp với allowedRoles của menu
  const hasPermission = (allowedRoles: string[]) => {
    if (!user || !user.roles) return false;
    return user.roles.some((userRole) => allowedRoles.includes(userRole));
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      router.push("/admin/login");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] text-white border-r border-gray-800">
      {/* 1. HEADER MỚI: HIỂN THỊ PROFILE THAY VÌ LOGO */}
      <div className="h-20 flex items-center px-6 border-b border-gray-800 bg-[#0f1523]">
        {user && !user.roles.includes("ROLE_CUSTOMER") ? (
          <div className="flex items-center gap-3 w-full group cursor-pointer">
            {/* Avatar */}
            <AdminAvatar fullName={user.fullName} />

            {/* Tên & Role */}
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-white truncate group-hover:text-lime-primary transition-colors">
                {user.fullName}
              </h2>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-gray-400 truncate">Administrator</p>
              </div>
            </div>

            {/* Icon nhỏ trang trí */}
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-lime-primary transition-colors" />
          </div>
        ) : (
          // Fallback nếu chưa load được user
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="RamChay Logo"
              width={150}
              height={50}
              quality={100}
              priority={true}
              className="h-10 w-auto object-contain"
            />
          </Link>
        )}
      </div>

      {/* 2. MENU NAVIGATION */}
      <nav className="flex-1 py-6 space-y-1 px-4">
        <p className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Quản lý chung
        </p>
        {ADMIN_MENU.map((item) => {
          if (!hasPermission(item.allowedRoles)) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? "bg-lime-primary/10 text-lime-400 font-semibold shadow-[0_0_15px_rgba(163,230,53,0.1)]"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <item.icon
                className={`w-5 h-5 transition-colors ${isActive ? "text-lime-400" : "group-hover:text-white"
                  }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* 3. FOOTER: CHỈ CÒN NÚT LOGOUT */}
      <div className="p-4 border-t border-gray-800 bg-[#0f1523]">
        <button
          onClick={handleLogout}
          className="group flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

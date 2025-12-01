"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabNav() {
    const pathname = usePathname() || "";

    const isActive = (p: string) => pathname === p;

    return (
        <div className="flex items-center gap-3">
            <Link
                href="/admin/products/manage"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/products/manage") ? "bg-lime-primary text-white" : "bg-gray-100 text-gray-700"
                    }`}
            >
                Quản lý sản phẩm
            </Link>

            <Link
                href="/admin/products/add"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive("/admin/products/add") ? "bg-lime-primary text-white" : "bg-gray-100 text-gray-700"
                    }`}
            >
                Thêm sản phẩm
            </Link>
        </div>
    );
}

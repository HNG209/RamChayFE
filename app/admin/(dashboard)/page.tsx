"use client";

import { RootState } from "@/redux/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import RoleGuard from "@/components/admin/RoleGuard";

export default function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (user?.roles.includes("ROLE_CUSTOMER")) router.push("/");
    // if (!user) router.push("/admin/login");
  }, [user]);

  return (
    <div className="space-y-6">
      {/* 1. HEADER: Tiêu đề trang */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Tổng quan kinh doanh
        </h1>
        <p className="text-gray-500 text-sm">
          Chào mừng trở lại! Đây là tình hình hôm nay của RamChay.
        </p>
      </div>

      {/* 2. STAT CARDS: Số liệu thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu hôm nay"
          value="2.450.000đ"
          change="+12%"
          isPositive={true}
          icon={DollarSign}
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Đơn hàng mới"
          value="15"
          change="-2%"
          isPositive={false}
          icon={ShoppingBag}
          color="bg-yellow-50 text-yellow-600"
        />
        <StatCard
          title="Khách hàng mới"
          value="8"
          change="+5%"
          isPositive={true}
          icon={Users}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Sắp hết hàng"
          value="3"
          note="Cần nhập thêm"
          icon={Package}
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* 3. MAIN SECTION: Chia 2 cột (Biểu đồ + Đơn hàng mới) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (Chiếm 2 phần): Danh sách đơn hàng mới nhất */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Đơn hàng vừa đặt</h3>
            <button className="text-sm text-lime-primary hover:underline">
              Xem tất cả
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
                <tr>
                  <th className="p-3">Mã đơn</th>
                  <th className="p-3">Khách hàng</th>
                  <th className="p-3">Tổng tiền</th>
                  <th className="p-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {/* Dữ liệu giả lập */}
                <OrderItem
                  id="#ORD-001"
                  user="Nguyễn Văn A"
                  total="150.000đ"
                  status="pending"
                />
                <OrderItem
                  id="#ORD-002"
                  user="Trần Thị B"
                  total="320.000đ"
                  status="shipping"
                />
                <OrderItem
                  id="#ORD-003"
                  user="Lê Văn C"
                  total="90.000đ"
                  status="success"
                />
                <OrderItem
                  id="#ORD-004"
                  user="Phạm Văn D"
                  total="500.000đ"
                  status="cancelled"
                />
                <OrderItem
                  id="#ORD-005"
                  user="Hoàng Thùy E"
                  total="210.000đ"
                  status="pending"
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* CỘT PHẢI (Chiếm 1 phần): Sản phẩm bán chạy / Cảnh báo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          {/* Top sản phẩm */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Top bán chạy 🔥</h3>
            <ul className="space-y-4">
              <TopProduct name="Chả lụa chay" sold={120} price="45.000đ" />
              <TopProduct name="Sườn non chay" sold={85} price="30.000đ" />
              <TopProduct name="Nấm đông cô" sold={60} price="120.000đ" />
            </ul>
          </div>

          <div className="border-t pt-4"></div>

          {/* Cảnh báo kho */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">Cảnh báo kho ⚠️</h3>
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm p-3 bg-red-50 text-red-700 rounded-lg">
                <span>Hạt nêm nấm</span>
                <span className="font-bold">Còn 2</span>
              </li>
              <li className="flex justify-between items-center text-sm p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                <span>Tàu hũ ky</span>
                <span className="font-bold">Còn 5</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CÁC COMPONENT CON (Viết chung file cho gọn, sau này có thể tách ra) ---

function StatCard({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  color,
  note,
}: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        {note ? (
          <span className="text-gray-500">{note}</span>
        ) : (
          <>
            <span
              className={`flex items-center font-medium ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {change}
            </span>
            <span className="text-gray-400 ml-2">so với hôm qua</span>
          </>
        )}
      </div>
    </div>
  );
}

function OrderItem({ id, user, total, status }: any) {
  const statusStyles: any = {
    pending: {
      label: "Chờ duyệt",
      color: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    shipping: {
      label: "Đang giao",
      color: "bg-blue-100 text-blue-700",
      icon: Package,
    },
    success: {
      label: "Hoàn thành",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    cancelled: {
      label: "Đã hủy",
      color: "bg-red-100 text-red-700",
      icon: XCircle,
    },
  };

  const currentStatus = statusStyles[status];
  const StatusIcon = currentStatus.icon;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="p-3 font-medium text-lime-primary">{id}</td>
      <td className="p-3 font-semibold text-gray-700">{user}</td>
      <td className="p-3 font-bold text-gray-800">{total}</td>
      <td className="p-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${currentStatus.color}`}
        >
          <StatusIcon className="w-3 h-3 mr-1" />
          {currentStatus.label}
        </span>
      </td>
    </tr>
  );
}

function TopProduct({ name, sold, price }: any) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
          <Package className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{name}</p>
          <p className="text-xs text-gray-500">Đã bán: {sold}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-lime-primary">{price}</span>
    </div>
  );
}

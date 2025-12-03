"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { ChevronLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreateManagerMutation } from "@/redux/services/managerApi"
import { useGetRoleQuery } from "@/redux/services/roleApi"

// Định nghĩa kiểu dữ liệu cho Role
type Role = {
  id: number;
  name: string;
}

export default function AddManagerPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [createManager, { isLoading }] = useCreateManagerMutation()

  // 1. Lấy dữ liệu Role từ API
  const { data: roles, isLoading: isRolesLoading, isError: isRolesError } = useGetRoleQuery()

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    status: "Active",
    // Sử dụng mảng để lưu các ID Role đã chọn
    selectedRoleIds: [] as number[],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    // Hàm này chỉ xử lý các trường input/select KHÔNG phải là Role
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // =======================================================
  // LOGIC XỬ LÝ ROLE (MULTI-SELECT SIMULATION)
  // =======================================================

  // Hàm thêm Role vào danh sách đã chọn
  const handleAddRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoleId = Number(e.target.value);

    if (newRoleId && !formData.selectedRoleIds.includes(newRoleId)) {
      setFormData((prev) => ({
        ...prev,
        selectedRoleIds: [...prev.selectedRoleIds, newRoleId],
      }));
    }
    // Thiết lập lại giá trị mặc định của select để người dùng dễ chọn Role khác
    e.target.value = '';
  };

  // Hàm xóa Role khỏi danh sách đã chọn
  const handleRemoveRole = (roleIdToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoleIds: prev.selectedRoleIds.filter(
        (id) => id !== roleIdToRemove
      ),
    }));
  };

  // Danh sách Role có sẵn (chưa được chọn)
  const availableRoles = roles?.filter(
    (role: Role) => !formData.selectedRoleIds.includes(role.id)
  );
  // Danh sách Role đã chọn (dùng để hiển thị pill)
  const selectedRoles = roles?.filter(
    (role: Role) => formData.selectedRoleIds.includes(role.id)
  );
  // =======================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Kiểm tra xem đã chọn ít nhất một Role nào chưa
    if (formData.selectedRoleIds.length === 0) {
      alert("Vui lòng chọn ít nhất một Quyền (Role) cho quản lý.");
      return;
    }

    try {
      // Chuẩn bị dữ liệu gửi đi
      const managerData = {
        username: formData.username,
        fullName: formData.fullName,
        password: formData.password,
        roles: formData.selectedRoleIds,
        active: formData.status === "Active" ? 1 : 0
      }

      await createManager(managerData).unwrap()
      router.push("/admin/managers")
    } catch (error: any) {
      console.error("Create manager error:", error)
      alert(`Lỗi: ${error.data?.message || error.message || "Không thể tạo tài khoản quản lý."}`)
    }
  }

  // Hiển thị trạng thái tải Roles
  if (isRolesLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 size={32} className="animate-spin text-[#5AB66B]" />
        <p className="ml-2">Đang tải dữ liệu quyền...</p>
      </main>
    )
  }

  // Hiển thị lỗi tải Roles hoặc không có Role nào
  if (isRolesError || !roles || roles.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-red-500">
          {isRolesError ? '❌ Đã xảy ra lỗi khi tải danh sách Quyền.' : '⚠️ Không tìm thấy Quyền nào để phân công.'}
        </p>
      </main>
    )
  }


  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.push("/admin/managers")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Thêm mới Người dùng</h1>
            <p className="text-sm text-muted-foreground">Tạo một tài khoản quản lý mới trong hệ thống</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-lg border border-[#e0e8df]/50 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Full Name (giữ nguyên) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
                required
              />
            </div>

            {/* Username (giữ nguyên) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
                required
              />
            </div>

            {/* Password (giữ nguyên) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* TRƯỜNG ROLE MỚI (DROP-DOWN + TAGS) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Quyền (Role)</label>

              {/* Dropdown để chọn Role */}
              <select
                name="roleSelector" // Dùng tên tạm khác để không xung đột với handleChange
                onChange={handleAddRole} // Dùng hàm mới để thêm Role
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
                disabled={isRolesLoading}
                value={''} // Bắt buộc đặt value rỗng để select reset sau khi chọn
              >
                <option value="" disabled>
                  Chọn Quyền để thêm
                </option>

                {/* Chỉ hiển thị các Role CHƯA được chọn */}
                {availableRoles?.map((role: Role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>

              {/* Khu vực hiển thị Pill/Tag của các Role đã chọn */}
              <div className="mt-3 flex flex-wrap gap-2 min-h-[36px]">
                {selectedRoles?.map((role: Role) => (
                  <div
                    key={role.id}
                    className="flex items-center bg-[#5AB66B] text-white text-sm font-medium py-1.5 px-3 rounded-full"
                  >
                    {role.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id)}
                      className="ml-2 hover:opacity-80 transition-opacity"
                    >
                      <span className="font-bold text-xs">x</span>
                    </button>
                  </div>
                ))}
                {/* Hiển thị thông báo nếu chưa chọn Role nào */}
                {formData.selectedRoleIds.length === 0 && (
                  <p className="text-sm text-red-500 italic mt-1">
                    * Phải chọn ít nhất một Quyền.
                  </p>
                )}
              </div>
            </div>

            {/* Status (giữ nguyên) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>

            {/* Action Buttons (Cập nhật disabled) */}
            <div className="flex gap-3 pt-6 border-t border-[#e0e8df]">
              <button
                type="button"
                onClick={() => router.push("/admin/managers")}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-[#e0e8df] rounded-lg text-foreground hover:bg-[#f0f9eb] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                // Disabled nếu đang tải, không có Roles, hoặc chưa chọn Role nào
                disabled={isLoading || isRolesLoading || formData.selectedRoleIds.length === 0}
                className="flex-1 px-4 py-2.5 bg-[#5AB66B] hover:bg-[#4a9c5a] text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
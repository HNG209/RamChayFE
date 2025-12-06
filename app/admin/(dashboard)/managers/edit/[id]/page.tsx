"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { ChevronLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
// DÙNG CÁC IMPORT GỐC CỦA BẠN TỪ REDUX TOOLKIT QUERY
import {
  useGetManagerByIdQuery,
  useUpdateManagerMutation,
} from "@/redux/services/managerApi";
import { useGetRoleQuery } from "@/redux/services/roleApi";


// Định nghĩa kiểu dữ liệu cho Role
type Role = {
  id: number;
  name: string;
}

// Kiểu dữ liệu cho Manager từ API (giả định)
type ManagerData = {
  id: number;
  username: string;
  fullName: string;
  active: number;
  // Giả định API trả về mảng object Role
  roles: Role[];
};


export default function EditManagerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  // 1. Lấy dữ liệu Quản lý hiện tại
  const { data, isLoading } = useGetManagerByIdQuery(id);
  const managerData = data as ManagerData | undefined;

  // 2. Lấy danh sách Roles
  const { data: roles, isLoading: isRolesLoading, isError: isRolesError } = useGetRoleQuery();

  const [updateManager, { isLoading: isUpdating }] = useUpdateManagerMutation();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    status: "Active",
    selectedRoleIds: [] as number[], // Thêm trạng thái cho Role IDs
  });

  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State để hiển thị thông báo lỗi

  // Khởi tạo dữ liệu khi Manager Data được tải
  useEffect(() => {
    if (managerData) {
      // Trích xuất ID từ mảng Role object
      const initialRoleIds = managerData.roles?.map((role) => role.id) || [];

      setFormData({
        username: managerData.username ?? "",
        fullName: managerData.fullName ?? "",
        status: managerData.active ? "Active" : "Inactive",
        selectedRoleIds: initialRoleIds, // Thiết lập Role ID ban đầu
      });
    }
  }, [managerData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // Xóa lỗi khi người dùng bắt đầu thay đổi form
    setErrorMessage(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // Xóa lỗi khi người dùng bắt đầu thay đổi form
    setErrorMessage(null);
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };


  // Hàm thêm Role vào danh sách đã chọn
  const handleAddRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setErrorMessage(null);
    const newRoleId = Number(e.target.value);

    if (newRoleId && !formData.selectedRoleIds.includes(newRoleId)) {
      setFormData((prev) => ({
        ...prev,
        selectedRoleIds: [...prev.selectedRoleIds, newRoleId],
      }));
    }
    e.target.value = '';
  };

  // Hàm xóa Role khỏi danh sách đã chọn
  const handleRemoveRole = (roleIdToRemove: number) => {
    setErrorMessage(null);
    setFormData((prev) => ({
      ...prev,
      selectedRoleIds: prev.selectedRoleIds.filter(
        (id) => id !== roleIdToRemove
      ),
    }));
  };

  // Danh sách Role có sẵn (chưa được chọn)
  // Phải đảm bảo `roles` tồn tại trước khi dùng filter
  const availableRoles = (roles as Role[] | undefined)?.filter(
    (role: Role) => !formData.selectedRoleIds.includes(role.id)
  );
  // Danh sách Role đã chọn (dùng để hiển thị pill)
  const selectedRoles = (roles as Role[] | undefined)?.filter(
    (role: Role) => formData.selectedRoleIds.includes(role.id)
  );
  // =======================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null); // Reset lỗi trước khi submit

    // Kiểm tra xem đã chọn ít nhất một Role nào chưa
    if (formData.selectedRoleIds.length === 0) {
      setErrorMessage("Vui lòng chọn ít nhất một Quyền (Role) cho quản lý.");
      return;
    }

    if (
      changePassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      setErrorMessage("Mật khẩu xác nhận không khớp!");
      return;
    }

    // === FIX LỖI BACKEND: CHUYỂN MẢNG ID SANG MẢNG OBJECT TỐI THIỂU ===
    // Backend yêu cầu mảng object Role, không phải mảng ID
    const rolesPayload = formData.selectedRoleIds.map(roleId => ({ id: roleId }));

    const payload: any = {
      username: formData.username,
      fullName: formData.fullName,
      active: formData.status === "Active" ? 1 : 0,
      // GỬI MẢNG OBJECT ROLE VỚI CHỈ TRƯỜNG ID
      roles: rolesPayload, // <--- ĐÃ FIX LỖI Cannot construct instance of `iuh.fit.se.entities.Role`
    };

    if (changePassword && passwordData.newPassword.trim() !== "") {
      payload.password = passwordData.newPassword.trim();
    }

    console.log("Payload sent:", payload);

    try {
      // Dùng unwrap để bắt lỗi từ API response
      await updateManager({ id, body: payload }).unwrap();
      router.push("/admin/managers");
    } catch (err: any) {
      console.error("Lỗi cập nhật:", err);
      // Cố gắng trích xuất lỗi cụ thể từ Backend
      const errorMsg = err.data?.message || err.error || "Cập nhật thất bại! Vui lòng kiểm tra console để xem chi tiết lỗi từ Backend.";
      setErrorMessage(errorMsg);
    }
  };

  // Hiển thị trạng thái tải Manager Data hoặc Roles
  if (isLoading || isRolesLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 size={32} className="animate-spin text-[#5AB66B]" />
        <p className="ml-2">Đang tải dữ liệu quản lý và quyền...</p>
      </main>
    );
  }

  // Hiển thị lỗi nếu không tải được Manager Data hoặc Roles
  if (isRolesError || !roles || roles.length === 0 || !managerData) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-red-500">
          {isRolesError ? '❌ Đã xảy ra lỗi khi tải danh sách Quyền.' :
            !managerData ? '❌ Không tìm thấy thông tin quản lý.' :
              '⚠️ Không tìm thấy Quyền nào để phân công.'}
        </p>
      </main>
    )
  }


  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/managers")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Chỉnh sửa Quản lý</h1>
            <p className="text-sm text-muted-foreground">Cập nhật thông tin quản lý</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-[#e0e8df]/50 shadow-sm p-8">

          {/* HIỂN THỊ THÔNG BÁO LỖI */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <span className="font-bold">Lỗi: </span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Tên đăng nhập */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Tên đăng nhập
              </label>
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

            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Họ và tên
              </label>
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

            {/* TRƯỜNG ROLE MỚI (DROP-DOWN + TAGS) */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Quyền (Role)</label>

              {/* Dropdown để chọn Role */}
              <select
                name="roleSelector"
                onChange={handleAddRole}
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
                disabled={isRolesLoading || isUpdating}
                value={''}
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
                      disabled={isUpdating}
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

            {/* Trạng thái */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                Trạng thái
              </label>
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

            {/* PASSWORD */}
            <div className="border-t border-[#e0e8df] pt-6">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    // Reset password fields if checkbox is unchecked
                    if (!e.target.checked) {
                      setPasswordData({ newPassword: "", confirmPassword: "" });
                    }
                  }}
                  className="w-4 h-4 text-[#5AB66B] focus:ring-[#5AB66B]"
                />
                <span className="text-sm font-semibold">
                  Thay đổi mật khẩu
                </span>
              </label>

              {changePassword && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Nhập mật khẩu mới"
                        className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Xác nhận mật khẩu mới"
                        className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-[#e0e8df]">
              <button
                type="button"
                onClick={() => router.push("/admin/managers")}
                disabled={isUpdating}
                className="flex-1 px-4 py-2.5 border border-[#e0e8df] rounded-lg text-foreground hover:bg-[#f0f9eb] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isUpdating || formData.selectedRoleIds.length === 0}
                className="flex-1 px-4 py-2.5 bg-[#5AB66B] hover:bg-[#4a9c5a] text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Lưu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
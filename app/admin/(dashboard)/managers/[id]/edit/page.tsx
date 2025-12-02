"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { ChevronLeft, Save, Eye, EyeOff } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetManagerByIdQuery,
  useUpdateManagerMutation,
} from "@/redux/services/managerApi";

export default function EditManagerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useGetManagerByIdQuery(id);
  const [updateManager] = useUpdateManagerMutation();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    status: "Active",
  });

  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData({
        username: data.username ?? "",
        fullName: data.fullName ?? "",
        status: data.active ? "Active" : "Inactive",
      });
    }
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      changePassword &&
      passwordData.newPassword !== passwordData.confirmPassword
    ) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    const payload: any = {
      username: formData.username,
      fullName: formData.fullName,
      active: formData.status === "Active" ? 1: 0,
    };

    if (changePassword && passwordData.newPassword.trim() !== "") {
      payload.password = passwordData.newPassword.trim();
    }

    console.log("Payload sent:", payload);

    try {
      await updateManager({ id, body: payload }).unwrap();
      alert("Cập nhật thành công!");
      router.push("/admin/managers");
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      alert("Cập nhật thất bại!");
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Đang tải...</p>
      </main>
    );
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
            <h1 className="text-4xl font-bold">Chỉnh sửa Quản lý</h1>
            <p className="text-muted-foreground">Cập nhật thông tin quản lý</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-[#e0e8df]/50 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#e0e8df] rounded-lg bg-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#e0e8df] rounded-lg bg-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-[#e0e8df] rounded-lg bg-input"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* PASSWORD */}
            <div className="border-t border-[#e0e8df] pt-6">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => setChangePassword(e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">
                  Thay đổi mật khẩu
                </span>
              </label>

              {changePassword && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-[#e0e8df] rounded-lg bg-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
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
                    <label className="block text-sm font-medium mb-2">
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full px-4 py-2 border border-[#e0e8df] rounded-lg bg-input"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2"
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

            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={() => router.push("/admin/managers")}
                className="flex-1 px-4 py-2 border border-[#e0e8df] rounded-lg"
              >
                Hủy
              </button>

              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-[#5AB66B] text-white rounded-lg flex items-center justify-center gap-2"
              >
                <Save size={18} /> Lưu
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

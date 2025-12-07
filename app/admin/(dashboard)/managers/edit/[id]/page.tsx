"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, Save, Eye, EyeOff, Loader2, X, Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  useGetManagerByIdQuery,
  useUpdateManagerMutation,
} from "@/redux/services/managerApi";
import { useGetRoleQuery } from "@/redux/services/roleApi";

// Định nghĩa kiểu dữ liệu cho Role
type Role = {
  id: number;
  name: string;
};

// Kiểu dữ liệu cho Manager từ API (giả định)
type ManagerData = {
  id: number;
  username: string;
  fullName: string;
  active: number;
  roles: Role[];
};

const RoleTag: React.FC<{ role: Role; onRemove: (id: number) => void }> = ({
  role,
  onRemove,
}) => (
  <span className="flex items-center text-xs px-2.5 py-1.5 rounded-full font-medium whitespace-nowrap bg-green-100 text-green-700 transition duration-150">
    {role.name}
    <X
      size={12}
      className="ml-2 cursor-pointer text-green-700 hover:text-green-900 transition"
      onClick={() => onRemove(role.id)}
    />
  </span>
);

export default function EditManagerPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useGetManagerByIdQuery(id);
  const managerData = data as ManagerData | undefined;

  const { data: roles, isLoading: isRolesLoading, isError: isRolesError } = useGetRoleQuery();

  const [updateManager, { isLoading: isUpdating }] = useUpdateManagerMutation();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    status: "Active",
    selectedRoleIds: [] as number[],
  });

  const [changePassword, setChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (managerData) {
      const initialRoleIds = managerData.roles?.map((role) => role.id) || [];
      setFormData({
        username: managerData.username ?? "",
        fullName: managerData.fullName ?? "",
        status: managerData.active ? "Active" : "Inactive",
        selectedRoleIds: initialRoleIds,
      });
    }
  }, [managerData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setErrorMessage(null);
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setErrorMessage(null);
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleRemoveRole = (roleIdToRemove: number) => {
    setErrorMessage(null);
    setFormData((prev) => ({
      ...prev,
      selectedRoleIds: prev.selectedRoleIds.filter(
        (id) => id !== roleIdToRemove
      ),
    }));
  };

  const availableRoles = (roles as Role[] | undefined)?.filter(
    (role: Role) => !formData.selectedRoleIds.includes(role.id)
  );
  const selectedRoles = (roles as Role[] | undefined)?.filter(
    (role: Role) => formData.selectedRoleIds.includes(role.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

    const rolesPayload = formData.selectedRoleIds.map(roleId => ({ id: roleId }));

    const payload: any = {
      username: formData.username,
      fullName: formData.fullName,
      active: formData.status === "Active" ? 1 : 0,
      roles: rolesPayload,
    };

    if (changePassword && passwordData.newPassword.trim() !== "") {
      payload.password = passwordData.newPassword.trim();
    }

    try {
      await updateManager({ id, body: payload }).unwrap();
      router.push("/admin/managers");
    } catch (err: any) {
      const errorMsg = err.data?.message || err.error || "Cập nhật thất bại! Vui lòng kiểm tra console để xem chi tiết lỗi từ Backend.";
      setErrorMessage(errorMsg);
    }
  };

  if (isLoading || isRolesLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="ml-3 text-lg text-gray-700">Đang tải thông tin Quản lý...</p>
      </main>
    );
  }

  if (isRolesError || !roles || roles.length === 0 || !managerData) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
        <p className="text-red-500">
          {isRolesError ? '❌ Đã xảy ra lỗi khi tải danh sách Quyền.' :
            !managerData ? '❌ Không tìm thấy thông tin quản lý.' :
              '⚠️ Không tìm thấy Quyền nào để phân công.'}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push("/admin/managers")}
            className="p-2 mr-4 text-gray-600 hover:bg-gray-200 rounded-full transition"
            aria-label="Quay lại"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Chỉnh sửa Quản lý</h1>
            <p className="text-md text-gray-500">
              Cập nhật tên, trạng thái và quyền cho quản lý <b>{managerData.fullName}</b>.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-2xl">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              <span className="font-bold">Lỗi: </span> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Tên đăng nhập */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                required
              />
            </div>

            {/* Họ và tên */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                required
              />
            </div>

            {/* Quyền (Roles) */}
            <div className="mb-8 p-6 border border-gray-300 rounded-xl bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <Plus size={20} className="text-green-600" /> Quyền (Roles)
                </label>
                <select
                  name="roleSelector"
                  onChange={handleAddRole}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-md shadow-green-600/30 text-sm disabled:bg-green-400"
                  disabled={isRolesLoading || isUpdating || !availableRoles?.length}
                  value={''}
                >
                  <option value="" disabled>
                    Thêm Quyền
                  </option>
                  {availableRoles?.map((role: Role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              <div
                className={`min-h-[48px] p-3 rounded-lg border ${selectedRoles && selectedRoles.length > 0 ? "border-gray-200" : "border-dashed border-gray-400"
                  } bg-white flex flex-wrap gap-2 content-start overflow-y-auto`}
              >
                {selectedRoles && selectedRoles.length > 0 ? (
                  selectedRoles.map((role) => (
                    <RoleTag key={role.id} role={role} onRemove={handleRemoveRole} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic m-auto">
                    Quản lý này chưa có quyền nào. Vui lòng thêm bằng nút "Thêm Quyền".
                  </p>
                )}
              </div>
            </div>

            {/* Trạng thái */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>

            {/* PASSWORD */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={changePassword}
                  onChange={(e) => {
                    setChangePassword(e.target.checked);
                    if (!e.target.checked) {
                      setPasswordData({ newPassword: "", confirmPassword: "" });
                    }
                  }}
                  className="w-4 h-4 text-green-600 focus:ring-green-600"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
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
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/admin/managers")}
                disabled={isUpdating}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isUpdating || formData.selectedRoleIds.length === 0}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md shadow-green-600/30 flex items-center disabled:bg-green-400"
              >
                {isUpdating && <Loader2 className="animate-spin mr-2" size={20} />}
                {isUpdating ? 'Đang lưu...' : (
                  <>
                    <Save size={18} className="mr-2" /> Lưu thay đổi
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
"use client";
import { useState } from "react";
import { ChevronLeft, Save, Eye, EyeOff, Loader2, Plus, X, ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCreateManagerMutation } from "@/redux/services/managerApi";
import { useGetRoleQuery } from "@/redux/services/roleApi";

// Định nghĩa kiểu dữ liệu cho Role
type Role = {
  id: number;
  name: string;
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

const RoleSelectionDropdown: React.FC<{
  allRoles: Role[];
  selectedRoles: Role[];
  onSelectRole: (r: Role) => void;
}> = ({ allRoles, selectedRoles, onSelectRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredRoles = allRoles
    .filter((r) => !selectedRoles.some((sr) => sr.id === r.id))
    .filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition shadow-md shadow-green-600/30 text-sm"
      >
        <Plus size={16} />
        Thêm Quyền
      </button>
      {isOpen && (
        <div className="absolute z-20 mt-2 w-64 origin-top-right rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto">
          <div className="py-1">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
              Chọn quyền để thêm
            </div>
            <input
              type="text"
              placeholder="Tìm quyền..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 mb-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
            />
            {filteredRoles.length > 0 ? (
              filteredRoles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    onSelectRole(r);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                >
                  {r.name}
                </button>
              ))
            ) : (
              <div className="py-3 px-4 text-sm text-gray-500 italic">
                Không tìm thấy quyền phù hợp.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function AddManagerPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [createManager, { isLoading }] = useCreateManagerMutation();

  // Lấy dữ liệu Role từ API
  const { data: roles, isLoading: isRolesLoading, isError: isRolesError } = useGetRoleQuery();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    status: "Active",
    selectedRoleIds: [] as number[],
  });

  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddRole = (role: Role) => {
    if (!formData.selectedRoleIds.includes(role.id)) {
      setFormData((prev) => ({
        ...prev,
        selectedRoleIds: [...prev.selectedRoleIds, role.id],
      }));
      setSelectedRoles((prev) => [...prev, role]);
    }
  };

  const handleRemoveRole = (roleIdToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoleIds: prev.selectedRoleIds.filter((id) => id !== roleIdToRemove),
    }));
    setSelectedRoles((prev) => prev.filter((r) => r.id !== roleIdToRemove));
  };

  // Danh sách Role có sẵn (chưa được chọn)
  const availableRoles = (roles as Role[] | undefined)?.filter(
    (role: Role) => !formData.selectedRoleIds.includes(role.id)
  ) ?? [];

  // Hiển thị trạng thái tải Roles
  if (isRolesLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <Loader2 size={32} className="animate-spin text-green-600" />
        <p className="ml-2">Đang tải dữ liệu quyền...</p>
      </main>
    );
  }

  // Hiển thị lỗi tải Roles hoặc không có Role nào
  if (isRolesError || !roles || roles.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <p className="text-red-500">
          {isRolesError ? '❌ Đã xảy ra lỗi khi tải danh sách Quyền.' : '⚠️ Không tìm thấy Quyền nào để phân công.'}
        </p>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.selectedRoleIds.length === 0) {
      alert("Vui lòng chọn ít nhất một Quyền (Role) cho quản lý.");
      return;
    }

    try {
      const managerData = {
        username: formData.username,
        fullName: formData.fullName,
        password: formData.password,
        roles: formData.selectedRoleIds,
        active: formData.status === "Active" ? 1 : 0,
      };

      await createManager(managerData).unwrap();
      router.push("/admin/managers");
    } catch (error: any) {
      console.error("Create manager error:", error);
      alert(`Lỗi: ${error.data?.message || error.message || "Không thể tạo tài khoản quản lý."}`);
    }
  };

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
            <h1 className="text-3xl font-extrabold text-gray-900">Thêm mới Người dùng</h1>
            <p className="text-md text-gray-500">Tạo một tài khoản quản lý mới trong hệ thống</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            {/* Họ và tên */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Họ và tên</label>
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

            {/* Tên đăng nhập */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
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

            {/* Mật khẩu */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Quyền (Roles) */}
            <div className="mb-8 p-6 border border-gray-300 rounded-xl bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <ListChecks size={20} className="text-green-600" /> Quyền (Roles)
                </label>
                <RoleSelectionDropdown
                  allRoles={roles as Role[]}
                  selectedRoles={selectedRoles}
                  onSelectRole={handleAddRole}
                />
              </div>
              <div
                className={`min-h-[100px] p-3 rounded-lg border ${selectedRoles.length > 0 ? "border-gray-200" : "border-dashed border-gray-400"
                  } bg-white flex flex-wrap gap-2 content-start overflow-y-auto`}
              >
                {selectedRoles.length > 0 ? (
                  selectedRoles.map((role) => (
                    <RoleTag key={role.id} role={role} onRemove={handleRemoveRole} />
                  ))
                ) : (
                  <p className="text-sm text-gray-400 italic m-auto">
                    Người dùng này chưa có quyền nào. Vui lòng thêm bằng nút "Thêm Quyền".
                  </p>
                )}
              </div>
            </div>

            {/* Trạng thái */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trạng thái</label>
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push("/admin/managers")}
                disabled={isLoading}
                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || isRolesLoading || formData.selectedRoleIds.length === 0}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md shadow-green-600/30 flex items-center disabled:bg-green-400"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" /> Lưu
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
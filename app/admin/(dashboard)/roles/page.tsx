"use client";
import { useState } from "react";
// Import các icons cần thiết
import { Plus, Loader2, Search, Pencil, Trash2 } from "lucide-react";
import { useGetAllRoleQuery, useDeleteRoleMutation } from "@/redux/services/roleApi";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

// --- Định nghĩa Types ---
type Permission = string;

type Role = {
    id: number;
    name: string;
    permissions: Array<{ id: number; name: string }>;
};

const getPermissionCategory = (permission: string): string =>
    permission.split("_").pop()?.toUpperCase() || "";

const PermissionTag: React.FC<{ permission: string }> = ({ permission }) => {

    const parts = permission.split("_");
    const category = getPermissionCategory(permission);

    const action = parts.slice(0, -1).join(" ").toLowerCase();

    const greenClasses = "bg-green-100 text-green-700";

    return (
        <span
            title={permission}
            className={`text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${greenClasses} transition duration-100`}
        >
            {`${action} ${category.toLowerCase()}`}
        </span>
    );
};

const DeleteConfirmModal = ({
    isOpen,
    role,
    onCancel,
    onConfirm,
    isDeleting,
}: {
    isOpen: boolean;
    role: Role | null;
    onCancel: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
}) => {
    if (!isOpen || !role) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">

                <h2 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa</h2>

                <p className="text-gray-700 mb-6">
                    Bạn có chắc muốn xóa <b>"{role.name}"</b>? Hành động này không thể hoàn tác.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                    >
                        Hủy
                    </button>

                    <button
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isDeleting && <Loader2 size={16} className="animate-spin" />}
                        Xóa
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
};
export default function RoleManagingPage() {
    const router = useRouter();
    // Lấy dữ liệu Role từ Redux RTK Query
    const { data: roles, isLoading, isError } = useGetAllRoleQuery();
    const [searchTerm, setSearchTerm] = useState("");

    const handleEdit = (id: number) => router.push(`roles/edit/${id}`);
    const handleAdd = () => router.push(`roles/add`);

    const filteredRoles = roles?.filter((r: Role) =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || r.id?.toString().includes(searchTerm)
    );
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

    const openDeleteModal = (role: Role) => {
        setSelectedRole(role);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setSelectedRole(null);
    };
    const handleConfirmDelete = async () => {
        if (!selectedRole) return;

        try {
            await deleteRole(selectedRole.id).unwrap();
            closeDeleteModal();
            alert("Xóa thành công!");
        } catch (err) {
            alert("Xóa thất bại!");
        }
    };
    // Giới hạn số lượng tags hiển thị trong bảng
    const MAX_TAGS_DISPLAY = 3;

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10"> {/* Dùng bg-gray-50 cho nền chính */}
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            <span className="text-indigo-600">👥</span> Quản Lý Chức Vụ (**Roles**)
                        </h1>
                        <p className="text-md text-gray-500">
                            Tạo và chỉnh sửa quyền hạn cho các vai trò trong hệ thống.
                        </p>
                    </div>

                    <button
                        onClick={handleAdd}
                        // Nút Thêm: Màu Xanh Lá cây (Green-600)
                        className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md shadow-green-600/30 font-medium transition"
                    >
                        <Plus size={20} />
                        Thêm Role Mới
                    </button>
                </div>

                {/* Search */}
                <div className="mb-8 relative max-w-lg"> {/* Giới hạn chiều rộng của thanh tìm kiếm */}
                    <input
                        placeholder="Tìm theo tên Role hoặc ID..."
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {isLoading ? (
                        // Loading State
                        <div className="p-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-green-600" size={24} />
                            <p className="ml-3 text-lg text-gray-600">Đang tải dữ liệu Role...</p>
                        </div>
                    ) : isError ? (
                        // Error State
                        <div className="p-8 text-center text-red-500 bg-red-50/50">
                            ❌ Không thể tải dữ liệu Role từ máy chủ. Vui lòng kiểm tra kết nối API.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">
                                        ID
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-3/12">
                                        Tên Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-7/12">
                                        Quyền hạn (Permissions)
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-1/12">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRoles?.length ? (
                                    filteredRoles.map((role: Role) => {
                                        // Lấy mảng tên quyền (strings) từ mảng đối tượng permissions
                                        const permissions: string[] = Array.isArray(role.permissions)
                                            ? role.permissions.map((p: { name: string }) => p.name).filter(Boolean)
                                            : [];

                                        const displayPermissions = permissions.slice(0, MAX_TAGS_DISPLAY);
                                        const remainingCount = permissions.length - MAX_TAGS_DISPLAY;

                                        return (
                                            <tr key={role.id} className="hover:bg-green-50 transition duration-150">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-600">{role.id}</td>
                                                <td className="px-6 py-4 font-semibold text-gray-800">{role.name}</td>

                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {permissions.length > 0 ? (
                                                            <>
                                                                {displayPermissions.map((p, index) => (
                                                                    <PermissionTag key={`${role.id}-${p}-${index}`} permission={p} />
                                                                ))}
                                                                {remainingCount > 0 && (
                                                                    <span className="text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap bg-gray-200 text-gray-700 border-gray-300">
                                                                        +{remainingCount}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400 italic text-sm">
                                                                Không có quyền nào
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleEdit(role.id)}
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-green-100 hover:text-green-700 transition"
                                                        title="Sửa Role"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(role)}
                                                        className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    // Không tìm thấy kết quả
                                    <tr>
                                        <td colSpan={4} className="text-center p-10 italic text-gray-500">
                                            Không tìm thấy Role nào phù hợp với tiêu chí tìm kiếm.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                role={selectedRole}
                onCancel={closeDeleteModal}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
            />
        </main>
    );
}
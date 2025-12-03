"use client";
import { useState } from "react";
import { Plus, Edit, Loader2, Search } from "lucide-react";
import { useGetAllRoleQuery } from "@/redux/services/roleApi";
import { useRouter } from "next/navigation";

type Permission = string;
type Role = {
    id: number;
    name: string;
    permissions: any;
};

// === Phân loại màu theo nhóm Permission ===
const CATEGORY_COLORS: { [key: string]: string } = {
    CATEGORY: "bg-purple-100 text-purple-700 border-purple-300",
    PRODUCT: "bg-green-100 text-green-700 border-green-300",
    ORDER: "bg-blue-100 text-blue-700 border-blue-300",
    MANAGER: "bg-red-100 text-red-700 border-red-300",
    CUSTOMER: "bg-yellow-100 text-yellow-700 border-yellow-300",
    ROLE: "bg-teal-100 text-teal-700 border-teal-300",
    PERMISSION: "bg-pink-100 text-pink-700 border-pink-300",
};

// Lấy category cuối
const getPermissionCategory = (permission: string): string =>
    permission.split("_").pop()?.toUpperCase() || "";

// Tag hiển thị quyền
const PermissionTag: React.FC<{ permission: string }> = ({ permission }) => {
    const parts = permission.split("_");
    const category = getPermissionCategory(permission);
    const action = parts.slice(0, -1).join(" ").toLowerCase();

    const colorClasses =
        CATEGORY_COLORS[category] ||
        "bg-gray-100 text-gray-700 border-gray-300";

    return (
        <span
            title={permission}
            className={`text-[10px] px-2 py-2 rounded-full border font-medium whitespace-nowrap ${colorClasses}`}
        >
            {`${action} ${category.toLowerCase()}`}
        </span>
    );
};

export default function RoleManagingPage() {
    const router = useRouter();
    const { data: roles, isLoading, isError } = useGetAllRoleQuery();
    const [searchTerm, setSearchTerm] = useState("");

    const handleEdit = (id: number) => router.push(`/admin/roles/edit/${id}`);
    const handleAdd = () => router.push(`/admin/roles/add`);

    const filteredRoles = roles?.filter((r: Role) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toString().includes(searchTerm)
    );

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-800">
                           Chức vụ
                        </h1>
                        <p className="text-sm text-gray-500">
                            Danh sách các vai trò và quyền hạn.
                        </p>
                    </div>

                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-[#5AB66B] hover:bg-[#4a9c5a] text-white rounded-lg shadow-lg shadow-[#5AB66B]/30 font-medium transition"
                    >
                        <Plus size={20} />
                        Thêm Role Mới
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6 relative">
                    <input
                        placeholder="Tìm theo tên Role hoặc ID..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#5AB66B] transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                    {isLoading ? (
                        <div className="p-10 flex items-center justify-center">
                            <Loader2 className="animate-spin text-[#5AB66B]" size={24} />
                            <p className="ml-2">Đang tải dữ liệu...</p>
                        </div>
                    ) : isError ? (
                        <div className="p-8 text-center text-red-500">
                            ❌ Không thể tải dữ liệu Role từ máy chủ.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Tên Role
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Quyền hạn
                                    </th>
                                    <th className="px-6 py-7 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredRoles?.length ? (
                                    filteredRoles.map((role: Role) => {
                                        const permissions: string[] = Array.isArray(role.permissions)
                                            ? role.permissions.map((p: any) => p.name) // Extract name
                                            : [];

                                        return (
                                            <tr key={role.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-9 text-sm font-medium">{role.id}</td>
                                                <td className="px-6 py-9 font-semibold">{role.name}</td>
                                                <td className="px-6 py-9">
                                                    <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                                                        {permissions.length ? (
                                                            permissions.map((p, index) => (
                                                                <PermissionTag key={`${role.id}-${p}-${index}`} permission={p} />
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 italic text-sm">
                                                                Không có quyền nào
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        className="text-[#5AB66B] hover:text-[#4a9c5a] flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 transition"
                                                        onClick={() => handleEdit(role.id)}
                                                    >
                                                        <Edit size={16} />
                                                        Sửa
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center p-10 italic text-gray-500">
                                            Không tìm thấy Role nào phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </main>
    );
}

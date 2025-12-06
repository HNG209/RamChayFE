"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetRoleByIdQuery, useUpdateRoleMutation } from "@/redux/services/roleApi";
import { ChevronLeft, Plus, X, ListChecks, Loader2 } from "lucide-react";
import { useGetAllPermissonQuery } from "@/redux/services/permissionApi";
type PermissionItem = {
    id: number;
    name: string;
};

type Role = {
    roleId: number;
    name: string;
    description?: string;
    permissionIds: Array<PermissionItem>;
};

type Permission = PermissionItem;


const formatPermissionForDisplay = (permissionName: string): string => {
    return permissionName
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

// PermissionTag (Giữ nguyên)
const PermissionTag: React.FC<{ permission: Permission; onRemove: (p: Permission) => void }> = ({
    permission,
    onRemove,
}) => {
    const greenClasses = "bg-green-100 text-green-700";

    return (
        <span
            className={`flex items-center text-xs px-2.5 py-1.5 rounded-full font-medium whitespace-nowrap ${greenClasses} transition duration-150`}
        >
            {formatPermissionForDisplay(permission.name)}
            <X
                size={12}
                className="ml-2 cursor-pointer text-green-700 hover:text-green-900 transition"
                onClick={() => onRemove(permission)}
            />
        </span>
    );
};

const PermissionSelectionDropdown: React.FC<{
    allPermissions: Permission[];
    selectedPermissions: Permission[];
    onSelectPermission: (p: Permission) => void;
}> = ({ allPermissions, selectedPermissions, onSelectPermission }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Lọc ra các quyền chưa được chọn
    const filteredPermissions = allPermissions.filter(
        (p) => !selectedPermissions.some((sp) => sp.id === p.id)
    );

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition shadow-md shadow-indigo-600/30 text-sm disabled:bg-indigo-400"
                disabled={filteredPermissions.length === 0}
            >
                <Plus size={16} />
                Thêm Quyền hạn
            </button>

            {isOpen && (
                <div
                    className="absolute z-20 mt-2 w-64 right-0 origin-top-right rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 max-h-60 overflow-y-auto"
                    onMouseLeave={() => setIsOpen(false)}
                >
                    {filteredPermissions.length > 0 ? (
                        <div className="py-1">
                            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">
                                Chọn quyền để thêm
                            </div>
                            {filteredPermissions.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        onSelectPermission(p);
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition"
                                >
                                    {formatPermissionForDisplay(p.name)}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="py-3 px-4 text-sm text-gray-500 italic">
                            Tất cả quyền đã được thêm.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function RoleFormEdit() {
    const router = useRouter();
    const params = useParams();

    const id = Number(params.id);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

    const [roleId, setRoleId] = useState<number | null>(null);

    const {
        data: roleData,
        isLoading: isLoadingRole,
        error: errorRole,
    } = useGetRoleByIdQuery(id, {

        skip: !id || id <= 0,
    });


    const { data: allPermissionsData, isLoading: isLoadingAllPermissions } = useGetAllPermissonQuery();


    useEffect(() => {
        console.log("-----------------------------------------");
        console.log("1. ID Role đang tìm kiếm (từ URL):", id);
        console.log("2. Trạng thái tải Role:", isLoadingRole ? "Đang tải..." : "Đã xong");

        if (errorRole) {
            console.error("Lỗi khi tải Role:", errorRole);
        }

        if (roleData) {

            console.log("3. Dữ liệu Role đã tải (roleData):", roleData);

            setRoleId(roleData.roleId); // Lưu roleId thực tế
            setName(roleData.name || "");
            setDescription(roleData.description || "");

            const initialPermissions = Array.isArray(roleData.permissionIds)
                ? roleData.permissionIds.filter((p: any) => p && p.id && p.name) as Permission[]
                : [];

            console.log("4. Permissions ban đầu trích xuất:", initialPermissions);

            setSelectedPermissions(initialPermissions);
        }
        console.log("-----------------------------------------");

    }, [roleData, isLoadingRole, id, errorRole]);


    const availablePermissions: Permission[] = Array.isArray(allPermissionsData) ? allPermissionsData : [];

    const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();

    const handleAddPermission = (permission: Permission) => {
        setSelectedPermissions((prev) => {
            if (!prev.some(p => p.id === permission.id)) {
                return [...prev, permission];
            }
            return prev;
        });
    };

    const handleRemovePermission = (permissionToRemove: Permission) => {
        setSelectedPermissions((prev) => prev.filter((p) => p.id !== permissionToRemove.id));
    };


    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Sử dụng roleId đã lấy từ API, nếu không có thì dùng id từ URL
        const finalId = roleId ?? id;

        if (isUpdating || !finalId || finalId <= 0) {
            alert("Lỗi: Không có ID Role hợp lệ để cập nhật.");
            return;
        }

        // 1. Chuẩn bị dữ liệu gửi đi (BODY)
        const updateBody = {
            name,
            description,
            permissionIds: selectedPermissions.map((p) => p.id), // Chỉ gửi mảng ID
        };

        // 2. Tạo đối tượng DUY NHẤT mà mutation mong đợi: { id: number; body: any }
        const mutationArg = {
            id: finalId,
            body: updateBody
        };

        try {

            await updateRole(mutationArg).unwrap();

            alert(`✅ Đã cập nhật Role ID ${finalId}: ${name} thành công!`);
            router.back();
        } catch (error: any) {
            console.error("Lỗi cập nhật Role:", error);
            alert(`❌ Cập nhật Role thất bại: ${error?.data?.message || "Lỗi không xác định. Vui lòng kiểm tra console."}`);
        }
    };

    const handleCancel = () => {
        if (confirm("Bạn có chắc chắn muốn hủy bỏ các thay đổi này?")) {
            router.back();
        }
    };

    // --- Loading & Error States ---

    if (isLoadingRole) {
        return (
            <main className="min-h-screen bg-gray-50 flex items-center justify-center p-10">
                <Loader2 className="animate-spin text-indigo-600" size={32} />
                <p className="ml-3 text-lg text-gray-700">Đang tải thông tin Role...</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 mr-4 text-gray-600 hover:bg-gray-200 rounded-full transition"
                        aria-label="Quay lại"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Chỉnh sửa Chức vụ (Role)</h1>
                        <p className="text-md text-gray-500">
                            Cập nhật tên, mô tả và quyền hạn cho chức vụ **{roleData.name}**.
                        </p>
                    </div>
                </div>

                {/* Form Container */}
                <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-2xl">
                    <form onSubmit={handleSave}>
                        {/* Tên Chức vụ */}
                        <div className="mb-6">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên Chức vụ
                            </label>
                            <input
                                id="name"
                                type="text"
                                placeholder="Ví dụ: Quản lý cửa hàng, Nhân viên bán hàng"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                required
                            />
                        </div>

                        {/* Mô tả */}
                        <div className="mb-6">
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                id="description"
                                placeholder="Mô tả chi tiết về phạm vi và trách nhiệm của chức vụ này..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                            />
                        </div>

                        {/* Quyền hạn (Permissions) */}
                        <div className="mb-8 p-6 border border-gray-300 rounded-xl bg-gray-50">
                            <div className="flex justify-between items-center mb-4">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-800">
                                    <ListChecks size={20} className="text-green-600" /> Quyền hạn (Permissions)
                                </label>

                                {/* Menu Chọn Quyền Hạn */}
                                {isLoadingAllPermissions ? (
                                    <span className="text-sm text-gray-500 flex items-center">
                                        <Loader2 className="animate-spin mr-2 text-indigo-500" size={16} /> Đang tải quyền...
                                    </span>
                                ) : (
                                    <PermissionSelectionDropdown
                                        allPermissions={availablePermissions}
                                        selectedPermissions={selectedPermissions}
                                        onSelectPermission={handleAddPermission}
                                    />
                                )}
                            </div>

                            {/* Khu vực chứa Tags đã chọn */}
                            <div
                                className={`min-h-[100px] p-3 rounded-lg border ${selectedPermissions.length > 0 ? "border-gray-200" : "border-dashed border-gray-400"
                                    } bg-white flex flex-wrap gap-2 content-start overflow-y-auto`}
                            >
                                {selectedPermissions.length > 0 ? (
                                    selectedPermissions.map((p) => (
                                        <PermissionTag key={p.id} permission={p} onRemove={handleRemovePermission} />
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-400 italic m-auto">
                                        Chức vụ này chưa có quyền hạn nào. Vui lòng thêm bằng nút "Thêm Quyền hạn".
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Nút Hành động: Lưu và Hủy */}
                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
                                disabled={isUpdating}
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md shadow-green-600/30 flex items-center disabled:bg-green-400"
                                disabled={isUpdating}
                            >
                                {isUpdating && <Loader2 className="animate-spin mr-2" size={20} />}
                                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
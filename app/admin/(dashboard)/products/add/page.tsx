import RoleGuard from "@/components/admin/RoleGuard";

export default function AddProductPage() {
    return (
        <RoleGuard allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}>
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-3">Thêm sản phẩm mới</p>
                <form className="space-y-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Tên sản phẩm</label>
                        <input className="w-full px-3 py-2 border rounded-md" placeholder="Tên sản phẩm" />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Giá</label>
                        <input className="w-full px-3 py-2 border rounded-md" placeholder="0" />
                    </div>

                    <div className="flex gap-2">
                        <button type="button" className="px-4 py-2 bg-lime-primary text-white rounded-md">Lưu</button>
                        <button type="button" className="px-4 py-2 bg-gray-100 rounded-md">Hủy</button>
                    </div>
                </form>
            </div>
        </RoleGuard>
    );
}

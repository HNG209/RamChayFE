"use client";

import RoleGuard from "@/components/admin/RoleGuard";
import { useGetProductsQuery } from "@/redux/services/productApi";

export default function ManageProductsPage() {
    const { data: products, isLoading, isError } = useGetProductsQuery();

    return (
        <RoleGuard allowedRoles={["ROLE_MANAGER", "ROLE_ADMIN"]}>
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <p className="text-sm text-gray-600 mb-3">Danh sách sản phẩm</p>

                {isLoading && <div>Đang tải...</div>}
                {isError && <div className="text-red-500">Không thể tải dữ liệu sản phẩm.</div>}

                {!isLoading && !isError && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="text-gray-600">
                                    <th className="px-3 py-2">#</th>
                                    <th className="px-3 py-2">Tên</th>
                                    <th className="px-3 py-2">SKU</th>
                                    <th className="px-3 py-2">Giá</th>
                                    <th className="px-3 py-2">Tồn kho</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products && products.length > 0 ? (
                                    products.map((p, idx) => (
                                        <tr key={p.id} className="border-t">
                                            <td className="px-3 py-2 align-top">{idx + 1}</td>
                                            <td className="px-3 py-2">{p.name}</td>
                                            <td className="px-3 py-2">{p.sku || "-"}</td>
                                            <td className="px-3 py-2">{p.price?.toLocaleString?.() ?? p.price} đ</td>
                                            <td className="px-3 py-2">{p.stock ?? "-"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                                            Không có sản phẩm nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </RoleGuard>
    );
}

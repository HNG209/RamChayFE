"use client";

import { useRouter } from "next/navigation";
import RoleGuard from "@/components/admin/RoleGuard";
import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  ArrowUpDown,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "@/redux/services/productApi";

export default function ProductManagingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  // data sẽ là mảng ProductCreationResponse[]
  const {
    data: products = [],
    isLoading,
    error,
    isError,
  } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này không?")) {
      try {
        await deleteProduct(id).unwrap();
      } catch (err) {
        alert("Xóa thất bại!");
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // <RoleGuard allowedRoles={["ROLE_ADMIN"]}>
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý sản phẩm</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý danh sách, kho hàng và giá cả sản phẩm.
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/products/add")}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Thêm sản phẩm</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-400 text-gray-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Lọc
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUpDown className="w-4 h-4" /> Sắp xếp
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>Không thể tải danh sách sản phẩm.</p>
            <p className="text-sm text-gray-400 mt-1">
              {(error as any)?.data?.message || "Lỗi kết nối server"}
            </p>
          </div>
        )}
        {!isLoading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Sản phẩm
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Danh mục
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700">
                    Giá bán
                  </th>
                  {/* THÊM CỘT ĐƠN VỊ TÍNH */}
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">
                    Đơn vị
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-center">
                    Tồn kho
                  </th>
                  <th className="px-6 py-4 font-semibold text-gray-700 text-right">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      {/* TÊN & ẢNH */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative">
                            {/* --- SỬA Ở ĐÂY: Dùng product.index thay vì product.imageUrl --- */}
                            <img
                              src={
                                product.indexImage ||
                                "https://placehold.co/100x100?text=No+Img"
                              }
                              alt={product.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src =
                                  "https://placehold.co/100x100?text=Error";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {product.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]">
                              {product.description}
                            </div>
                            <div className="text-[10px] text-gray-400 uppercase font-mono mt-1">
                              #{product.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* DANH MỤC */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {product.category?.categoryName || "Chưa phân loại"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-bold text-gray-800">
                        {formatCurrency(product.price)}
                      </td>

                      {/* DATA CỘT ĐƠN VỊ TÍNH */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 font-medium">
                          {product.unit || "-"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <StockBadge stock={product.stock} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              router.push(
                                `/admin/products/update/${product.id}`
                              )
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={isDeleting}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      <Package className="w-12 h-12 mb-3 mx-auto text-gray-300" />
                      Không tìm thấy sản phẩm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    // </RoleGuard>
  );
}

// --- HELPER COMPONENTS ---

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Hết hàng
      </span>
    );
  }
  if (stock < 10) {
    return (
      <div className="flex flex-col items-center">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
          Sắp hết: {stock}
        </span>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
      Còn hàng: {stock}
    </span>
  );
}

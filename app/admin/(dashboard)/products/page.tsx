"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import _ from "lodash";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  Eye,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  useGetProductsPageQuery,
  useDeleteProductMutation,
  useGetAllCategoriesQuery,
} from "@/redux/services/productApi";

export default function ProductManagingPage() {
  const router = useRouter();

  // --- 1. STATE QUẢN LÝ ---
  const [searchTerm, setSearchTerm] = useState("");
  const [apiKeyword, setApiKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  // Thêm state cho phân trang
  const [page, setPage] = useState(1);
  const pageSize = 10; // Số lượng sản phẩm trên mỗi trang

  // --- 2. LOGIC DEBOUNCE ---
  const debouncedUpdateKeyword = useMemo(
    () =>
      _.debounce((value: string) => {
        setApiKeyword(value);
        setPage(1); // Reset về trang 1 khi tìm kiếm mới
      }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedUpdateKeyword(value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setPage(1); // Reset về trang 1 khi đổi danh mục
  };

  // --- 3. API CALLS ---
  const { data: categoriesData } = useGetAllCategoriesQuery();

  const {
    data: pageData,
    isLoading,
    error,
    isError,
    isFetching,
  } = useGetProductsPageQuery({
    page: page,
    size: pageSize,
    keyword: apiKeyword,
    categoryId: selectedCategory === "all" ? "" : selectedCategory,
  });

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  // --- 4. XỬ LÝ DỮ LIỆU ---
  // API trả về PageResponse (cấu trúc phẳng) như trong backend.ts mới nhất
  const products = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;
  const currentPage = pageData?.currentPage || page;
  const totalElements = pageData?.totalElements || 0;

  const categories = Array.isArray((categoriesData as any)?.result)
    ? (categoriesData as any).result
    : Array.isArray(categoriesData)
    ? categoriesData
    : [];

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

  // Logic chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
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
        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {isFetching ? (
              <Loader2 className="h-5 w-5 text-green-500 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-gray-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-400 text-gray-900 transition-all"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {/* FILTER DROPDOWN */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="w-4 h-4 text-gray-500" />
            </div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="appearance-none w-full sm:w-64 pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500/20 cursor-pointer bg-white"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.categoryName}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        {isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-red-500">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p>Không thể tải danh sách sản phẩm.</p>
            <p className="text-sm text-gray-400 mt-1">
              {(error as any)?.data?.message || "Lỗi kết nối server"}
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700">Sản phẩm</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Danh mục</th>
                    <th className="px-6 py-4 font-semibold text-gray-700">Giá bán</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Đơn vị</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Tồn kho</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length > 0 ? (
                    products.map((product: any) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200 relative">
                              <img
                                src={product.indexImage || "https://placehold.co/100x100?text=No+Img"}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => { e.currentTarget.src = "https://placehold.co/100x100?text=Error"; }}
                              />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">{product.name}</div>
                              <div className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[200px]">{product.description}</div>
                              <div className="text-[10px] text-gray-400 uppercase font-mono mt-1">#{product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                            {product.category?.categoryName || "Chưa phân loại"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 font-medium">
                            {product.unit || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center"><StockBadge stock={product.stock} /></td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => router.push(`/admin/products/update/${product.id}`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-green-600 transition-colors"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(product.id)} disabled={isDeleting} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50">
                              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <Package className="w-12 h-12 mb-3 mx-auto text-gray-300" />
                        Không tìm thấy sản phẩm
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- PAGINATION FOOTER --- */}
            <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Hiển thị {products.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} đến {Math.min(currentPage * pageSize, totalElements)} của {totalElements} sản phẩm
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-sm font-medium text-gray-700 px-2">
                  Trang {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Hết hàng</span>;
  if (stock < 10) return <div className="flex flex-col items-center"><span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Sắp hết: {stock}</span></div>;
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Còn hàng: {stock}</span>;
}
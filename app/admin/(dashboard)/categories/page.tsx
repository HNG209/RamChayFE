"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  AlignLeft,
  AlertCircle,
} from "lucide-react";
// Import Hook phân trang mới
import {
  useGetCategoriesPageQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/services/categoryApi";

export default function CategoryManagementPage() {
  const router = useRouter();

  // --- 1. STATE PHÂN TRANG ---
  const [page, setPage] = useState(1);
  const pageSize = 5; // Danh mục thường ít, để 5 hoặc 10 là đẹp

  // --- 2. GỌI API LẤY DANH SÁCH PHÂN TRANG ---
  const { 
    data: pageData, 
    isLoading, 
    isError 
  } = useGetCategoriesPageQuery({ page, size: pageSize });

  // Xử lý dữ liệu PageResponse
  const categories = pageData?.content || [];
  const totalPages = pageData?.totalPages || 1;
  const currentPage = pageData?.currentPage || page;
  const totalElements = pageData?.totalElements || 0;

  // --- 3. GỌI API THÊM & XÓA ---
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Xử lý thay đổi input
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Logic chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // --- XỬ LÝ THÊM DANH MỤC ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createCategory({
        categoryName: formData.name.trim(),
        description: formData.description.trim(),
      }).unwrap();

      setFormData({ name: "", description: "" });
      alert("Thêm danh mục thành công!");
      // RTK Query tự động refresh list, không cần gọi lại API
    } catch (error: any) {
      console.error("Lỗi thêm danh mục:", error);
      alert("Lỗi: " + (error?.data?.message || "Không thể thêm danh mục"));
    }
  };

  // --- XỬ LÝ XÓA DANH MỤC ---
  const handleDeleteCategory = async (id: number, name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      try {
        await deleteCategory(id).unwrap();
      } catch (error: any) {
        alert("Xóa thất bại: " + (error?.data?.message || "Có lỗi xảy ra"));
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-10 space-y-6">
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Danh mục</h1>
          <p className="text-sm text-gray-500">
            Phân loại sản phẩm để khách hàng dễ dàng tìm kiếm.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI (1/3): FORM THÊM MỚI */}
        <div className="lg:col-span-1 h-fit">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 text-green-600">
              <Plus className="w-5 h-5" />
              Thêm danh mục
            </h2>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên danh mục <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Đồ hộp chay..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder-gray-400 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả danh mục
                </label>
                <div className="relative">
                  <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả ngắn về loại sản phẩm này..."
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none placeholder-gray-400 text-gray-900"
                  />
                  <AlignLeft className="absolute top-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-70 shadow-sm hover:shadow"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <Tag className="w-5 h-5" />
                    Lưu Danh mục
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* CỘT PHẢI (2/3): DANH SÁCH */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px] flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-5 h-5 text-gray-600" />
                Danh sách hiện có
                <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  Total: {totalElements}
                </span>
              </h2>
            </div>

            {/* BODY */}
            <div className="flex-1">
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
                  <p className="text-gray-500 text-sm">Đang tải danh sách...</p>
                </div>
              )}

              {isError && (
                <div className="flex flex-col items-center justify-center py-20 text-red-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">Không thể tải danh sách danh mục.</p>
                </div>
              )}

              {!isLoading && !isError && (
                <>
                  {categories.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                          <tr>
                            <th className="p-4 w-[30%]">Tên Danh mục</th>
                            <th className="p-4 w-[55%]">Mô tả</th>
                            <th className="p-4 w-[15%] text-right">Hành động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {categories.map((cat: any) => (
                            <tr
                              key={cat.id}
                              className="hover:bg-gray-50 transition-colors group"
                            >
                              <td className="p-4 align-top font-semibold text-gray-800">
                                {cat.categoryName}
                              </td>
                              <td className="p-4 align-top">
                                <p className="text-gray-500 line-clamp-2 text-xs leading-relaxed">
                                  {cat.description || (
                                    <span className="italic text-gray-300">
                                      Không có mô tả
                                    </span>
                                  )}
                                </p>
                              </td>
                              <td className="p-4 align-top text-right">
                                <button
                                  onClick={() =>
                                    handleDeleteCategory(cat.id, cat.categoryName)
                                  }
                                  disabled={isDeleting}
                                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                                  title="Xóa danh mục"
                                >
                                  {isDeleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <Tag className="w-10 h-10 mb-2 opacity-20" />
                      <p className="text-sm">Chưa có danh mục nào.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* PAGINATION FOOTER */}
            {!isLoading && !isError && categories.length > 0 && (
              <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between rounded-b-xl">
                <span className="text-xs text-gray-500">
                  Trang {currentPage} / {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-1.5 border border-gray-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 bg-white shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="p-1.5 border border-gray-200 rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-600 bg-white shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
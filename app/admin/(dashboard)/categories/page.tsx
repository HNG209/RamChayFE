"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tag,
  Plus,
  Trash2,
  ChevronLeft,
  Loader2,
  Package,
  AlignLeft,
  AlertCircle,
} from "lucide-react";
import RoleGuard from "@/components/admin/RoleGuard";
// Import Hooks từ API thật
import { 
  useGetCategoriesQuery, 
  useCreateCategoryMutation, 
  useDeleteCategoryMutation 
} from "@/redux/services/categoryApi";

export default function CategoryManagementPage() {
  const router = useRouter();

  // 1. GỌI API LẤY DANH SÁCH
  const { data: categories = [], isLoading, isError } = useGetCategoriesQuery();

  // 2. GỌI API THÊM & XÓA
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- XỬ LÝ THÊM DANH MỤC ---
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      // Gọi API Create
      await createCategory({
        categoryName: formData.name.trim(),
        description: formData.description.trim()
      }).unwrap();

      // Reset form sau khi thành công
      setFormData({ name: "", description: "" });
      alert("Thêm danh mục thành công!");
      
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
        // Không cần alert cũng được, UI tự cập nhật nhờ tag "Category"
      } catch (error: any) {
        // Backend sẽ trả về lỗi nếu danh mục đang có sản phẩm (nhờ logic check existsByCategoryId mình đã làm)
        alert("Xóa thất bại: " + (error?.data?.message || "Có lỗi xảy ra"));
      }
    }
  };

  return (
    <RoleGuard allowedRoles={["ROLE_ADMIN"]}>
      <div className="max-w-6xl mx-auto pb-10">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Quản lý Danh mục
            </h1>
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
                {/* Tên danh mục */}
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

                {/* Mô tả */}
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[300px]">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    Danh sách hiện có
                    <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Total: {categories.length}
                    </span>
                </h2>

                {/* TRẠNG THÁI LOADING */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600 mb-2" />
                        <p className="text-gray-500 text-sm">Đang tải danh sách...</p>
                    </div>
                )}

                {/* TRẠNG THÁI ERROR */}
                {isError && (
                    <div className="flex flex-col items-center justify-center py-10 text-red-500">
                        <AlertCircle className="w-8 h-8 mb-2" />
                        <p className="text-sm">Không thể tải danh sách danh mục.</p>
                    </div>
                )}

                {/* BẢNG DỮ LIỆU */}
                {!isLoading && !isError && (
                    <>
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
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-gray-50 transition-colors group">
                                            {/* Tên */}
                                            <td className="p-4 align-top font-semibold text-gray-800">
                                                {cat.categoryName}
                                            </td>
                                            
                                            {/* Mô tả */}
                                            <td className="p-4 align-top">
                                                <p className="text-gray-500 line-clamp-2 text-xs leading-relaxed">
                                                    {cat.description || <span className="italic text-gray-300">Không có mô tả</span>}
                                                </p>
                                            </td>

                                            {/* Hành động */}
                                            <td className="p-4 align-top text-right">
                                                <button
                                                    onClick={() => handleDeleteCategory(cat.id, cat.categoryName)}
                                                    disabled={isDeleting}
                                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-100 group-hover:opacity-100 disabled:opacity-50"
                                                    title="Xóa danh mục"
                                                >
                                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4" />}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {categories.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                                <Tag className="w-10 h-10 mb-2 opacity-20" />
                                <p className="text-sm">Chưa có danh mục nào.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
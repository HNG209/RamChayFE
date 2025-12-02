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
} from "lucide-react";
import RoleGuard from "@/components/admin/RoleGuard";

// 1. DATA MẪU (Đã bỏ productCount)
const INITIAL_CATEGORIES = [
  { 
    id: 1, 
    name: "Thực phẩm chế biến", 
    description: "Các loại chả lụa, nem chua, giò thủ chay làm thủ công.",
  },
  { 
    id: 2, 
    name: "Thực phẩm khô", 
    description: "Sườn non, bóng cá, tàu hũ ky và các loại đồ khô khác.",
  },
  { 
    id: 3, 
    name: "Rau củ & Nấm", 
    description: "Nấm đông cô, nấm đùi gà và rau củ tươi sạch trong ngày.",
  },
  { 
    id: 4, 
    name: "Gia vị chay", 
    description: "Hạt nêm, nước mắm chay, chao và các loại sốt chấm.",
  },
];

export default function CategoryManagementPage() {
  const router = useRouter();
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);

  // State Form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // Xử lý thay đổi input
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý thêm danh mục
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    // Giả lập API POST
    await new Promise(resolve => setTimeout(resolve, 800)); 

    const newId = categories.length + 1; 
    const newCategory = {
      id: newId,
      name: formData.name.trim(),
      description: formData.description.trim(),
    };

    setCategories((prev) => [...prev, newCategory]);
    setFormData({ name: "", description: "" }); // Reset form
    setIsLoading(false);
  };

  // Xử lý xoá danh mục (Đơn giản hóa logic xóa)
  const handleDeleteCategory = (id: number, name: string) => {
    // Vì không còn check productCount ở FE, ta chỉ hỏi xác nhận
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      // Giả lập API DELETE
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
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
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
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
                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                    />
                    <AlignLeft className="absolute top-3 right-3 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-70 shadow-sm hover:shadow"
                >
                  {isLoading ? (
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    Danh sách hiện có
                    <span className="ml-2 text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Total: {categories.length}
                    </span>
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-100">
                            <tr>
                                {/* Điều chỉnh lại độ rộng cột vì đã mất cột SL SP */}
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
                                        {cat.name}
                                    </td>
                                    
                                    {/* Mô tả */}
                                    <td className="p-4 align-top">
                                        <p className="text-gray-500 line-clamp-2 text-xs leading-relaxed">
                                            {cat.description || <span className="italic text-gray-300">Không có mô tả</span>}
                                        </p>
                                    </td>

                                    {/* Hành động: Nút Xóa luôn active */}
                                    <td className="p-4 align-top text-right">
                                        <button
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            title="Xóa danh mục"
                                        >
                                            <Trash2 className="w-4 h-4" />
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
            </div>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
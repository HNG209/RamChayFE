"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  X,
  Save,
  Loader2,
  DollarSign,
  Package,
  ImageIcon,
  Plus,
  Scale, // Icon cho Đơn vị tính
} from "lucide-react";
import { useCreateProductMutation } from "@/redux/services/productApi";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
import { ProductCreationRequest } from "@/types/backend";

export default function CreateProductPage() {
  const router = useRouter();
  
  // Gọi API lấy danh sách danh mục để đổ vào Select box
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
  
  const [createProduct, { isLoading }] = useCreateProductMutation();

  // 1. State form (Đã thêm unit)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "", // Trường đơn vị tính
    categoryId: "", 
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file));
      setSelectedImages((prev) => [...prev, ...filesArray]);
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    const newUrls = [...previewUrls];
    newImages.splice(index, 1);
    URL.revokeObjectURL(newUrls[index]);
    newUrls.splice(index, 1);
    setSelectedImages(newImages);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tìm object category thật dựa trên ID user chọn
    const selectedCat = categories.find(c => c.id === Number(formData.categoryId));

    if (!selectedCat) {
        alert("Vui lòng chọn danh mục hợp lệ!");
        return;
    }

    try {
      const payload: ProductCreationRequest & { images: File[] } = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit, // Gửi unit lên BE

        category: {
            categoryName: selectedCat.categoryName,
            description: selectedCat.description
        },
        
        imageUrl: "", 
        mediaUploadRequests: [],
        images: selectedImages 
      };

      await createProduct(payload).unwrap();
      
      alert("Thêm sản phẩm thành công!");
      router.push("/admin/products");

    } catch (error: any) {
      console.error("Lỗi:", error);
      alert("Lỗi: " + (error?.data?.message || "Không thể tạo sản phẩm"));
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
          <p className="text-sm text-gray-500">Điền thông tin chi tiết về sản phẩm để thêm vào kho hàng.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Thông tin chung
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Gạo Lứt Huyết Rồng"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder-gray-400 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả sản phẩm</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết..."
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none placeholder-gray-400 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900"
                    required
                    disabled={isLoadingCategories}
                  >
                    <option value="">{isLoadingCategories ? "Đang tải..." : "-- Chọn danh mục --"}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.categoryName}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    onClick={() => router.push("/admin/categories")}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-200 text-gray-600 transition-colors"
                    title="Quản lý danh mục"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CARD GIÁ & KHO (GRID 3 CỘT) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Giá & Kho hàng
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              
              {/* Giá bán */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full pl-3 pr-8 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-400"
                    required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">đ</span>
                    </div>
                </div>
              </div>

              {/* Đơn vị tính */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    placeholder="Vd: Kg"
                    list="unit-suggestions"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-400"
                    required
                    />
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <datalist id="unit-suggestions">
                        <option value="Hộp" /><option value="Gói" /><option value="Chai" /><option value="Kg" /><option value="Cái" />
                    </datalist>
                </div>
              </div>

              {/* Tồn kho */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: ẢNH */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-green-600" />
              Hình ảnh
            </h2>
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click để tải ảnh</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50">Hủy</button>
          <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-70">
            {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5"/>}
            <span>Lưu sản phẩm</span>
          </button>
        </div>
      </form>
    </div>
  );
}
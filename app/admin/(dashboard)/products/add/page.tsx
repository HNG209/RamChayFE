"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  X,
  Save,
  Loader2,
  Package,
  ImageIcon,
  Scale, // Icon cho Đơn vị tính
  ListFilter,
  DollarSign,
} from "lucide-react";
import { useCreateProductMutation } from "@/redux/services/productApi";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";
// import { ProductCreationRequest } from "@/types/backend"; // Import interface của bạn nếu cần type strict

export default function CreateProductPage() {
  const router = useRouter();

  // Gọi API lấy danh sách danh mục
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const [createProduct, { isLoading }] = useCreateProductMutation();

  // State form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "",
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
    
    // Revoke URL để tránh memory leak
    URL.revokeObjectURL(newUrls[index]);

    newImages.splice(index, 1);
    newUrls.splice(index, 1);
    
    setSelectedImages(newImages);
    setPreviewUrls(newUrls);
  };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cơ bản
    if (!formData.categoryId) {
      alert("Vui lòng chọn danh mục!");
      return;
    }
    if (selectedImages.length === 0) {
      alert("Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm!");
      return;
    }

    try {
      // --- LOGIC MỚI: ĐƠN GIẢN HÓA ---
      // Vì productApi.ts đã lo việc tạo FormData rồi,
      // ở đây ta chỉ cần gom dữ liệu vào 1 object JS bình thường.
      
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        categoryId: Number(formData.categoryId), // Quan trọng: Convert sang số
        images: selectedImages,
        mediaUploadRequests: [],
      };

      // Gọi API: RTK Query sẽ tự động tách `images` ra và stringify phần còn lại
      await createProduct(payload).unwrap();

      alert("Thêm sản phẩm thành công!");
      router.push("/admin/products"); // Chuyển trang
      
    } catch (error: any) {
      console.error("Lỗi:", error);
      alert("Lỗi: " + (error?.data?.message || "Không thể tạo sản phẩm"));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER - Bỏ các nút bấm ở đây */}
        <div className="flex items-center gap-4 mb-8">
            <button 
              onClick={() => router.back()} 
              className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Thêm sản phẩm mới</h1>
              <p className="text-sm text-gray-500 mt-1">Điền thông tin chi tiết sản phẩm để thêm vào kho hàng.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN CHÍNH (Chiếm 8/12 cột) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Card 1: Thông tin chung */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <Package className="w-5 h-5 text-green-600" />
                Thông tin chung
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Gạo Lứt Huyết Rồng"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all placeholder-gray-400 text-gray-900 bg-gray-50/30 focus:bg-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    {/* Đã xóa nút + và wrapper flex để select full width */}
                    <div className="relative w-full">
                        <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/30 focus:bg-white text-gray-900 appearance-none"
                            required
                            disabled={isLoadingCategories}
                        >
                            <option value="">{isLoadingCategories ? "Đang tải..." : "-- Chọn danh mục --"}</option>
                            {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.categoryName}
                            </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả sản phẩm</label>
                  <textarea
                    name="description"
                    rows={5}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none placeholder-gray-400 text-gray-900 bg-gray-50/30 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Giá & Kho */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <DollarSign className="w-5 h-5 text-green-600" />
                Giá & Kho hàng
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Giá bán */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-400 font-medium bg-gray-50/30 focus:bg-white"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">đ</span>
                    </div>
                  </div>
                </div>

                {/* Đơn vị tính */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn vị tính <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="text"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="Vd: Kg"
                      list="unit-suggestions"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-400 bg-gray-50/30 focus:bg-white"
                      required
                    />
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <datalist id="unit-suggestions">
                      <option value="Hộp" /><option value="Gói" /><option value="Chai" /><option value="Kg" /><option value="Cái" />
                    </datalist>
                  </div>
                </div>

                {/* Tồn kho */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tồn kho <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 placeholder-gray-400 bg-gray-50/30 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: ẢNH (Chiếm 4/12 cột) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <ImageIcon className="w-5 h-5 text-green-600" />
                Hình ảnh sản phẩm
              </h2>
              
              {/* Vùng Upload */}
              <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-gray-100 rounded-full mb-3 group-hover:bg-green-100 transition-colors">
                        <Upload className="w-6 h-6 text-gray-500 group-hover:text-green-600" />
                    </div>
                    <p className="mb-2 text-sm text-gray-600 font-medium">Click để tải ảnh lên</p>
                    <p className="text-xs text-gray-400">PNG, JPG (Tối đa 5MB)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              {/* Danh sách Preview */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Ảnh đã chọn ({selectedImages.length})</h3>
                
                {selectedImages.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-lg border border-gray-100 border-dashed">
                        Chưa có ảnh nào được chọn
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      
                      {/* Overlay khi hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            type="button" 
                            onClick={() => removeImage(index)} 
                            className="bg-white/90 p-2 rounded-full text-red-500 hover:bg-white hover:scale-110 transition-all shadow-lg"
                        >
                            <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Badge Ảnh đại diện */}
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                          Đại diện
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER BUTTONS (Đã thêm mới ở đây) */}
          <div className="lg:col-span-12 flex justify-end gap-3 pt-6 border-t border-gray-200">
             <button 
                type="button" 
                onClick={() => router.back()} 
                className="px-6 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                onClick={handleSubmit} 
                disabled={isLoading} 
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-70 font-medium shadow-sm transition-all hover:shadow-md"
              >
                {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                <span>Lưu sản phẩm</span>
              </button>
          </div>

        </form>
      </div>
    </div>
  );
}
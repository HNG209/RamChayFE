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
} from "lucide-react";
import { useCreateProductMutation } from "@/redux/services/productApi";
import { ProductCreationRequest } from "@/types/backend";

// Mock danh sách danh mục (Thực tế data này lấy từ API getCategories)
// Lưu ý: Mình thêm trường description vào mock để có dữ liệu gửi đi
const CATEGORIES = [
  { id: 1, name: "Thực phẩm chế biến", description: "Các loại đồ ăn liền" },
  { id: 2, name: "Thực phẩm khô", description: "Đồ khô bảo quản lâu" },
  { id: 3, name: "Rau củ & Nấm", description: "Rau tươi sạch" },
  { id: 4, name: "Gia vị chay", description: "Gia vị tự nhiên" },
];

export default function CreateProductPage() {
  const router = useRouter();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  // 1. Quản lý State form
  // categoryId: Chỉ dùng nội bộ để quản lý Select box
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "", 
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Xử lý input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý ảnh
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

  // --- XỬ LÝ SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Tìm Category Object dựa trên ID đã chọn
    const selectedCat = CATEGORIES.find(c => c.id === Number(formData.categoryId));

    if (!selectedCat) {
        alert("Vui lòng chọn danh mục hợp lệ!");
        return;
    }

    try {
      // 2. Tạo Payload đúng chuẩn Interface ProductCreationRequest
      const payload: ProductCreationRequest & { images: File[] } = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        
        // Mapping dữ liệu vào object CategoryCreationRequest
        category: {
            categoryName: selectedCat.name,
            description: selectedCat.description
        },
        
        imageUrl: "", // Backend sẽ tự xử lý
        mediaUploadRequests: [], // Mảng rỗng
        
        images: selectedImages // File đính kèm để API xử lý FormData
      };

      // 3. Gọi API
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
        <button
          onClick={() => router.back()}
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
          <p className="text-sm text-gray-500">
            Điền thông tin chi tiết về sản phẩm để thêm vào kho hàng.
          </p>
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
              {/* Tên SP */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  required
                />
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                />
              </div>

              {/* Danh mục (Select Box) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
                    required
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="p-2.5 bg-gray-100 rounded-lg border border-gray-200">
                    <Plus className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Giá & Kho */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Giá & Tồn kho
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá bán (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng tồn kho <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
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
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Click để tải ảnh</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
            
            {/* Preview Ảnh */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 hover:bg-gray-100">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
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
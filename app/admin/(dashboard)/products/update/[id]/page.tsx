"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Upload,
  X,
  Save,
  Loader2,
  DollarSign,
  Package,
  ImageIcon,
} from "lucide-react";

// Mock Categories (Thực tế nên fetch từ API)
const CATEGORIES = [
  { id: 1, name: "Thực phẩm chế biến" },
  { id: 2, name: "Thực phẩm khô" },
  { id: 3, name: "Rau củ & Nấm" },
  { id: 4, name: "Gia vị chay" },
];

export default function UpdateProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id; // Lấy ID từ URL

  const [isLoading, setIsLoading] = useState(false); // State khi đang submit
  const [isFetching, setIsFetching] = useState(true); // State khi đang load dữ liệu ban đầu

  // State form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  // State hình ảnh
  // previewUrls: Dùng để hiển thị (bao gồm cả ảnh cũ từ server và ảnh mới chọn)
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  // newFiles: Chỉ chứa các file mới người dùng chọn thêm
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // --- 1. LOAD DỮ LIỆU SẢN PHẨM ---
  useEffect(() => {
    // Giả lập gọi API lấy chi tiết sản phẩm theo ID
    const fetchProductDetail = async () => {
      try {
        // Thực tế: const res = await fetch(`/api/products/${productId}`);
        // const data = await res.json();
        
        // Mock data trả về từ server (giả sử)
        const mockDataFromDB = {
          id: productId,
          name: "Chả lụa chay (Dữ liệu cũ)",
          description: "Mô tả cũ của sản phẩm...",
          price: 45000,
          stock: 120,
          category: { id: 1 }, // Entity Category
          mediaFiles: [ // Entity Media
            { id: 101, url: "https://placehold.co/100x100?text=Old+Img+1" },
            { id: 102, url: "https://placehold.co/100x100?text=Old+Img+2" }
          ]
        };

        // Delay giả lập mạng
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Fill dữ liệu vào Form
        setFormData({
          name: mockDataFromDB.name,
          description: mockDataFromDB.description,
          price: mockDataFromDB.price.toString(),
          stock: mockDataFromDB.stock.toString(),
          categoryId: mockDataFromDB.category.id.toString(),
        });

        // Fill ảnh cũ vào preview
        setPreviewUrls(mockDataFromDB.mediaFiles.map(m => m.url));

      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        alert("Không thể tải thông tin sản phẩm!");
        router.push("/admin/products");
      } finally {
        setIsFetching(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId, router]);


  // --- 2. CÁC HÀM XỬ LÝ (GIỐNG TRANG CREATE) ---

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newUrls = filesArray.map((file) => URL.createObjectURL(file));

      setNewFiles((prev) => [...prev, ...filesArray]); // Lưu file mới để upload
      setPreviewUrls((prev) => [...prev, ...newUrls]); // Hiển thị chung
    }
  };

  const removeImage = (index: number) => {
    // Lưu ý: Logic xóa ảnh ở Update phức tạp hơn Create
    // Bạn cần phân biệt xóa ảnh cũ (cần gọi API xóa ID ảnh) hay xóa ảnh mới (chỉ cần xóa khỏi mảng newFiles).
    // Ở demo này mình làm đơn giản là xóa khỏi giao diện Preview.
    
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    
    // Nếu index thuộc về mảng newFiles (tức là nằm ở cuối mảng preview), ta xóa khỏi newFiles.
    // Logic thực tế cần mapping ID ảnh chính xác hơn.
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Updating Product ID:", productId);
    console.log("Data:", {
      ...formData,
      newImagesToUpload: newFiles,
      remainingImages: previewUrls.filter(url => !url.startsWith("blob:")) // Lọc lấy ảnh cũ còn giữ lại
    });

    // Giả lập API update
    setTimeout(() => {
      setIsLoading(false);
      router.push("/admin/products"); // Quay về danh sách
    }, 1500);
  };

  // --- 3. RENDER GIAO DIỆN ---
  
  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-800">Cập nhật sản phẩm</h1>
          <p className="text-sm text-gray-500">
            Chỉnh sửa thông tin sản phẩm #{productId}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" /> {/* Đổi màu icon để phân biệt */}
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
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả sản phẩm
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
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
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  min="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              Hình ảnh
            </h2>
            
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Thêm ảnh mới</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={url}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {/* Badge để biết đâu là ảnh mới */}
                    {url.startsWith("blob:") && (
                       <span className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded">Mới</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
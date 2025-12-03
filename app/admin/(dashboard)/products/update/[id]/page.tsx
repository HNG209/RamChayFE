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
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/redux/services/productApi";
import { ProductCreationRequest } from "@/types/backend";

// Mock Categories (Thực tế nên fetch từ API getCategories)
const CATEGORIES = [
  { id: 1, name: "Thực phẩm chế biến", description: "Các loại đồ ăn liền" },
  { id: 2, name: "Thực phẩm khô", description: "Đồ khô bảo quản lâu" },
  { id: 3, name: "Rau củ & Nấm", description: "Rau tươi sạch" },
  { id: 4, name: "Gia vị chay", description: "Gia vị tự nhiên" },
];

export default function UpdateProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  // 1. Hook lấy dữ liệu sản phẩm
  const {
    data: productData,
    isLoading: isFetching,
    isError,
  } = useGetProductByIdQuery(productId, {
    skip: !productId, // Chỉ gọi khi có productId
  });

  // 2. Hook cập nhật sản phẩm
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // State form
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
  });

  // State hình ảnh
  // existingImages: Ảnh cũ từ server (cần object có id để xóa)
  // Trong ProductResponse chưa có list media chi tiết nên ta sẽ mock tạm hoặc
  // cần Backend trả về List<MediaResponse> trong ProductResponse để lấy ID ảnh.
  // GIẢ SỬ: Backend trả về mediaUploadRequests chứa thông tin ảnh (hoặc bạn cần sửa DTO Response để có ID ảnh).
  // TẠM THỜI: Mình sẽ dùng logic hiển thị imageUrl chung.
  // ĐỂ XÓA ẢNH CŨ: Bạn cần ID của Media. Hãy đảm bảo API getProductById trả về danh sách Media có ID.

  // Giả sử productData trả về có field `mediaFiles` (List Media Entity)
  // Nếu DTO chưa có, bạn cần thêm vào ProductCreationResponse ở Backend.
  // Tạm thời mình dùng state để demo logic.

  const [existingImages, setExistingImages] = useState<any[]>([]); // Ảnh cũ
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]); // ID ảnh cần xóa
  const [newFiles, setNewFiles] = useState<File[]>([]); // File mới
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]); // Preview ảnh mới

  // Load dữ liệu vào form khi fetch xong
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        stock: productData.stock.toString(),
        // Giả sử category trả về object, ta lấy ID
        categoryId: productData.category?.id?.toString() || "",
      });
      if (productData.mediaList && productData.mediaList.length > 0) {
        // Map đúng format để hiển thị
        setExistingImages(productData.mediaList); 
      } else {
        setExistingImages([]);
      }
    }
  }, [productData]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newUrls = filesArray.map((file) => URL.createObjectURL(file));

      setNewFiles((prev) => [...prev, ...filesArray]);
      setNewPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removeNewImage = (index: number) => {
    const updatedFiles = [...newFiles];
    const updatedUrls = [...newPreviewUrls];

    updatedFiles.splice(index, 1);
    URL.revokeObjectURL(updatedUrls[index]);
    updatedUrls.splice(index, 1);

    setNewFiles(updatedFiles);
    setNewPreviewUrls(updatedUrls);
  };

  // Hàm xóa ảnh cũ (cần ID ảnh)
  const removeExistingImage = (mediaId: number, index: number) => {
    setImagesToDelete((prev) => [...prev, mediaId]); // Thêm vào danh sách xóa
    const updatedExisting = [...existingImages];
    updatedExisting.splice(index, 1); // Xóa khỏi giao diện
    setExistingImages(updatedExisting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCat = CATEGORIES.find(
      (c) => c.id === Number(formData.categoryId)
    );
    if (!selectedCat) {
      alert("Vui lòng chọn danh mục hợp lệ!");
      return;
    }

    try {
      const formPayload = new FormData();

      // 1. Tạo object ProductCreationRequest
      const productRequest = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: {
          categoryName: selectedCat.name,
          description: selectedCat.description,
        },
        imageUrl: "", // Backend tự xử lý
        mediaUploadRequests: [],
        imageIdsToDelete: imagesToDelete, // Gửi danh sách ID cần xóa
      };

      formPayload.append("product", JSON.stringify(productRequest));

      // 2. Append ảnh mới
      if (newFiles.length > 0) {
        newFiles.forEach((file) => {
          formPayload.append("image", file);
        });
      }

      // 3. Gọi API Update
      await updateProduct({ id: productId, data: formPayload }).unwrap();

      alert("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      alert("Lỗi: " + (error?.data?.message || "Không thể cập nhật sản phẩm"));
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500">Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        Không tìm thấy sản phẩm hoặc có lỗi xảy ra.
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
          <h1 className="text-2xl font-bold text-gray-800">
            Cập nhật sản phẩm
          </h1>
          <p className="text-sm text-gray-500">
            Chỉnh sửa thông tin sản phẩm #{productId}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
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

        {/* CỘT PHẢI: HÌNH ẢNH */}
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

            {/* Hiển thị ảnh cũ (Existing Images) */}
            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Ảnh hiện tại:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((media, index) => (
                    <div
                      key={media.id}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={media.secureUrl}
                        alt="Existing"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(media.id, index)}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        title="Xóa ảnh này"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hiển thị ảnh mới (New Images) */}
            {newPreviewUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Ảnh mới thêm:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {newPreviewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={url}
                        alt="New Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        title="Hủy chọn"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <span className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded">
                        Mới
                      </span>
                    </div>
                  ))}
                </div>
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
            disabled={isUpdating}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-70 shadow-md"
          >
            {isUpdating ? (
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
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
  Scale,
  CheckCircle2, // Icon cho nhãn "Đại diện" ở dưới
  Check, // Icon cho nút chọn ở góc trên
} from "lucide-react";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/redux/services/productApi";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi";

export default function UpdateProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  // Hooks API
  const { data: productData, isLoading: isFetching, isError } = useGetProductByIdQuery(productId, { skip: !productId });
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  // --- STATE QUẢN LÝ ---
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "",
    categoryId: "",
  });

  // State quản lý ảnh
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);
  
  // State URL ảnh đại diện hiện tại
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string>("");

  // --- USE EFFECT: LOAD DATA ---
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name || "",
        description: productData.description || "",
        price: productData.price.toString(),
        stock: productData.stock.toString(),
        unit: productData.unit || "",
        categoryId: productData.category?.id?.toString() || "",
      });

      if (productData.indexImage) {
        setCurrentAvatarUrl(productData.indexImage);
      }

      if (productData.mediaList && productData.mediaList.length > 0) {
        setExistingImages(productData.mediaList);
      } else {
        setExistingImages([]);
      }
    }
  }, [productData]);

  // --- HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const removeExistingImage = (mediaId: number, index: number, secureUrl: string) => {
    setImagesToDelete((prev) => [...prev, mediaId]);
    const updatedExisting = [...existingImages];
    updatedExisting.splice(index, 1);
    setExistingImages(updatedExisting);

    // Nếu xóa đúng ảnh đang làm đại diện -> Reset state
    if (secureUrl === currentAvatarUrl) {
        setCurrentAvatarUrl("");
    }
  };

  // Chọn ảnh cũ làm ảnh đại diện mới (Thông qua nút bấm)
  const handleSetAvatar = (url: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan ra ngoài
    setCurrentAvatarUrl(url);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCat = categories.find((c) => c.id === Number(formData.categoryId));
    if (!selectedCat) {
      alert("Vui lòng chọn danh mục hợp lệ!");
      return;
    }

    try {
      const formPayload = new FormData();

      const productRequest = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        unit: formData.unit,
        category: {
          categoryName: selectedCat.categoryName,
          description: selectedCat.description,
        },
        // Gửi URL ảnh đại diện lên Server để backend check và set
        indexImage: currentAvatarUrl, 
        
        mediaUploadRequests: [],
        imageIdsToDelete: imagesToDelete,
      };

      formPayload.append("product", JSON.stringify(productRequest));

      if (newFiles.length > 0) {
        newFiles.forEach((file) => {
          formPayload.append("image", file);
        });
      }

      await updateProduct({ id: productId, data: formPayload }).unwrap();

      alert("Cập nhật sản phẩm thành công!");
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      alert("Lỗi: " + (error?.data?.message || "Không thể cập nhật sản phẩm"));
    }
  };

  if (isFetching) return <div className="flex justify-center h-96 items-center"><Loader2 className="animate-spin text-green-600 w-10 h-10" /></div>;
  if (isError) return <div className="text-center py-20 text-red-500">Không tìm thấy sản phẩm.</div>;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cập nhật sản phẩm</h1>
          <p className="text-sm text-gray-500">Chỉnh sửa thông tin sản phẩm #{productId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CỘT TRÁI: Thông tin text */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" /> Thông tin chung
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white text-gray-900" required disabled={isLoadingCategories}>
                  <option value="">{isLoadingCategories ? "Đang tải..." : "-- Chọn danh mục --"}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-green-600" /> Giá & Tồn kho</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán <span className="text-red-500">*</span></label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-gray-900" required />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} list="unit-suggestions" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900" required />
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <datalist id="unit-suggestions"><option value="Hộp" /><option value="Gói" /><option value="Chai" /><option value="Kg" /><option value="Cái" /></datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho <span className="text-red-500">*</span></label>
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg text-gray-900" required />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: Hình ảnh */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-green-600" /> Hình ảnh</h2>

            {/* Upload Area */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Thêm ảnh mới vào Album</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            {/* List ảnh cũ */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium text-gray-700">Ảnh hiện tại:</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {existingImages.map((media, index) => {
                    const isAvatar = media.secureUrl === currentAvatarUrl;
                    return (
                        <div 
                            key={media.id} 
                            // Nếu là avatar -> viền xanh lá. Nếu không -> viền thường.
                            className={`relative group aspect-square rounded-lg overflow-hidden border-2 transition-all ${isAvatar ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}`}
                        >
                            <img src={media.secureUrl} className="w-full h-full object-cover" />
                            
                            {/* --- NÚT XÓA (Góc trên phải) --- */}
                            <button 
                                type="button" 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeExistingImage(media.id, index, media.secureUrl)
                                }}
                                className="absolute top-1 right-1 bg-white/90 p-1.5 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all z-20"
                                title="Xóa ảnh này"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            {/* --- NÚT CHỌN ĐẠI DIỆN (Góc trên trái) - Chỉ hiện nếu chưa phải là đại diện --- */}
                            {!isAvatar && (
                                <button 
                                    type="button"
                                    // Gọi hàm chọn đại diện khi click
                                    onClick={(e) => handleSetAvatar(media.secureUrl, e)}
                                    className="absolute top-1 left-1 bg-white/90 p-1.5 rounded-full text-gray-400 shadow-sm opacity-0 group-hover:opacity-100 hover:bg-green-100 hover:text-green-600 transition-all z-20"
                                    title="Đặt làm ảnh đại diện"
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            )}
                            
                            {/* Nhãn "Đại diện" ở dưới đáy (Chỉ hiện khi đã chọn) */}
                            {isAvatar && (
                                <div className="absolute inset-x-0 bottom-0 bg-green-500/90 py-1 flex justify-center items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Đại diện</span>
                                </div>
                            )}
                        </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* List ảnh mới thêm */}
            {newPreviewUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ảnh mới chờ lưu:</p>
                <div className="grid grid-cols-2 gap-2">
                  {newPreviewUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-dashed border-gray-300 bg-gray-50">
                      <img src={url} className="w-full h-full object-cover opacity-80" />
                      <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 hover:bg-white"><X className="w-4 h-4" /></button>
                      <span className="absolute bottom-1 right-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">Mới</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400 mt-2 italic">* Lưu ý: Bạn cần "Lưu thay đổi" để ảnh mới được tải lên, sau đó mới có thể chọn làm ảnh đại diện.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700">Hủy bỏ</button>
          <button type="submit" disabled={isUpdating} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-70 shadow-sm transition-all">
            {isUpdating ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...</> : <><Save className="w-5 h-5" /> Lưu thay đổi</>}
          </button>
        </div>
      </form>
    </div>
  );
}
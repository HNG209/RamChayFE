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
  CheckCircle2, // Icon cho nhãn "Đại diện"
  Check, // Icon nút chọn
  Trash2, // Icon nút xóa
  ListFilter, // Icon danh mục
  AlertTriangle,
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
        price: productData.price ? productData.price.toString() : "0",
        stock: productData.stock ? productData.stock.toString() : "0",
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

  // Chọn ảnh cũ làm ảnh đại diện mới
  const handleSetAvatar = (url: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    setCurrentAvatarUrl(url);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCat = categories.find((c: any) => c.id === Number(formData.categoryId));
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
        categoryId: Number(formData.categoryId),
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

  if (isFetching) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-green-600 w-10 h-10 mb-2" />
        <p className="text-gray-500 text-sm">Đang tải dữ liệu sản phẩm...</p>
    </div>
  );
  
  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
        <AlertTriangle className="w-10 h-10 mb-2" />
        <p>Không tìm thấy thông tin sản phẩm.</p>
        <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Quay lại</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-all shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cập nhật sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Chỉnh sửa thông tin chi tiết sản phẩm #{productId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI: THÔNG TIN (8/12) */}
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
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/30 focus:bg-white text-gray-900 font-medium transition-all" 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Danh mục Full width */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Danh mục <span className="text-red-500">*</span>
                    </label>
                    <div className="relative w-full">
                        <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        <select 
                            name="categoryId" 
                            value={formData.categoryId} 
                            onChange={handleInputChange} 
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-gray-50/30 focus:bg-white text-gray-900 appearance-none transition-all" 
                            required 
                            disabled={isLoadingCategories}
                        >
                            <option value="">{isLoadingCategories ? "Đang tải..." : "-- Chọn danh mục --"}</option>
                            {categories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả</label>
                  <textarea 
                    name="description" 
                    rows={5} 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none text-gray-900 bg-gray-50/30 focus:bg-white transition-all" 
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
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Giá bán <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                        type="number" 
                        name="price" 
                        value={formData.price} 
                        onChange={handleInputChange} 
                        className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 font-medium bg-gray-50/30 focus:bg-white transition-all" 
                        required 
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span className="text-gray-500 font-bold">đ</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đơn vị tính <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input 
                        type="text" 
                        name="unit" 
                        value={formData.unit} 
                        onChange={handleInputChange} 
                        list="unit-suggestions" 
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 bg-gray-50/30 focus:bg-white transition-all" 
                        required 
                    />
                    <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <datalist id="unit-suggestions">
                        <option value="Hộp" /><option value="Gói" /><option value="Chai" /><option value="Kg" /><option value="Cái" />
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tồn kho <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock} 
                    onChange={handleInputChange} 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900 bg-gray-50/30 focus:bg-white transition-all" 
                    required 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: HÌNH ẢNH (4/12) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-4 border-b border-gray-100">
                <ImageIcon className="w-5 h-5 text-green-600" /> 
                Hình ảnh
              </h2>

              {/* Upload Area */}
              <div className="mb-6">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-green-50 hover:border-green-400 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-2 pb-3">
                    <div className="p-2 bg-gray-100 rounded-full mb-2 group-hover:bg-green-100 transition-colors">
                        <Upload className="w-5 h-5 text-gray-500 group-hover:text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 font-medium">Thêm ảnh mới</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (Max 5MB)</p>
                  </div>
                  <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              {/* List ảnh hiện tại */}
              <div className="flex-1 space-y-6 overflow-y-auto">
                {existingImages.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                             <p className="text-sm font-bold text-gray-700">Ảnh hiện tại</p>
                             <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{existingImages.length} ảnh</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {existingImages.map((media, index) => {
                                const isAvatar = media.secureUrl === currentAvatarUrl;
                                return (
                                    <div 
                                        key={media.id} 
                                        className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all shadow-sm ${isAvatar ? 'border-green-500 ring-2 ring-green-100' : 'border-transparent hover:border-gray-200'}`}
                                    >
                                        <img src={media.secureUrl} className="w-full h-full object-cover" alt="Product" />
                                        
                                        {/* Overlay Actions */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                            <div className="flex justify-between w-full">
                                                {/* Chọn đại diện */}
                                                {!isAvatar && (
                                                    <button type="button" onClick={(e) => handleSetAvatar(media.secureUrl, e)} className="bg-white/90 p-1.5 rounded-full text-gray-500 hover:text-green-600 hover:bg-white hover:scale-110 transition-all" title="Đặt làm ảnh đại diện">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <div className="flex-1"></div>
                                                {/* Xóa */}
                                                <button type="button" onClick={(e) => { e.stopPropagation(); removeExistingImage(media.id, index, media.secureUrl)}} className="bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-white hover:scale-110 transition-all" title="Xóa ảnh này">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Badge Đại diện */}
                                        {isAvatar && (
                                            <div className="absolute inset-x-0 bottom-0 bg-green-500/90 py-1 flex justify-center items-center gap-1 backdrop-blur-sm">
                                                <CheckCircle2 className="w-3 h-3 text-white" />
                                                <span className="text-[9px] font-bold text-white uppercase tracking-wider">Đại diện</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* List ảnh mới */}
                {newPreviewUrls.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-blue-600">Ảnh mới chờ lưu</p>
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">+{newPreviewUrls.length}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {newPreviewUrls.map((url, index) => (
                                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-dashed border-blue-300 bg-blue-50/50">
                                    <img src={url} className="w-full h-full object-cover opacity-90" alt="New Preview" />
                                    <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-white p-1 rounded-full text-red-500 shadow-sm hover:scale-110 transition-transform">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-yellow-700">Lưu thay đổi để tải ảnh mới lên server. Sau đó bạn mới có thể chọn chúng làm ảnh đại diện.</p>
                        </div>
                    </div>
                )}
              </div>
            </div>
          </div>

           {/* FOOTER BUTTONS - Nằm ở dưới cùng form */}
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
                disabled={isUpdating} 
                className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-green-600 text-white hover:bg-green-700 disabled:opacity-70 font-medium shadow-sm transition-all hover:shadow-md"
             >
                {isUpdating ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                <span>Lưu thay đổi</span>
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
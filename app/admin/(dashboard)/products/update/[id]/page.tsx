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
} from "lucide-react";
import {
  useGetProductByIdQuery,
  useUpdateProductMutation,
} from "@/redux/services/productApi";
import { useGetCategoriesQuery } from "@/redux/services/categoryApi"; // Import Hook Category

export default function UpdateProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);

  // 1. Hook lấy dữ liệu sản phẩm
  const { data: productData, isLoading: isFetching, isError } = useGetProductByIdQuery(productId, { skip: !productId });

  // 2. Hook lấy danh sách danh mục (REAL DATA)
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();

  // 3. Hook cập nhật
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    unit: "",
    categoryId: "",
  });

  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([]);

  // Load dữ liệu cũ vào Form
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name,
        description: productData.description,
        price: productData.price.toString(),
        stock: productData.stock.toString(),
        unit: productData.unit || "",
        // Chú ý: Backend trả về object category, ta lấy ID để set vào Select box
        categoryId: productData.category?.id?.toString() || "",
      });

      if (productData.mediaList && productData.mediaList.length > 0) {
        setExistingImages(productData.mediaList);
      } else {
        setExistingImages([]);
      }
    }
  }, [productData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ... (Giữ nguyên các hàm xử lý ảnh: handleImageChange, removeNewImage, removeExistingImage) ...
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

  const removeExistingImage = (mediaId: number, index: number) => {
    setImagesToDelete((prev) => [...prev, mediaId]);
    const updatedExisting = [...existingImages];
    updatedExisting.splice(index, 1);
    setExistingImages(updatedExisting);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Tìm Category trong danh sách thật
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
          categoryName: selectedCat.categoryName, // Gửi tên chuẩn
          description: selectedCat.description,
        },
        imageUrl: "",
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
        {/* CỘT TRÁI */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" /> Thông tin chung
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder-gray-400 text-gray-900" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea name="description" rows={4} value={formData.description} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none placeholder-gray-400 text-gray-900" />
              </div>

              {/* SELECT CATEGORY THẬT */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục <span className="text-red-500">*</span></label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white placeholder-gray-400 text-gray-900"
                  required
                  disabled={isLoadingCategories}
                >
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
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900" required />
              </div>
              {/* Đơn vị tính */}
              <div className="sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type="text" name="unit" value={formData.unit} onChange={handleInputChange} placeholder="Vd: Kg" list="unit-suggestions" className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-gray-900" required />
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <datalist id="unit-suggestions">
                    <option value="Hộp" /><option value="Gói" /><option value="Chai" /><option value="Kg" /><option value="Cái" />
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho <span className="text-red-500">*</span></label>
                <input type="number" name="stock" value={formData.stock} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg placeholder-gray-400 text-gray-900" required />
              </div>

            </div>
          </div>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-green-600" /> Hình ảnh</h2>

            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-xs text-gray-500">Thêm ảnh mới</p>
                </div>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
              </label>
            </div>

            {existingImages.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Ảnh hiện tại:</p>
                <div className="grid grid-cols-2 gap-2">
                  {existingImages.map((media, index) => (
                    <div key={media.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={media.secureUrl} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeExistingImage(media.id, index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-white"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newPreviewUrls.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Ảnh mới thêm:</p>
                <div className="grid grid-cols-2 gap-2">
                  {newPreviewUrls.map((url, index) => (
                    <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeNewImage(index)} className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 hover:bg-white"><X className="w-4 h-4" /></button>
                      <span className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1 rounded">Mới</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50">Hủy bỏ</button>
          <button type="submit" disabled={isUpdating} className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-70">
            {isUpdating ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang lưu...</> : <><Save className="w-5 h-5" /> Lưu thay đổi</>}
          </button>
        </div>
      </form>
    </div>
  );
}
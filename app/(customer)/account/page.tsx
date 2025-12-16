"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit2,
  Save,
  X,
  LogOut,
  ShoppingBag,
  Heart,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

type Address = {
  id: number;
  city: string;
  ward: string;
  street?: string;
  personalAddress: string;
  fullAddress?: string;
};

function AddressModal({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  initial?: Address;
}) {
  const [form, setForm] = useState<Address>(
    initial || {
      id: Date.now(),
      city: "",
      ward: "",
      street: "",
      personalAddress: "",
      fullAddress: "",
    }
  );

  // Reset form when modal opens for new address
  useEffect(() => {
    if (open) {
      setForm(
        initial || {
          id: Date.now(),
          city: "",
          ward: "",
          street: "",
          personalAddress: "",
          fullAddress: "",
        }
      );
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold mb-4">
          {initial ? "Sửa địa chỉ" : "Thêm địa chỉ"}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Thành phố</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phường/Xã</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.ward}
              onChange={(e) => setForm({ ...form, ward: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Đường (tuỳ chọn)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.street || ""}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Địa chỉ chi tiết
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.personalAddress}
              onChange={(e) =>
                setForm({ ...form, personalAddress: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Địa chỉ đầy đủ (tuỳ chọn)
            </label>
            <input
              className="w-full border rounded px-3 py-2"
              value={form.fullAddress || ""}
              onChange={(e) =>
                setForm({ ...form, fullAddress: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            className="px-4 py-2 rounded bg-chocolate text-white hover:bg-chocolate/90"
            onClick={() => {
              if (!form.city || !form.ward || !form.personalAddress) return;
              onSave(form);
              onClose();
            }}
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);

  // Địa chỉ mẫu nếu user.addresses chưa có
  const initialAddresses: Address[] =
    user?.addresses && user?.addresses?.length > 0 ? user.addresses : [];

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phones: user?.phones?.length ? [...user.phones] : [""],
    email: user?.email || "",
    addresses: initialAddresses.length ? [...initialAddresses] : [],
  });

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddressIdx, setEditingAddressIdx] = useState<number | null>(
    null
  );

  // Redirect if not logged in
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSave = () => {
    // TODO: Call API to update user info
    console.log("Updating user info:", formData);
    setIsEditing(false);
    // Sau này sẽ gọi API update user
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || "",
      phones: user?.phones?.length ? [...user.phones] : [""],
      email: user?.email || "",
      addresses: user?.addresses?.length ? [...user.addresses] : [],
    });
    setIsEditing(false);
  };

  // Thêm địa chỉ mới
  const handleAddAddress = (address: Address) => {
    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, address],
    }));
  };

  // Sửa địa chỉ
  const handleEditAddress = (address: Address) => {
    if (editingAddressIdx === null) return;
    setFormData((prev) => {
      const newAddresses = [...prev.addresses];
      newAddresses[editingAddressIdx] = address;
      return { ...prev, addresses: newAddresses };
    });
    setEditingAddressIdx(null);
  };

  // Xóa địa chỉ
  const handleDeleteAddress = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-green-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-chocolate to-amber-700 bg-clip-text text-transparent mb-2">
            Tài khoản của tôi
          </h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và đơn hàng</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-6">
              {/* Avatar */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-linear-to-br from-chocolate to-amber-700 text-white mb-4">
                  <User className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {user.fullName || user.username}
                </h3>
                <p className="text-sm text-gray-500">@{user.username}</p>
              </div>

              {/* Menu */}
              <nav className="space-y-2">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-chocolate/10 text-chocolate font-semibold transition-colors"
                >
                  <User className="w-5 h-5" />
                  Thông tin tài khoản
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 font-medium transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  Yêu thích
                </Link>
                <button
                  onClick={() => {
                    // TODO: Implement logout
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Đăng xuất
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-8">
              {/* Header with Edit Button */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-gray-100">
                <h2 className="text-2xl font-bold text-gray-800">
                  Thông tin cá nhân
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-chocolate text-white rounded-xl hover:bg-chocolate/90 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Lưu
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Hủy
                    </button>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-chocolate" />
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 outline-none transition-all"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg font-medium">
                      {user.fullName || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <User className="w-4 h-4 text-chocolate" />
                    Tên đăng nhập
                  </label>
                  <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">
                    @{user.username}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Tên đăng nhập không thể thay đổi
                  </p>
                </div>

                {/* Phones */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-chocolate" />
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {formData.phones.map((phone, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                              const newPhones = [...formData.phones];
                              newPhones[idx] = e.target.value;
                              setFormData({ ...formData, phones: newPhones });
                            }}
                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 outline-none transition-all"
                          />
                          {formData.phones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newPhones = formData.phones.filter(
                                  (_, i) => i !== idx
                                );
                                setFormData({ ...formData, phones: newPhones });
                              }}
                              className="text-red-500 px-2"
                              title="Xóa"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            phones: [...formData.phones, ""],
                          })
                        }
                        className="mt-2 px-3 py-1 bg-green-100 text-chocolate rounded hover:bg-green-200 text-sm"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Thêm số điện thoại
                      </button>
                    </div>
                  ) : (
                    <ul className="list-disc pl-5">
                      {user.phones?.map((phone, idx) => (
                        <li
                          key={idx}
                          className="text-gray-800 text-lg font-medium"
                        >
                          {phone}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Mail className="w-4 h-4 text-chocolate" />
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 outline-none transition-all"
                      placeholder="example@gmail.com"
                    />
                  ) : (
                    <p className="text-gray-800 text-lg font-medium">
                      {user.email || "Chưa cập nhật"}
                    </p>
                  )}
                </div>

                {/* Addresses */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-chocolate" />
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      {formData.addresses.length === 0 && (
                        <p className="text-gray-500 text-sm">
                          Chưa có địa chỉ nào.
                        </p>
                      )}
                      {formData.addresses.map((address, idx) => (
                        <div
                          key={address.id}
                          className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center gap-2 bg-green-50/50"
                        >
                          <div className="flex-1">
                            <div className="font-semibold text-chocolate">
                              {address.fullAddress ||
                                `${address.personalAddress}, ${
                                  address.street ? address.street + ", " : ""
                                }${address.ward}, ${address.city}`}
                            </div>
                            <div className="text-sm text-gray-700">
                              <span className="block">
                                <b>Thành phố:</b> {address.city}
                              </span>
                              <span className="block">
                                <b>Phường/Xã:</b> {address.ward}
                              </span>
                              {address.street && (
                                <span className="block">
                                  <b>Đường:</b> {address.street}
                                </span>
                              )}
                              <span className="block">
                                <b>Địa chỉ chi tiết:</b>{" "}
                                {address.personalAddress}
                              </span>
                              {address.fullAddress && (
                                <span className="block">
                                  <b>Địa chỉ đầy đủ:</b> {address.fullAddress}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="p-2 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-700"
                              onClick={() => {
                                setEditingAddressIdx(idx);
                                setModalOpen(true);
                              }}
                              title="Sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              className="p-2 rounded bg-red-100 hover:bg-red-200 text-red-700"
                              onClick={() => handleDeleteAddress(idx)}
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressIdx(null);
                          setModalOpen(true);
                        }}
                        className="mt-2 px-3 py-1 bg-green-100 text-chocolate rounded hover:bg-green-200 text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 inline mr-1" />
                        Thêm địa chỉ
                      </button>
                    </div>
                  ) : (
                    <ul className="list-disc pl-5">
                      {user.addresses?.length ? (
                        user.addresses.map((address: Address, idx: number) => (
                          <li key={address.id} className="mb-2">
                            <div className="font-semibold text-chocolate">
                              {address.fullAddress ||
                                `${address.personalAddress}, ${
                                  address.street ? address.street + ", " : ""
                                }${address.ward}, ${address.city}`}
                            </div>
                            <div className="text-sm text-gray-700">
                              <span className="block">
                                <b>Thành phố:</b> {address.city}
                              </span>
                              <span className="block">
                                <b>Phường/Xã:</b> {address.ward}
                              </span>
                              {address.street && (
                                <span className="block">
                                  <b>Đường:</b> {address.street}
                                </span>
                              )}
                              <span className="block">
                                <b>Địa chỉ chi tiết:</b>{" "}
                                {address.personalAddress}
                              </span>
                              {address.fullAddress && (
                                <span className="block">
                                  <b>Địa chỉ đầy đủ:</b> {address.fullAddress}
                                </span>
                              )}
                            </div>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-500 text-sm">
                          Chưa có địa chỉ nào.
                        </li>
                      )}
                    </ul>
                  )}
                </div>

                {/* Account Created */}
                <div className="pt-4 border-t-2 border-gray-100">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-chocolate" />
                    Ngày tham gia
                  </label>
                  <p className="text-gray-600">Tháng 12, 2024</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-xl shadow-md border border-green-200 p-4 text-center">
                <ShoppingBag className="w-8 h-8 text-chocolate mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="text-sm text-gray-600">Đơn hàng</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-green-200 p-4 text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">0</p>
                <p className="text-sm text-gray-600">Yêu thích</p>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-green-200 p-4 text-center">
                <User className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-800">Mới</p>
                <p className="text-sm text-gray-600">Thành viên</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal cho địa chỉ */}
      <AddressModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingAddressIdx(null);
        }}
        onSave={(address) => {
          if (editingAddressIdx === null) {
            handleAddAddress(address);
          } else {
            handleEditAddress(address);
          }
        }}
        initial={
          editingAddressIdx !== null
            ? formData.addresses[editingAddressIdx]
            : undefined
        }
      />
    </div>
  );
}

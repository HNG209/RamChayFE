"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, LogOut, ShoppingBag, Heart } from "lucide-react"
import Link from "next/link"

export default function AccountPage() {
    const router = useRouter()
    const user = useSelector((state: RootState) => state.auth.user)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        email: user?.email || "",
        address: ""
    })

    // Redirect if not logged in
    if (!user) {
        router.push("/login")
        return null
    }

    const handleSave = () => {
        // TODO: Call API to update user info
        console.log("Updating user info:", formData)
        setIsEditing(false)
        // Sau này sẽ gọi API update user
    }

    const handleCancel = () => {
        setFormData({
            fullName: user?.fullName || "",
            phone: user?.phone || "",
            email: user?.email || "",
            address: ""
        })
        setIsEditing(false)
    }

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
                                <h3 className="text-xl font-bold text-gray-800">{user.fullName}</h3>
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
                                    href="/orders"
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-50 text-gray-700 font-medium transition-colors"
                                >
                                    <ShoppingBag className="w-5 h-5" />
                                    Đơn hàng của tôi
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
                                        router.push("/login")
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
                                <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
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
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 outline-none transition-all"
                                        />
                                    ) : (
                                        <p className="text-gray-800 text-lg font-medium">{user.fullName}</p>
                                    )}
                                </div>

                                {/* Username */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <User className="w-4 h-4 text-chocolate" />
                                        Tên đăng nhập
                                    </label>
                                    <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-xl">@{user.username}</p>
                                    <p className="text-xs text-gray-500 mt-1">Tên đăng nhập không thể thay đổi</p>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 text-chocolate" />
                                        Số điện thoại
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 outline-none transition-all"
                                        />
                                    ) : (
                                        <p className="text-gray-800 text-lg font-medium">{user.phone}</p>
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
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 outline-none transition-all"
                                            placeholder="example@gmail.com"
                                        />
                                    ) : (
                                        <p className="text-gray-800 text-lg font-medium">{user.email || "Chưa cập nhật"}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                        <MapPin className="w-4 h-4 text-chocolate" />
                                        Địa chỉ
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-4 py-3 border-2 border-green-200 rounded-xl focus:border-chocolate focus:ring-4 focus:ring-chocolate/20 outline-none transition-all resize-none"
                                            rows={3}
                                            placeholder="Nhập địa chỉ của bạn"
                                        />
                                    ) : (
                                        <p className="text-gray-800 text-lg font-medium">{formData.address || "Chưa cập nhật"}</p>
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
        </div>
    )
}

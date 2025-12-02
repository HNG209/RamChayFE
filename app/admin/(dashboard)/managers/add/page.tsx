"use client"
import { useState } from "react"
import type React from "react"

import { ChevronLeft, Save, Eye, EyeOff, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCreateManagerMutation } from "@/redux/services/managerApi"

export default function AddManagerPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [createManager, { isLoading }] = useCreateManagerMutation()

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    status: "Active",
    roleId: 1
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createManager({ ...formData, active: formData.status === "Active" ? 1 : 0 }).unwrap()
      router.push("/admin/managers")
    } catch (error: any) {
      console.error("Create manager error:", error)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => router.push("/admin/managers")}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold">Thêm mới Quản lý</h1>
            <p className="text-sm text-muted-foreground">Tạo một tài khoản quản lý mới trong hệ thống</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-card rounded-lg border border-[#e0e8df]/50 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Họ và tên</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ"
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Tên đăng nhập</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập tên đăng nhập"
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Trạng thái</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-[#e0e8df] rounded-lg bg-input focus:outline-none focus:ring-2 focus:ring-[#5AB66B]/50 transition-all"
              >
                <option value="Active">Hoạt động</option>
                <option value="Inactive">Không hoạt động</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-[#e0e8df]">
              <button
                type="button"
                onClick={() => router.push("/admin/managers")}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 border border-[#e0e8df] rounded-lg text-foreground hover:bg-[#f0f9eb] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#5AB66B] hover:bg-[#4a9c5a] text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Lưu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}

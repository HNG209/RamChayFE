"use client"

import type React from "react"
import type { RootState } from "@/redux/store"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Package, ShoppingCart, Users, TrendingUp, BarChart3, Leaf, Settings, Sparkles } from "lucide-react"
import "./welcome.css"

export default function AdminWelcomePage() {
  const user = useSelector((state: RootState) => state.auth.user)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (user?.roles.includes("ROLE_CUSTOMER")) router.push("/")
    setMounted(true)
  }, [user, router])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Chào buổi sáng"
    if (hour < 18) return "Chào buổi chiều"
    return "Chào buổi tối"
  }

  const floatingStickers = [
    { emoji: "🥗", delay: 0 },
    { emoji: "🥕", delay: 0.2 },
    { emoji: "🌱", delay: 0.4 },
    { emoji: "🍅", delay: 0.6 },
    { emoji: "🥦", delay: 0.8 },
    { emoji: "🌿", delay: 1 },
    { emoji: "🥒", delay: 1.2 },
    { emoji: "🍃", delay: 1.4 },
  ]

  if (!mounted) return null

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-lime-50 via-white to-green-50 -z-20" />

      <div className="absolute inset-0 opacity-40 -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {floatingStickers.map((sticker, index) => (
          <div
            key={index}
            className="floating-sticker"
            style={
              {
                "--delay": `${sticker.delay}s`,
                "--duration": `${15 + index * 2}s`,
                "--offset": `${(index * 45) % 360}deg`,
              } as React.CSSProperties
            }
          >
            <span className="text-4xl select-none">{sticker.emoji}</span>
          </div>
        ))}
      </div>

      <div className="max-w-5xl w-full space-y-8 md:space-y-12 relative z-10">
        <div className="text-center space-y-6 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-lime-200 to-green-200 rounded-full shadow-xl animate-bounce-slow">
              <Leaf className="w-12 h-12 text-lime-700" />
            </div>
            <div className="animate-pulse">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-lime-600 via-green-600 to-lime-600 animate-text-shimmer">
              {getGreeting()}, {user?.fullName || user?.username}!
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 font-medium">Chào mừng đến với RamChay Admin</p>
          </div>

          <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Quản lý cửa hàng chay của bạn một cách hiệu quả. Chọn một chức năng bên dưới để bắt đầu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div style={{ "--card-delay": "0s" } as React.CSSProperties}>
            <FeatureCard
              title="Quản lý sản phẩm"
              description="Thêm, chỉnh sửa và quản lý danh mục sản phẩm chay"
              icon={Package}
              color="from-lime-400 to-lime-600"
              href="/admin/products"
              emoji="📦"
            />
          </div>
          <div style={{ "--card-delay": "0.1s" } as React.CSSProperties}>
            <FeatureCard
              title="Quản lý đơn hàng"
              description="Xử lý và theo dõi đơn hàng của khách hàng"
              icon={ShoppingCart}
              color="from-orange-400 to-orange-600"
              href="/admin/orders"
              emoji="🛒"
            />
          </div>
          <div style={{ "--card-delay": "0.2s" } as React.CSSProperties}>
            <FeatureCard
              title="Quản lý người dùng"
              description="Xem và quản lý danh sách khách hàng"
              icon={Users}
              color="from-blue-400 to-blue-600"
              href="/admin/users"
              emoji="👥"
            />
          </div>
          <div style={{ "--card-delay": "0.3s" } as React.CSSProperties}>
            <FeatureCard
              title="Tổng quan kinh doanh"
              description="Xem thống kê và báo cáo chi tiết"
              icon={BarChart3}
              color="from-purple-400 to-purple-600"
              href="/admin/dashboard"
              emoji="📊"
            />
          </div>
          <div style={{ "--card-delay": "0.4s" } as React.CSSProperties}>
            <FeatureCard
              title="Phân tích doanh thu"
              description="Theo dõi doanh thu và xu hướng bán hàng"
              icon={TrendingUp}
              color="from-green-400 to-green-600"
              href="/admin/reports"
              emoji="📈"
            />
          </div>
          <div style={{ "--card-delay": "0.5s" } as React.CSSProperties}>
            <FeatureCard
              title="Cài đặt hệ thống"
              description="Cấu hình và tùy chỉnh cửa hàng"
              icon={Settings}
              color="from-gray-400 to-gray-600"
              href="/admin/settings"
              emoji="⚙️"
            />
          </div>
        </div>

        <div className="text-center pt-12 border-t border-gray-200 animate-fade-in-up animation-delay-300">
          <p className="text-sm text-gray-500">
            Hệ thống quản trị RamChay © 2025 | Chuyên cung cấp thực phẩm chay sạch
          </p>
        </div>
      </div>
    </div>
  )
}

// --- COMPONENT CON ---

interface FeatureCardProps {
  title: string
  description: string
  icon: any
  color: string
  href: string
  emoji: string
}

function FeatureCard({ title, description, icon: Icon, color, href, emoji }: FeatureCardProps) {
  return (
    <a
      href={href}
      className="feature-card group relative h-full bg-white/80 backdrop-blur-lg p-6 md:p-8 rounded-2xl shadow-lg border border-white/50 hover:shadow-2xl hover:border-lime-200 transition-all duration-300 hover:-translate-y-2 hover:bg-white/95 overflow-hidden"
    >
      <div
        className={`absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-full blur-3xl`}
      />

      <div className="relative flex flex-col items-center text-center space-y-4 h-full justify-between">
        <div className="text-5xl group-hover:scale-125 transition-transform duration-300 group-hover:rotate-12">
          {emoji}
        </div>

        <div
          className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}
        >
          <Icon className="w-8 h-8" />
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <h3 className="font-bold text-lg md:text-xl text-gray-800 group-hover:text-lime-700 transition-colors mb-2">
            {title}
          </h3>
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">{description}</p>
        </div>

        <div className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
          →
        </div>
      </div>
    </a>
  )
}

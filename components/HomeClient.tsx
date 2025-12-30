import Image from "next/image";
import Link from "next/link";
import {
  Leaf,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function HomeClient({ products }: { products: any }) {
  const featuredProducts = products.slice(0, 4);

  const categories = [
    { name: "Rau Củ Tươi", image: "/raucu.png", count: "50+ sản phẩm" },
    { name: "Đậu & Hạt", image: "/dauvahat.png", count: "30+ sản phẩm" },
    { name: "Nấm Các Loại", image: "/nam.png", count: "20+ sản phẩm" },
    { name: "Gia Vị Chay", image: "/giavichay.png", count: "40+ sản phẩm" },
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 to-white relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden text-white min-h-[600px] md:min-h-[700px]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src="/Background-vegan-home.png"
            alt="Vegan Kitchen Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                <Leaf className="w-5 h-5" />
                <span className="text-sm font-medium">
                  100% Tự Nhiên & Chay
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Nguyên Liệu Chay
                <span className="block text-green-200">Tươi Ngon Mỗi Ngày</span>
              </h1>
              <p className="text-lg md:text-xl text-green-100">
                Khám phá kho nguyên liệu chay đa dạng, tươi ngon và an toàn cho
                sức khỏe.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 bg-white text-green-600 px-8 py-4 rounded-full font-semibold hover:bg-green-50 transition-all hover:scale-105 shadow-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Mua Ngay
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all"
                >
                  Tìm Hiểu Thêm
                </Link>
              </div>
            </div>
            <div className="relative hidden md:flex items-center justify-center rounded-3xl border-4 border-white/30 shadow-2xl p-6 bg-white/20 backdrop-blur-sm">
              <Image
                src="/vegan-food-1.png"
                alt="Fresh vegetables"
                width={600}
                height={600}
                className="drop-shadow-2xl rounded-2xl object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-20 overflow-hidden mt-8">
        {/* Separator Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-green-300 to-transparent"></div>

        {/* Background Image */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image
            src="/Background-vegan-footer-2.png"
            alt="Features Background"
            fill
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-white/75"></div>
        </div>

        <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Leaf,
                title: "100% Organic",
                desc: "Nguyên liệu hữu cơ, không hóa chất",
              },
              {
                icon: TrendingUp,
                title: "Giá Tốt Nhất",
                desc: "Cam kết giá cạnh tranh",
              },
              {
                icon: Award,
                title: "Chất Lượng Đảm Bảo",
                desc: "Kiểm tra nghiêm ngặt",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center space-y-4 p-6 rounded-2xl hover:bg-green-50 transition-colors group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full group-hover:scale-110 transition-transform">
                  <item.icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="relative py-20 overflow-hidden mt-8">
        {/* Separator Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-green-300 to-transparent"></div>

        {/* Background Image */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image
            src="/Background-vegan-home.png"
            alt="Categories Background"
            fill
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-white/10"></div>
        </div>

        <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Danh Mục Sản Phẩm
            </h2>
            <p className="text-lg text-gray-600">
              Khám phá đa dạng nguyên liệu chay chất lượng
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <Link
                key={i}
                href="/products"
                className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border-2 border-green-200 hover:border-green-400"
              >
                <div className="aspect-square relative bg-linear-to-br from-green-50 to-lime-50">
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-green-600/30 to-transparent"></div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm">
                  <h3 className="font-bold text-lg text-gray-800">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-green-600 font-medium">
                    {cat.count}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="relative py-20 overflow-hidden mt-8">
        {/* Separator Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-green-300 to-transparent"></div>

        {/* Background Image */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image
            src="/Background-vegan-footer-2.png"
            alt="Products Background"
            fill
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-white/10"></div>
        </div>

        <div className="container mx-auto px-4 relative" style={{ zIndex: 1 }}>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Sản Phẩm Nổi Bật
              </h2>
              <p className="text-lg text-gray-600">
                Những sản phẩm được yêu thích nhất
              </p>
            </div>
            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 text-green-600 font-semibold hover:gap-4 transition-all"
            >
              Xem tất cả <Sparkles className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 text-white overflow-hidden mt-8">
        {/* Separator Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-linear-to-r from-transparent via-green-300 to-transparent"></div>

        {/* Background Image */}
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
          <Image
            src="/Background-vegan-footer-2.png"
            alt="CTA Background"
            fill
            className="object-cover"
            quality={100}
          />
          <div className="absolute inset-0 bg-green-900/60"></div>
        </div>

        <div
          className="container mx-auto px-4 text-center relative"
          style={{ zIndex: 1 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Bắt Đầu Hành Trình Ăn Chay Ngay Hôm Nay
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Khám phá hàng trăm nguyên liệu chay tươi ngon, an toàn và dinh dưỡng
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-green-600 px-10 py-5 rounded-full font-bold text-lg hover:bg-green-50 transition-all hover:scale-105 shadow-2xl"
          >
            <ShoppingBag className="w-6 h-6" />
            Khám Phá Ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

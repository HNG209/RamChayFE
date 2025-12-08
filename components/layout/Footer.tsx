import Link from "next/link"
import { Facebook, Instagram, Mail, MapPin, Phone, Leaf } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="relative border-t-2 border-emerald-300 overflow-visible min-h-[350px]">
      {/* Background Image */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <Image
          src="/Background-vegan-footer-2.png"
          alt="Footer Background"
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={100}
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-white/10 via-white/40 to-white/50" style={{ zIndex: 1 }}></div>

      <div className="container mx-auto px-4 py-10 relative" style={{ zIndex: 2 }}>
        {/* Main content grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Column 1: Brand & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-bold text-emerald-700">RamChay</h3>
            </div>
            <p className="text-gray-700 text-xs leading-relaxed">
              Tại RamChay, chúng tôi tin rằng mỗi bữa ăn là một sự kết nối giữa con người và thiên nhiên. Mang đến những
              thực phẩm chay thuần khiết, tươi ngon từ nông trại đến bàn ăn. Sống xanh, ăn lành cùng RamChay.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 text-base">Khám phá</h4>
            <ul className="space-y-2 text-xs text-gray-700">
              <li>
                <Link href="/products" className="hover:text-emerald-600 transition-colors font-medium">
                  Sản phẩm mới
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-emerald-600 transition-colors font-medium">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/recipes" className="hover:text-emerald-600 transition-colors font-medium">
                  Công thức món chay
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-emerald-600 transition-colors font-medium">
                  Liên hệ hợp tác
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Social */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 text-base">Kết nối</h4>
            <ul className="space-y-2 text-xs text-gray-700 mb-6">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1900 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>lienhe@ramchay.vn</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-2">
              <a
                href="#"
                className="bg-white p-2 rounded-full shadow-md hover:bg-emerald-600 hover:text-white transition-all hover:shadow-lg"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="bg-white p-2 rounded-full shadow-md hover:bg-emerald-600 hover:text-white transition-all hover:shadow-lg"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-emerald-300 my-4"></div>

        {/* Footer bottom */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} RamChay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

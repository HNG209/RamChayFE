// components/layout/Footer.tsx
import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-lime-accent pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Cột 1: Giới thiệu RamChay */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-lime-primary">RamChay 🌱</h3>
            <p className="text-gray-600 text-sm leading-relaxed text-justify">
              Tại RamChay, chúng tôi tin rằng mỗi bữa ăn là một sự kết nối giữa
              con người và thiên nhiên. Mang đến những thực phẩm chay thuần
              khiết, tươi ngon từ nông trại đến bàn ăn, RamChay mong muốn gieo
              mầm sức khỏe và nuôi dưỡng lòng trắc ẩn trong từng hương vị. Sống
              xanh, ăn lành cùng RamChay.
            </p>
          </div>

          {/* Cột 2: Liên kết nhanh */}
          <div className="pl-0 md:pl-10">
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Khám phá</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link
                  href="/products"
                  className="hover:text-lime-primary transition-colors"
                >
                  Sản phẩm mới
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-lime-primary transition-colors"
                >
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link
                  href="/recipes"
                  className="hover:text-lime-primary transition-colors"
                >
                  Công thức món chay
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-lime-primary transition-colors"
                >
                  Liên hệ hợp tác
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Thông tin liên hệ */}
          <div>
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Kết nối</h4>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-lime-primary shrink-0" />
                <span>12 Nguyễn Văn Bảo, Phường 4, Gò Vấp, TP.HCM</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-lime-primary shrink-0" />
                <span>1900 123 456</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-lime-primary shrink-0" />
                <span>lienhe@ramchay.vn</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a
                href="#"
                className="bg-white p-2 rounded-full shadow-sm hover:bg-lime-primary hover:text-white transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-white p-2 rounded-full shadow-sm hover:bg-lime-primary hover:text-white transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-lime-accent/50 pt-6 text-center text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} Công ty TNHH Thực Phẩm RamChay. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

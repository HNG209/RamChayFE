import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map route → permission required
const PERMISSION_MAP: Record<string, string> = {
  "/admin": "VIEW_DASHBOARD",
  "/admin/products": "VIEW_PRODUCTS",
  "/admin/products/add": "ADD_PRODUCT",
  "/admin/categories": "VIEW_CATEGORIES",
  "/admin/orders": "VIEW_ORDERS",
  "/admin/managers": "VIEW_MANAGERS",
  "/admin/managers/add": "ADD_MANAGER",
  "/admin/roles": "VIEW_ROLES",
  "/admin/roles/add": "CREATE_ROLE",
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Chỉ xử lý những trang admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Cho phép vào login page
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  // 1. Lấy token từ cookie
  const token = req.cookies.get("accessToken")?.value;

  // Nếu không có token → redirect login
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // 2. Decode token để lấy dữ liệu user
  let payload: any;
  try {
    const base64Payload = token.split(".")[1];
    payload = JSON.parse(Buffer.from(base64Payload, "base64").toString());
  } catch (err) {
    console.error("Token decode error:", err);
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  const userPermissions: string[] = payload.permissions || [];

  // 3. Xác định permission cần kiểm tra
  const basePath = Object.keys(PERMISSION_MAP)
    .filter((p) => pathname.startsWith(p))
    .sort((a, b) => b.length - a.length)[0];

  // Nếu route không nằm trong permission map → cho vào
  if (!basePath) {
    return NextResponse.next();
  }

  const requiredPermission = PERMISSION_MAP[basePath];

  // 4. Check permission
  const hasPermission = userPermissions.includes(requiredPermission);

  if (!hasPermission) {
    return NextResponse.redirect(new URL("/403", req.url));
  }

  return NextResponse.next();
}

// Áp dụng middleware cho tất cả các route dưới đây
export const config = {
  matcher: ["/admin/:path*"],
};

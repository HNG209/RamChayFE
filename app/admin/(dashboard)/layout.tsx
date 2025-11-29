// app/admin/layout.tsx

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar cố định bên trái */}
      <aside className="w-64 bg-gray-900 text-white shrink-0 hidden md:block">
        <AdminSidebar />
      </aside>

      {/* Nội dung chính bên phải */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}

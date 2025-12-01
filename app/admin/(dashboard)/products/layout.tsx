export default function ProductsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
            <div className="mt-4">{children}</div>
        </div>
    );
}

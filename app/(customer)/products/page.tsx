import ProductCard from "@/components/ProductCard";

const mockProducts = [
    {
        id: 1,
        name: "Đậu hũ chiên giòn",
        price: 45000,
        stock: 20,
        description: "Đậu hũ chiên giòn, thơm ngon",
        category: { categoryName: "Món chiên", description: "Các món chiên giòn" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],
    },
    {
        id: 2,
        name: "Chả chay",
        price: 38000,
        stock: 10,
        description: "Chả chay đặc biệt",
        category: { categoryName: "Món chay", description: "Món chay truyền thống" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],
    },
    {
        id: 3,
        name: "Cơm cuộn chay",
        price: 55000,
        stock: 15,
        description: "Cơm cuộn chay ngon miệng",
        category: { categoryName: "Món cuộn", description: "Các món cuộn" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],

    },
    {
        id: 4,
        name: "Gỏi cuốn chay",
        price: 30000,
        stock: 25,
        description: "Gỏi cuốn tươi mát",
        category: { categoryName: "Món cuộn", description: "Các món cuốn" },
        images: ["/vegan-food-1.png", "/vegan-food-2.png", "/vegan-food-3.png", "/vegan-food-4.png"],
    },
];

export default function CustomerProductsPage() {
    const products = mockProducts;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Sản phẩm</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products && products.length > 0 ? (
                    products.map((p) => <ProductCard key={p.id} product={p} />)
                ) : (
                    <div className="col-span-full text-center text-gray-500">Chưa có sản phẩm nào.</div>
                )}
            </div>
        </div>
    );
}

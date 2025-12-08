"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import { Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePaginPermissionQuery } from "@/redux/services/permissionApi";

function removeVietnameseTones(str: string) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
}

export default function PermissionListPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reload khi quay lại tab/trang
    useEffect(() => {
        const handleFocus = () => router.refresh();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [router]);

    // Debounce search input
    const debouncedSetSearchQuery = useMemo(
        () => debounce((q: string) => {
            setSearchQuery(q);
            setCurrentPage(1);
        }, 400),
        []
    );

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        debouncedSetSearchQuery(e.target.value);
    };

    const handleAdd = () => {
        router.push("/admin/roles/addPermission");
    };

    // Lấy data phân trang từ API (chỉ truyền 3 tham số)
    const { data, isLoading, isFetching } = usePaginPermissionQuery({
        page: currentPage - 1,
        pageSize: itemsPerPage,
        keyWord: searchQuery,
    });

    const permissions = data?.items ?? [];
    const totalItems = data?.totalElements ?? 0;
    const totalPages = data?.totalPages ?? 1;

    // Pagination component
    function Pagination() {
        if (totalPages <= 1) return null;
        const pages: (string | number)[] = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
            }
        }

        return (
            <div className="flex items-center gap-1 justify-center mt-4">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>
                {pages.map((page, idx) =>
                    page === "..." ? (
                        <span key={`dots-${idx}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page as number)}
                            className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === page
                                ? "bg-green-600 text-white border-green-600 shadow-sm"
                                : "border-gray-300 hover:bg-gray-100"
                                }`}
                        >
                            {page}
                        </button>
                    )
                )}
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white p-4 sm:p-6 md:p-10">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                            <span className="text-indigo-600">🔑</span> Danh Sách Permission
                        </h1>
                        <p className="text-sm sm:text-md text-gray-500">
                            Quản lý các quyền hạn sử dụng trong hệ thống.
                        </p>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition w-full sm:w-auto"
                    >
                        <Plus size={20} />
                        <span className="hidden sm:inline">Thêm Permission Mới</span>
                        <span className="sm:hidden">Thêm</span>
                    </button>
                </div>

                {/* Search */}
                <div className="mb-6 sm:mb-8 relative">
                    <input
                        placeholder="Tìm theo tên Permission..."
                        className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition text-sm sm:text-base"
                        onChange={handleSearchInput}
                    />
                    <Search className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-x-auto">
                    {isLoading || isFetching ? (
                        <div className="p-10 flex items-center justify-center">
                            <span className="animate-spin mr-2 text-green-500">
                                <Search size={24} />
                            </span>
                            <p className="ml-2 text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <table className="min-w-[400px] w-full divide-y divide-gray-200 text-sm sm:text-base">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider w-2/12">ID</th>
                                    <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider w-8/12">Tên Permission</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {permissions.length ? (
                                    permissions.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-green-50 transition duration-150">
                                            <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm font-medium text-gray-600">{p.id}</td>
                                            <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-gray-800">{p.name}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="text-center p-10 italic text-gray-500">
                                            Không tìm thấy permission nào phù hợp.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination />
            </div>
        </main>
    );
}
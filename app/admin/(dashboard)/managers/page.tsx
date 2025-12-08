"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import debounce from "lodash/debounce";
import cloneDeep from "lodash/cloneDeep";
import { Plus, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { usePaginManagerQuery, useDeleteManagerMutation } from "@/redux/services/managerApi";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface Item {
  id: number;
  name: string;
  email: string;
  status: string;
  createdAt: string;
}

function SearchBar({
  onSearch,
  placeholder = "Tìm kiếm...",
}: {
  onSearch: (query: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <div className="relative flex-1">
      <div className="flex items-center gap-3 bg-input border border-border rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary transition-all">
        <Search size={18} className="text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={handleClear} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

// Hàm loại bỏ dấu tiếng Việt
function removeVietnameseTones(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// ---------------------------
// ItemTable Component
// ---------------------------
function ItemTable({
  items,
  isLoading,
  onEdit,
  onDelete,
}: {
  items: Item[];
  isLoading: boolean;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}) {
  return (
    <div className="bg-card rounded-xl shadow-md shadow-black/5 dark:shadow-white/5 overflow-hidden mb-6 relative">
      <table className="w-full">
        <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">ID</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Full Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Email/Phone</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Created Date</th>
            <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                No data available
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-100 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">{item.id}</td>
                <td className="px-6 py-4 text-sm text-foreground">{item.name}</td>
                <td className="px-6 py-4 text-sm text-foreground break-all">{item.email}</td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                      }`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-foreground">{item.createdAt}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 rounded-lg hover:bg-green-100 transition-colors text-muted-foreground hover:text-bg-green-100"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(item)}
                      className="p-2 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---------------------------
// Pagination Component
// ---------------------------
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}) {
  const pages: (string | number)[] = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, "...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...");
      for (let i = totalPages - 2; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={18} />
        </button>
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`dots-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${currentPage === page
                ? "bg-green-600 text-white border-green-600 shadow-sm"
                : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              {page}
            </button>
          ),
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------------------------
// ConfirmDeleteModal Component
// ---------------------------
function ConfirmDeleteModal({
  isOpen,
  item,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  item: Item | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen || !item) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h2>
          <p className="text-gray-500 mb-6">
            Bạn có chắc muốn xóa <strong className="text-gray-900">"{item.name}"</strong>? Hành động này không thể hoàn tác.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 size={16} className="animate-spin" />}
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ---------------------------
// Main Home Component
// ---------------------------
export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Item | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const itemsPerPage = 6;

  const { data, isLoading, isFetching } = usePaginManagerQuery({
    page: currentPage - 1,
    pageSize: itemsPerPage,
    keyWord: searchQuery,
  });

  const [deleteManager, { isLoading: isDeleting }] = useDeleteManagerMutation();

  const apiItems = data?.items || [];

  const items: Item[] = apiItems.map((u: any) => ({
    id: u.id,
    name: u.fullName ?? u.username ?? "N/A",
    email: u.phones?.[0] ?? u.email ?? "—",
    status: u.active ? "Active" : "Inactive",
    createdAt: new Date(u.createdAt).toLocaleDateString("vi-VN"),
  }));

  const totalPages = data?.totalPages || 1;
  const totalItems = data?.totalElements || 0;

  // Debounce search với lodash
  const debouncedSetSearchQuery = useMemo(
    () => debounce((q: string) => setSearchQuery(q), 500),
    []
  );

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleAdd = useCallback(() => {
    router.push("managers/add");
  }, [router]);

  const handleEdit = useCallback(
    (item: Item) => {
      router.push(`managers/edit/${item.id}`);
    },
    [router],
  );

  const handleDelete = useCallback((item: Item) => {
    setDeleteConfirmItem(item);
    setIsDeleteConfirmOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmItem) return;
    try {
      await deleteManager(deleteConfirmItem.id).unwrap();
      setIsDeleteConfirmOpen(false);
      setDeleteConfirmItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }, [deleteConfirmItem, deleteManager]);

  // Filtered items: search không phân biệt dấu
  const filteredItems = useMemo(() => {
    const query = removeVietnameseTones(searchQuery).toLowerCase();
    return items.filter((item) => {
      const name = removeVietnameseTones(item.name).toLowerCase();
      const email = item.email.toLowerCase();
      const idStr = item.id.toString();
      return (
        name.includes(query) ||
        email.includes(query) ||
        idStr.includes(query)
      );
    });
  }, [items, searchQuery]);

  if (isLoading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin text-green-500" size={24} />
          <span className="text-gray-600">Đang tải dữ liệu...</span>
        </div>
      </main>
    );

  return (
    <main className="min-h-screen bg-white p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
              <span className="text-indigo-600">👤</span> Quản Lý Nhân Sự (Managers)
            </h1>
            <p className="text-sm sm:text-md text-gray-500">
              Tạo và chỉnh sửa thông tin nhân sự trong hệ thống.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition w-full sm:w-auto"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Thêm Nhân Sự Mới</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8 relative">
          <input
            placeholder="Tìm theo tên, email hoặc ID..."
            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition text-sm sm:text-base"
            onChange={handleSearchInput}
          />
          <Search className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
        </div>

        {/* Table Responsive */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-x-auto">
          {isFetching ? (
            <div className="p-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-green-500" size={24} />
              <p className="ml-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <table className="min-w-[600px] w-full divide-y divide-gray-200 text-sm sm:text-base">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Tên Nhân Sự</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Email/Phone</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Ngày tạo</th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-center text-xs sm:text-sm font-bold text-gray-600 uppercase tracking-wider">Hành động</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-green-50 transition duration-150">
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm font-medium text-gray-600">{item.id}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 font-semibold text-gray-800">{item.name}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm text-gray-800 break-all">{item.email}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        <span className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${item.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {item.status === "Active" ? "Hoạt động" : "Ngưng hoạt động"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-sm text-gray-800">{item.createdAt}</td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-green-100 hover:text-green-700 transition"
                            title="Sửa"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center p-10 italic text-gray-500">
                      Không tìm thấy nhân sự nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && totalPages > 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-6 mt-4 sm:mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}

        {/* Empty State */}
        {totalItems === 0 && !isLoading && (
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500 text-sm sm:text-base">Không tìm thấy nhân sự nào phù hợp{searchQuery && ` cho "${searchQuery}"`}</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <ConfirmDeleteModal
        isOpen={isDeleteConfirmOpen}
        item={deleteConfirmItem}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />
    </main>
  );
}

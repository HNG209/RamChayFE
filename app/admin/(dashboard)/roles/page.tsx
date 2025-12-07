"use client";

import { useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetAllRoleQuery, useDeleteRoleMutation, usePaginRoleQuery } from "@/redux/services/roleApi";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

// --- Định nghĩa Types ---
type Permission = string;

type Role = {
  id: number;
  name: string;
  permissions: Array<{ id: number; name: string }>;
};

const getPermissionCategory = (permission: string): string =>
  permission.split("_").pop()?.toUpperCase() || "";

const PermissionTag: React.FC<{ permission: string }> = ({ permission }) => {
  const parts = permission.split("_");
  const category = getPermissionCategory(permission);
  const action = parts.slice(0, -1).join(" ").toLowerCase();
  const greenClasses = "bg-green-100 text-green-700";
  return (
    <span
      title={permission}
      className={`text-xs px-2.5 py-1.5 rounded-full font-medium whitespace-nowrap ${greenClasses} transition duration-100`}
    >
      {`${action} ${category.toLowerCase()}`}
    </span>
  );
};

const DeleteConfirmModal = ({
  isOpen,
  role,
  onCancel,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean;
  role: Role | null;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) => {
  if (!isOpen || !role) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
      <div className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h2>
          <p className="text-gray-500 mb-6">
            Bạn có chắc muốn xóa <strong className="text-gray-900">"{role.name}"</strong>? Hành động này không thể hoàn tác.
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
};

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

export default function RoleManagingPage() {
  const router = useRouter();
  const { data: roles, isLoading, isError } = useGetAllRoleQuery();
  // const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();
  const [currentPage, setCurrentPage] = useState(1);
  // Phân trang
  const itemsPerPage = 6;

  const { data, isFetching } = usePaginRoleQuery({
    page: currentPage - 1,
    pageSize: itemsPerPage,
    keyWord: searchQuery,
  })


  // Lọc và phân trang dữ liệu
  const filteredRoles = (roles || []).filter(
    (r: Role) =>
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.id?.toString().includes(searchQuery)
  );
  const totalItems = filteredRoles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const pagedRoles = filteredRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (id: number) => router.push(`roles/edit/${id}`);

  const handleAdd = () => router.push(`roles/add`);
  const openDeleteModal = (role: Role) => {
    setSelectedRole(role);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRole(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id).unwrap();
      closeDeleteModal();
    } catch (err) {
      alert("Xóa thất bại!");
    }
  };

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const MAX_TAGS_DISPLAY = 3;
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
    <main className="min-h-screen bg-white p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              <span className="text-indigo-600">👥</span> Quản Lý Chức Vụ (Roles)
            </h1>
            <p className="text-md text-gray-500">
              Tạo và chỉnh sửa quyền hạn cho các vai trò trong hệ thống.
            </p>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md shadow-green-600/30 font-medium transition"
          >
            <Plus size={20} />
            Thêm Role Mới
          </button>
        </div>

        {/* Search */}
        <div className="mb-8 relative">
          <input
            placeholder="Tìm theo tên Role hoặc ID..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" size={20} />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          {isError ? (
            <div className="p-8 text-center text-red-500 bg-red-50/50">
              ❌ Không thể tải dữ liệu Role từ máy chủ. Vui lòng kiểm tra kết nối API.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-1/12">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-3/12">
                    Tên Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider w-7/12">
                    Quyền hạn (Permissions)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider w-1/12">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pagedRoles.length ? (
                  pagedRoles.map((role: Role) => {
                    const permissions: string[] = Array.isArray(role.permissions)
                      ? role.permissions.map((p: { name: string }) => p.name).filter(Boolean)
                      : [];
                    const displayPermissions = permissions.slice(0, MAX_TAGS_DISPLAY);
                    const remainingCount = permissions.length - MAX_TAGS_DISPLAY;
                    return (
                      <tr key={role.id} className="hover:bg-green-50 transition duration-150">
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">{role.id}</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">{role.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {permissions.length > 0 ? (
                              <>
                                {displayPermissions.map((p, index) => (
                                  <PermissionTag key={`${role.id}-${p}-${index}`} permission={p} />
                                ))}
                                {remainingCount > 0 && (
                                  <span className="text-xs px-2 py-1 rounded-full border font-medium whitespace-nowrap bg-gray-200 text-gray-700 border-gray-300">
                                    +{remainingCount}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 italic text-sm">
                                Không có quyền nào
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleEdit(role.id)}
                            className="p-2 rounded-lg text-gray-500 hover:bg-green-100 hover:text-green-700 transition"
                            title="Sửa Role"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => openDeleteModal(role)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-10 italic text-gray-500">
                      Không tìm thấy Role nào phù hợp với tiêu chí tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalItems > 0 && totalPages > 1 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 mt-6">
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
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy Role nào phù hợp{searchQuery && ` cho "${searchQuery}"`}</p>
          </div>
        )}
      </div>
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        role={selectedRole}
        onCancel={closeDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </main>
  );
}
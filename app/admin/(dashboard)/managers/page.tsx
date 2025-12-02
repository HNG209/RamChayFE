"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus, Search, X, Pencil, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { usePaginManagerQuery, useDeleteManagerMutation } from "@/redux/services/managerApi"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { date } from "yup"

interface Item {
  id: number
  name: string
  email: string
  status: string
  createdAt: string
}

// ---------------------------
// SearchBar Component
// ---------------------------
function SearchBar({
  onSearch,
  placeholder = "Tìm kiếm...",
}: {
  onSearch: (query: string) => void
  placeholder?: string
}) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    onSearch(debouncedQuery)
  }, [debouncedQuery, onSearch])

  const handleClear = useCallback(() => {
    setQuery("")
  }, [])

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
  )
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
  items: Item[]
  isLoading: boolean
  onEdit: (item: Item) => void
  onDelete: (item: Item) => void
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
  )
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
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  itemsPerPage: number
}) {
  const pages: (string | number)[] = []
  const maxPagesToShow = 5

  if (totalPages <= maxPagesToShow) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage <= 3) {
      pages.push(1, 2, 3, "...")
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...")
      for (let i = totalPages - 2; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
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
  )
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
  isOpen: boolean
  item: Item | null
  isDeleting: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!isOpen || !item) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90">
      <div className="bg-card rounded-xl border border-border shadow-xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2">Confirm Delete</h2>
          <p className="text-muted-foreground mb-6">
            Are you sure you want to delete <strong className="text-foreground">"{item.name}"</strong>? This action
            cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isDeleting && <Loader2 size={16} className="animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ---------------------------
// Main Home Component
// ---------------------------
export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Item | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const itemsPerPage = 5

  const { data, isLoading, isFetching } = usePaginManagerQuery({
    page: currentPage - 1,
    pageSize: itemsPerPage,
    keyWord: searchQuery,
  })

  const [deleteManager, { isLoading: isDeleting }] = useDeleteManagerMutation()

  const apiItems = data?.items || []

  const items: Item[] = apiItems.map((u: any) => ({
    id: u.id,
    name: u.fullName ?? u.username ?? "N/A",
    email: u.phones?.[0] ?? u.email ?? "—",
    status: u.active ? "Active" : "Inactive",
    createdAt: new Date(u.createdAt).toLocaleDateString("vi-VN"),
  }))

  const totalPages = data?.totalPages || 1
  const totalItems = data?.totalElements || 0

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const handleAdd = useCallback(() => {
    router.push("managers/add")
  }, [router])

  const handleEdit = useCallback(
    (item: Item) => {
      router.push(`managers/${item.id}/edit`)
    },
    [router],
  )

  const handleDelete = useCallback((item: Item) => {
    setDeleteConfirmItem(item)
    setIsDeleteConfirmOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteConfirmItem) return
    try {
      await deleteManager(deleteConfirmItem.id).unwrap()
      setIsDeleteConfirmOpen(false)
      setDeleteConfirmItem(null)
    } catch (error) {
      console.error("Delete failed:", error)
    }
  }, [deleteConfirmItem, deleteManager])

  if (isLoading)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" size={24} />
          <span className="text-foreground">Loading...</span>
        </div>
      </main>
    )

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Manager List</h1>
          <p className="text-muted-foreground">Manage and track managers in your system</p>
        </div>

        {/* Search & Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchBar onSearch={handleSearch} placeholder="Search by name, email, or phone..." />
          </div>
          <button
            onClick={handleAdd}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Plus size={20} />
            Add New
          </button>
        </div>

        {/* Table */}
        <div>
          {isFetching && (
            <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center z-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          )}
          <ItemTable items={items} isLoading={isFetching} onEdit={handleEdit} onDelete={handleDelete} />
        </div>

        {/* Pagination */}
        {totalItems > 0 && (
          <div className="bg-card rounded-lg border border-border p-4 sm:p-6">
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
            <p className="text-muted-foreground">No managers found{searchQuery && ` for "${searchQuery}"`}</p>
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
  )
}

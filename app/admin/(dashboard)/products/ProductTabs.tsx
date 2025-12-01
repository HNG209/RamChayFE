"use client";

import { useState } from "react";

export default function ProductTabs() {
    const [tab, setTab] = useState<"manage" | "add">("manage");

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <button
                    onClick={() => setTab("manage")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "manage" ? "bg-lime-primary text-white" : "bg-gray-100 text-gray-700"
                        }`}
                >
                    Quản lý sản phẩm
                </button>

                <button
                    onClick={() => setTab("add")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === "add" ? "bg-lime-primary text-white" : "bg-gray-100 text-gray-700"
                        }`}
                >
                    Thêm sản phẩm
                </button>
            </div>

            <div>
                {tab === "manage" ? (
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Danh sách sản phẩm (mẫu)</p>
                        <div className="space-y-2">
                            <div className="p-3 border rounded-md">Sản phẩm A - SKU: A001</div>
                            <div className="p-3 border rounded-md">Sản phẩm B - SKU: B002</div>
                            <div className="p-3 border rounded-md">Sản phẩm C - SKU: C003</div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Form thêm sản phẩm (mẫu)</p>
                        <form className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Tên sản phẩm</label>
                                <input className="w-full px-3 py-2 border rounded-md" placeholder="Ví dụ: Tào phớ chay" />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Giá</label>
                                <input className="w-full px-3 py-2 border rounded-md" placeholder="0" />
                            </div>

                            <div className="flex gap-2">
                                <button type="button" className="px-4 py-2 bg-lime-primary text-white rounded-md">Lưu</button>
                                <button type="button" className="px-4 py-2 bg-gray-100 rounded-md">Hủy</button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

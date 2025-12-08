"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Loader2 } from "lucide-react";
import { useCreatePermisisonMutation } from "@/redux/services/permissionApi";

type Permision = {
    name: string;
};

export default function AddPermission() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [createPermisison, { isLoading }] = useCreatePermisisonMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createPermisison({ name }).unwrap();
            alert(`Đã thêm permission: ${name}`);
            router.back();
        } catch (error: any) {
            alert(error?.data?.message || "Thêm permission thất bại!");
        }
    };

    const handleCancel = () => {
        router.back();
    };

    return (
        <main className="min-h-screen bg-gray-50 p-6 md:p-10">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={handleCancel}
                        className="p-2 mr-4 text-gray-600 hover:bg-gray-200 rounded-full transition"
                        aria-label="Quay lại"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-extrabold text-gray-900">Thêm Permission</h1>
                </div>
                {/* Form */}
                <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-2xl">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Tên Permission
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Nhập tên permission (VD: VIEW_ORDER)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition shadow-md shadow-green-600/30 flex items-center disabled:bg-green-400"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin mr-2" />
                                        Đang thêm...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="mr-2" /> Thêm
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
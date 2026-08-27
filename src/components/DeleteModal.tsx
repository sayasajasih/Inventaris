"use client";

import { Asset } from "@/lib/types";

interface Props {
  asset: Asset | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteModal({
  asset,
  deleting,
  onClose,
  onConfirm,
}: Props) {
  if (!asset) return null;

  return (
    <div
      id="deleteModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden border border-white animate-fade-in-up">
        <div className="px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-50 rounded-full opacity-50" />
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-100 mb-5 relative shadow-inner text-rose-500">
            <i className="ph-duotone ph-trash text-3xl" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 mb-2">
            Hapus Aset?
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            Hapus <strong>{asset.name}</strong> secara permanen?
          </p>
        </div>
        <div className="px-6 py-5 bg-slate-50 flex gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-lg shadow-rose-200 transition-colors disabled:opacity-60"
          >
            {deleting ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

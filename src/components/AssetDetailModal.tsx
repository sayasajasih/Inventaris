"use client";

import { useEffect, useState } from "react";
import { ConditionBadge } from "@/components/Badges";
import { formatDateTime, formatRupiah } from "@/lib/format";
import { Asset } from "@/lib/types";

interface Props {
  asset: Asset | null;
  onClose: () => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-slate-500 font-medium mb-0.5">{label}</p>
      <p className="font-bold text-slate-800">{value || "-"}</p>
    </div>
  );
}

export default function AssetDetailModal({ asset, onClose }: Props) {
  const [printTime, setPrintTime] = useState("");

  useEffect(() => {
    setPrintTime(formatDateTime(new Date()));
  }, [asset]);

  if (!asset) return null;

  const printDetail = () => {
    setPrintTime(formatDateTime(new Date()));
    document.body.classList.add("print-detail-mode");
    window.print();
    setTimeout(() => document.body.classList.remove("print-detail-mode"), 500);
  };

  return (
    <div
      id="detailModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden border border-white/20 animate-fade-in-up">
        <div className="hidden detail-print-header w-full p-8 border-b-2 border-slate-800 text-center bg-white mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 uppercase tracking-widest">
            Detail Informasi Aset
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Dicetak pada: <span>{printTime}</span>
          </p>
        </div>

        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-xl z-10 sticky top-0 modal-action-buttons">
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <i className="ph-duotone ph-info text-lg" />
            </div>
            <span>Detail Aset</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 p-2 rounded-xl transition-colors"
            aria-label="Tutup"
          >
            <i className="ph-bold ph-x text-lg" />
          </button>
        </div>

        <div className="px-8 py-6 overflow-y-auto no-scrollbar bg-slate-50/30 flex-grow">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 flex-shrink-0">
              <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                {asset.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.image}
                    alt="Foto Aset"
                    className="w-full h-auto object-cover rounded-xl bg-slate-50"
                  />
                ) : (
                  <div className="w-full aspect-square flex flex-col items-center justify-center bg-slate-50 rounded-xl text-slate-400 border border-dashed border-slate-200">
                    <i className="ph-duotone ph-image-square text-4xl mb-2" />
                    <span className="text-sm font-medium">Tidak ada foto</span>
                  </div>
                )}
              </div>
              <div className="mt-4 text-center">
                <ConditionBadge condition={asset.condition} />
              </div>
            </div>

            <div className="w-full md:w-2/3">
              <div className="mb-6">
                <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                  {asset.id}
                </p>
                <h2 className="text-2xl font-extrabold text-slate-800">
                  {asset.name}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8 text-sm">
                <Field label="Kategori Utama" value={asset.category} />
                <Field label="Sub Kategori" value={asset.subCategory} />
                <Field label="No. Register" value={asset.noRegister} />
                <Field label="Kode Barang" value={asset.kodeBarang} />
                <Field label="No. Pabrik / Mesin" value={asset.noPabrik} />
                <Field label="No. Polisi" value={asset.noPolisi} />
                <Field label="Asal Usul" value={asset.asalUsul} />
                <Field label="Tahun Pembelian" value={asset.tahun} />
                <Field label="Lokasi / Penempatan" value={asset.location} />
                <Field label="Kuantitas" value={`${asset.qty} Unit`} />
              </div>

              <div className="mt-8 bg-brand-50/50 rounded-2xl p-5 border border-brand-100 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Harga Satuan
                  </p>
                  <p className="text-lg font-bold text-slate-800">
                    {formatRupiah(asset.price)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Total Nilai Aset
                  </p>
                  <p className="text-xl font-extrabold text-brand-600">
                    {formatRupiah(asset.price * asset.qty)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 z-10 modal-action-buttons">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={printDetail}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 shadow-glow transition-all"
          >
            <span>Cetak Detail</span>
            <i className="ph-bold ph-printer" />
          </button>
        </div>
      </div>
    </div>
  );
}

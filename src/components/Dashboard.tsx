"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AssetDetailModal from "@/components/AssetDetailModal";
import AssetFormModal from "@/components/AssetFormModal";
import { CategoryBadge, ConditionBadge } from "@/components/Badges";
import DeleteModal from "@/components/DeleteModal";
import ImageViewerModal from "@/components/ImageViewerModal";
import { Toaster, useToasts } from "@/components/Toaster";
import {
  createAsset,
  deleteAsset,
  fetchAssets,
  updateAsset,
} from "@/lib/api";
import { formatDateTime, formatFullDate, formatRupiah } from "@/lib/format";
import {
  Asset,
  AssetInput,
  allConditions,
  categories,
  subKategoriMap,
} from "@/lib/types";

const selectClass =
  "block w-full md:w-auto px-4 py-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:ring-2 focus:ring-brand-500/20 text-sm font-medium transition-all appearance-none cursor-pointer";

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { toasts, showToast } = useToasts();

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterSubCategory, setFilterSubCategory] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [filterCondition, setFilterCondition] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [detailAsset, setDetailAsset] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [zoomed, setZoomed] = useState<{ src: string; title: string } | null>(
    null
  );

  const [today, setToday] = useState("");
  const [printedAt, setPrintedAt] = useState("");

  useEffect(() => {
    const now = new Date();
    setToday(formatFullDate(now));
    setPrintedAt(`Diperbarui: ${formatDateTime(now)}`);
  }, []);

  const load = useCallback(async () => {
    try {
      setAssets(await fetchAssets());
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal memuat data",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (zoomed) setZoomed(null);
      else if (deleteTarget) setDeleteTarget(null);
      else if (detailAsset) setDetailAsset(null);
      else if (formOpen) setFormOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [zoomed, deleteTarget, detailAsset, formOpen]);

  const years = useMemo(
    () =>
      [...new Set(assets.map((asset) => asset.tahun).filter(Boolean))].sort(
        (a, b) => Number(b) - Number(a)
      ),
    [assets]
  );

  const metrics = useMemo(() => {
    const total = assets.reduce((sum, asset) => sum + asset.qty, 0);
    const good = assets
      .filter((a) => a.condition === "Baik" || a.condition === "Aktif")
      .reduce((sum, asset) => sum + asset.qty, 0);
    return { total, good, repair: total - good };
  }, [assets]);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return assets.filter((asset) => {
      const haystack =
        `${asset.name} ${asset.id} ${asset.noRegister} ${asset.kodeBarang} ${asset.noPolisi}`.toLowerCase();
      return (
        haystack.includes(query) &&
        (filterCategory === "all" || asset.category === filterCategory) &&
        (filterSubCategory === "all" ||
          asset.subCategory === filterSubCategory) &&
        (filterCondition === "all" || asset.condition === filterCondition) &&
        (filterYear === "all" || asset.tahun === filterYear)
      );
    });
  }, [
    assets,
    search,
    filterCategory,
    filterSubCategory,
    filterCondition,
    filterYear,
  ]);

  const handleSubmit = async (input: AssetInput) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateAsset(editing.id, input);
        setAssets((current) =>
          current.map((asset) => (asset.id === updated.id ? updated : asset))
        );
        showToast("Data berhasil diperbarui");
      } else {
        const created = await createAsset(input);
        setAssets((current) => [created, ...current]);
        showToast("Aset berhasil ditambahkan");
      }
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal menyimpan data",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAsset(deleteTarget.id);
      setAssets((current) =>
        current.filter((asset) => asset.id !== deleteTarget.id)
      );
      setDeleteTarget(null);
      showToast("Data aset dihapus");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Gagal menghapus data",
        "error"
      );
    } finally {
      setDeleting(false);
    }
  };

  const anyModalOpen = Boolean(
    formOpen || detailAsset || deleteTarget || zoomed
  );

  return (
    <>
      <nav className="bg-white/70 backdrop-blur-md border-b border-white/50 shadow-sm sticky top-0 z-30 print:hidden transition-all">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-glow">
                <i className="ph-duotone ph-buildings text-2xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                  InventarisKu
                </h1>
                <p className="text-xs font-medium text-slate-500 leading-none">
                  Manajemen Aset Modern
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-full border border-slate-200/50 text-sm font-medium text-slate-600">
              <i className="ph-duotone ph-calendar-blank text-brand-500" />
              <span>{today}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full print:py-0 print:px-0 print:max-w-full">
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
            Laporan Inventaris Aset
          </h1>
          <p className="text-slate-600 text-sm font-medium">{printedAt}</p>
          <div className="w-full h-[2px] bg-slate-800 mt-6 mb-2" />
        </div>

        <div className="mb-8 print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Aset
            </h2>
            <p className="text-slate-500 mt-1 font-medium">
              Pantau dan kelola kondisi seluruh inventaris Anda.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-sm font-semibold rounded-xl text-slate-600 bg-white hover:bg-slate-50 focus:outline-none transition-all shadow-sm"
            >
              <i className="ph-duotone ph-printer text-xl" /> Cetak Daftar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-brand-600 to-indigo-500 hover:from-brand-500 focus:outline-none transition-all shadow-glow hover:-translate-y-0.5"
            >
              <i className="ph-bold ph-plus text-lg" /> Tambah Aset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 print:hidden">
          <MetricCard
            label="Total Kuantitas"
            value={metrics.total}
            icon="ph-package"
            tone="brand"
          />
          <MetricCard
            label="Kondisi Baik"
            value={metrics.good}
            icon="ph-check-circle"
            tone="emerald"
          />
          <MetricCard
            label="Perlu Perbaikan"
            value={metrics.repair}
            icon="ph-wrench"
            tone="rose"
          />
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-t-2xl shadow-soft border-x border-t border-white p-5 flex flex-col md:flex-row gap-4 items-center justify-between print:hidden">
          <div className="flex flex-col md:flex-row gap-3 w-full">
            <div className="relative flex-grow max-w-md group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <i className="ph-duotone ph-magnifying-glass text-xl" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="block w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium transition-all"
                placeholder="Cari nama, register, kode..."
              />
            </div>

            <div className="flex flex-wrap md:flex-nowrap gap-3 flex-grow justify-end">
              <select
                value={filterCategory}
                onChange={(event) => {
                  setFilterCategory(event.target.value);
                  setFilterSubCategory("all");
                }}
                className={selectClass}
                aria-label="Filter kategori"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={filterSubCategory}
                onChange={(event) => setFilterSubCategory(event.target.value)}
                className={selectClass}
                aria-label="Filter sub kategori"
              >
                <option value="all">Semua Sub Kategori</option>
                {(subKategoriMap[filterCategory] ?? []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>

              <select
                value={filterYear}
                onChange={(event) => setFilterYear(event.target.value)}
                className={selectClass}
                aria-label="Filter tahun"
              >
                <option value="all">Semua Tahun Pembelian</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              <select
                value={filterCondition}
                onChange={(event) => setFilterCondition(event.target.value)}
                className={selectClass}
                aria-label="Filter kondisi"
              >
                <option value="all">Semua Kondisi</option>
                {allConditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-soft border border-white border-t-slate-100 overflow-hidden rounded-b-2xl print:print-hide-shadow print:rounded-none">
          <div className="overflow-x-auto">
            {filtered.length > 0 && (
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50 print:bg-transparent print:border-b-2 print:border-slate-800">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      ID Aset
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Detail Aset &amp; Identitas
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Kategori &amp; Sub
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      Harga Satuan
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">
                      Qty
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest print:hidden">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((asset, index) => {
                    const identitasKhusus = [
                      asset.noPolisi ? `Nopol: ${asset.noPolisi}` : null,
                      asset.noPabrik ? `No. Pabrik: ${asset.noPabrik}` : null,
                    ]
                      .filter(Boolean)
                      .join(" | ");

                    return (
                      <tr
                        key={asset.id}
                        className="hover:bg-slate-50/80 transition-colors group animate-fade-in-up bg-white"
                        style={{ animationDelay: `${index * 30}ms` }}
                      >
                        <td className="px-5 py-4 align-top whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                            {asset.id}
                          </span>
                          <div className="mt-2 text-[11px] font-medium text-slate-500">
                            <div>
                              Asal:{" "}
                              <span className="font-bold text-slate-700">
                                {asset.asalUsul || "-"}
                              </span>
                            </div>
                            <div>
                              Tahun:{" "}
                              <span className="font-bold text-slate-700">
                                {asset.tahun}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-start gap-4">
                            <div className="h-16 w-16 flex-shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm relative group-hover:border-brand-200 transition-colors mt-1">
                              {asset.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={asset.image}
                                  alt={asset.name}
                                  className="h-full w-full object-cover cursor-pointer hover:scale-110 transition-transform duration-500"
                                  onClick={() =>
                                    setZoomed({
                                      src: asset.image as string,
                                      title: asset.name,
                                    })
                                  }
                                />
                              ) : (
                                <i className="ph-duotone ph-image text-slate-300 text-2xl" />
                              )}
                            </div>
                            <div>
                              <div
                                className="text-sm font-bold text-slate-800 hover:text-brand-600 transition-colors leading-tight cursor-pointer"
                                onClick={() => setDetailAsset(asset)}
                                title="Klik untuk lihat detail"
                              >
                                {asset.name}
                              </div>
                              <div className="text-xs text-slate-500 mt-1.5 space-y-0.5">
                                <div>
                                  <span className="font-semibold text-slate-400">
                                    Reg:
                                  </span>{" "}
                                  {asset.noRegister || "-"}{" "}
                                  <span className="mx-1 text-slate-300">|</span>{" "}
                                  <span className="font-semibold text-slate-400">
                                    Kode:
                                  </span>{" "}
                                  {asset.kodeBarang || "-"}
                                </div>
                                {identitasKhusus && (
                                  <div className="text-brand-600 font-medium">
                                    {identitasKhusus}
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <i className="ph-duotone ph-map-pin text-slate-400" />{" "}
                                  {asset.location || "Tidak ada lokasi"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-top">
                          <CategoryBadge
                            category={asset.category}
                            subCategory={asset.subCategory}
                          />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right align-top">
                          <span className="text-sm font-semibold text-slate-700">
                            {formatRupiah(asset.price)}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-center align-top">
                          <span className="text-sm font-extrabold text-slate-700 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                            {asset.qty}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap align-top">
                          <ConditionBadge condition={asset.condition} />
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right print:hidden align-top">
                          <div className="flex justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all">
                            <button
                              type="button"
                              onClick={() => setDetailAsset(asset)}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl"
                              title="Lihat Detail"
                            >
                              <i className="ph-duotone ph-eye text-lg" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditing(asset);
                                setFormOpen(true);
                              }}
                              className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl"
                              title="Edit"
                            >
                              <i className="ph-duotone ph-pencil-simple text-lg" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(asset)}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl"
                              title="Hapus"
                            >
                              <i className="ph-duotone ph-trash text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-5 border border-slate-100">
                  <i
                    className={`ph-duotone ${
                      loading ? "ph-spinner" : "ph-magnifying-glass-minus"
                    } text-5xl text-slate-300 ${loading ? "animate-spin" : ""}`}
                  />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {loading ? "Memuat data aset..." : "Tidak ada data ditemukan"}
                </h3>
                <p className="text-slate-500 max-w-sm font-medium">
                  {loading
                    ? "Mohon tunggu sebentar."
                    : "Coba sesuaikan filter pencarian Anda atau tambahkan aset baru."}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {anyModalOpen && (
        <div
          id="modalBackdrop"
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 print:hidden"
          aria-hidden="true"
        />
      )}

      <AssetFormModal
        open={formOpen}
        asset={editing}
        saving={saving}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        onError={(message) => showToast(message, "error")}
      />

      <AssetDetailModal
        asset={detailAsset}
        onClose={() => setDetailAsset(null)}
      />

      <DeleteModal
        asset={deleteTarget}
        deleting={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ImageViewerModal image={zoomed} onClose={() => setZoomed(null)} />

      <Toaster toasts={toasts} />
    </>
  );
}

const tones: Record<string, string> = {
  brand:
    "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white",
  emerald:
    "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white",
  rose: "bg-rose-50 text-rose-500 group-hover:bg-rose-500 group-hover:text-white",
};

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: string;
  tone: keyof typeof tones;
}) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft border border-white p-6 flex items-center gap-5 group hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      <div
        className={`relative h-16 w-16 rounded-2xl flex items-center justify-center transition-colors duration-300 ${tones[tone]}`}
      >
        <i className={`ph-duotone ${icon} text-3xl`} />
      </div>
      <div className="relative">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-4xl font-extrabold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

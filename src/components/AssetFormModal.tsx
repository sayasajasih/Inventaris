"use client";

import { useEffect, useState } from "react";
import {
  Asset,
  AssetInput,
  asalUsulOptions,
  categories,
  conditionsFor,
  subKategoriMap,
} from "@/lib/types";

const emptyForm = {
  name: "",
  noRegister: "",
  kodeBarang: "",
  noPabrik: "",
  noPolisi: "",
  category: "",
  subCategory: "",
  asalUsul: "",
  qty: "",
  price: "",
  condition: "",
  location: "",
  tahun: String(new Date().getFullYear()),
  image: null as string | null,
};

type FormState = typeof emptyForm;

const requiredFields: (keyof FormState)[] = [
  "name",
  "noRegister",
  "kodeBarang",
  "category",
  "subCategory",
  "asalUsul",
  "qty",
  "price",
  "condition",
  "tahun",
];

const inputClass =
  "block w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm font-medium bg-white";
const selectClass = `${inputClass} appearance-none cursor-pointer`;
const labelClass = "block text-sm font-bold text-slate-700 mb-2";

interface Props {
  open: boolean;
  asset: Asset | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: AssetInput) => void;
  onError: (message: string) => void;
}

export default function AssetFormModal({
  open,
  asset,
  saving,
  onClose,
  onSubmit,
  onError,
}: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [invalid, setInvalid] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setInvalid([]);
    if (asset) {
      setForm({
        name: asset.name,
        noRegister: asset.noRegister,
        kodeBarang: asset.kodeBarang,
        noPabrik: asset.noPabrik,
        noPolisi: asset.noPolisi,
        category: asset.category,
        subCategory: asset.subCategory,
        asalUsul: asset.asalUsul,
        qty: String(asset.qty),
        price: String(asset.price),
        condition: asset.condition,
        location: asset.location,
        tahun: asset.tahun,
        image: asset.image,
      });
    } else {
      setForm({ ...emptyForm, tahun: String(new Date().getFullYear()) });
    }
  }, [open, asset]);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const handleCategoryChange = (category: string) => {
    setForm((current) => ({
      ...current,
      category,
      subCategory: subKategoriMap[category]?.includes(current.subCategory)
        ? current.subCategory
        : "",
      condition: conditionsFor(category).includes(current.condition)
        ? current.condition
        : "",
    }));
  };

  const handleImage = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      onError("Ukuran file maksimal 1 MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => set("image", String(event.target?.result ?? ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const missing = requiredFields.filter((field) => !form[field]);
    setInvalid(missing as string[]);
    if (missing.length) {
      setTimeout(() => setInvalid([]), 2500);
      onError("Lengkapi semua kolom wajib (*)");
      return;
    }

    onSubmit({
      name: form.name.trim(),
      noRegister: form.noRegister.trim(),
      kodeBarang: form.kodeBarang.trim(),
      noPabrik: form.noPabrik.trim(),
      noPolisi: form.noPolisi.trim(),
      category: form.category,
      subCategory: form.subCategory,
      asalUsul: form.asalUsul,
      qty: parseInt(form.qty, 10),
      price: parseInt(form.price, 10),
      condition: form.condition,
      location: form.location.trim(),
      tahun: form.tahun.trim(),
      image: form.image,
    });
  };

  const errorRing = (field: keyof FormState) =>
    invalid.includes(field as string) ? " border-rose-500 ring-2 ring-rose-200" : "";

  return (
    <div
      id="formModal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden transition-transform border border-white/20 animate-fade-in-up">
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-xl z-10 sticky top-0">
          <h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <i className={asset ? "ph-bold ph-pencil-simple" : "ph-bold ph-plus"} />
            </div>
            <span>{asset ? "Edit Data Aset" : "Tambah Aset Baru"}</span>
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

        <div className="px-8 py-6 overflow-y-auto no-scrollbar bg-slate-50/30">
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className={labelClass}>
                Foto Aset{" "}
                <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <label
                htmlFor="formImage"
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-2xl hover:border-brand-500 hover:bg-brand-50/50 transition-all cursor-pointer bg-white"
              >
                <div className="space-y-2 text-center w-full">
                  {form.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.image}
                      alt="Preview"
                      className="mx-auto h-36 w-auto object-contain mb-4 rounded-xl shadow-sm border border-slate-100 bg-white"
                    />
                  ) : (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 mb-2">
                      <i className="ph-duotone ph-image-square text-2xl text-slate-400" />
                    </div>
                  )}
                  <div className="flex text-sm text-slate-600 justify-center">
                    <span className="relative font-bold text-brand-600 hover:text-brand-700">
                      Klik untuk unggah foto
                    </span>
                    <input
                      id="formImage"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={(event) => handleImage(event.target.files?.[0])}
                    />
                  </div>
                  <p className="text-xs font-medium text-slate-400">
                    Format PNG/JPG maksimal 1 MB
                  </p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label htmlFor="formName" className={labelClass}>
                  Nama Aset <span className="text-rose-500">*</span>
                </label>
                <input
                  id="formName"
                  type="text"
                  value={form.name}
                  onChange={(event) => set("name", event.target.value)}
                  className={inputClass + errorRing("name")}
                  placeholder="Contoh: Laptop MacBook Pro M3"
                />
              </div>
              <div>
                <label htmlFor="formNoRegister" className={labelClass}>
                  Nomor Register <span className="text-rose-500">*</span>
                </label>
                <input
                  id="formNoRegister"
                  type="text"
                  value={form.noRegister}
                  onChange={(event) => set("noRegister", event.target.value)}
                  className={inputClass + errorRing("noRegister")}
                  placeholder="Contoh: 0001"
                />
              </div>
              <div>
                <label htmlFor="formKodeBarang" className={labelClass}>
                  Kode Barang <span className="text-rose-500">*</span>
                </label>
                <input
                  id="formKodeBarang"
                  type="text"
                  value={form.kodeBarang}
                  onChange={(event) => set("kodeBarang", event.target.value)}
                  className={inputClass + errorRing("kodeBarang")}
                  placeholder="Contoh: 3.1.01.01"
                />
              </div>
            </div>

            <hr className="border-slate-200/60" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="formCategory" className={labelClass}>
                  Kategori Utama <span className="text-rose-500">*</span>
                </label>
                <select
                  id="formCategory"
                  value={form.category}
                  onChange={(event) => handleCategoryChange(event.target.value)}
                  className={selectClass + errorRing("category")}
                >
                  <option value="" disabled>
                    Pilih Kategori Utama
                  </option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="formSubCategory" className={labelClass}>
                  Sub Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  id="formSubCategory"
                  value={form.subCategory}
                  onChange={(event) => set("subCategory", event.target.value)}
                  className={selectClass + errorRing("subCategory")}
                >
                  <option value="" disabled>
                    {form.category
                      ? "Pilih Sub Kategori"
                      : "Pilih Kategori Utama Dahulu"}
                  </option>
                  {(subKategoriMap[form.category] ?? []).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="formNoPabrik" className={labelClass}>
                  No. Pabrik / Rangka / Mesin
                </label>
                <input
                  id="formNoPabrik"
                  type="text"
                  value={form.noPabrik}
                  onChange={(event) => set("noPabrik", event.target.value)}
                  className={inputClass}
                  placeholder="Kosongkan jika tidak ada"
                />
              </div>
              <div>
                <label htmlFor="formNoPolisi" className={labelClass}>
                  No. Polisi (Kendaraan)
                </label>
                <input
                  id="formNoPolisi"
                  type="text"
                  value={form.noPolisi}
                  onChange={(event) => set("noPolisi", event.target.value)}
                  className={inputClass}
                  placeholder="Contoh: B 1234 CD"
                />
              </div>
            </div>

            <hr className="border-slate-200/60" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-2">
                <label htmlFor="formAsalUsul" className={labelClass}>
                  Asal Usul <span className="text-rose-500">*</span>
                </label>
                <select
                  id="formAsalUsul"
                  value={form.asalUsul}
                  onChange={(event) => set("asalUsul", event.target.value)}
                  className={selectClass + errorRing("asalUsul")}
                >
                  <option value="" disabled>
                    Pilih Asal Usul
                  </option>
                  {asalUsulOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="formQty" className={labelClass}>
                  Kuantitas <span className="text-rose-500">*</span>
                </label>
                <input
                  id="formQty"
                  type="number"
                  min={1}
                  value={form.qty}
                  onChange={(event) => set("qty", event.target.value)}
                  className={inputClass + errorRing("qty")}
                  placeholder="0"
                />
              </div>
              <div>
                <label htmlFor="formCondition" className={labelClass}>
                  Kondisi <span className="text-rose-500">*</span>
                </label>
                <select
                  id="formCondition"
                  value={form.condition}
                  onChange={(event) => set("condition", event.target.value)}
                  className={selectClass + errorRing("condition")}
                >
                  <option value="" disabled>
                    {form.category ? "Pilih Status" : "Pilih Kategori Utama Dahulu"}
                  </option>
                  {conditionsFor(form.category).map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label htmlFor="formTahun" className={labelClass}>
                  Tahun Pembelian <span className="text-rose-500">*</span>
                </label>
                <input
                  id="formTahun"
                  type="number"
                  min={1900}
                  max={2100}
                  value={form.tahun}
                  onChange={(event) => set("tahun", event.target.value)}
                  className={inputClass + errorRing("tahun")}
                  placeholder="Contoh: 2024"
                />
              </div>
              <div>
                <label htmlFor="formPrice" className={labelClass}>
                  Harga Satuan (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="formPrice"
                  type="number"
                  min={0}
                  value={form.price}
                  onChange={(event) => set("price", event.target.value)}
                  className={inputClass + errorRing("price")}
                  placeholder="Contoh: 15000000"
                />
              </div>
              <div>
                <label htmlFor="formLocation" className={labelClass}>
                  Lokasi / Penempatan
                </label>
                <input
                  id="formLocation"
                  type="text"
                  value={form.location}
                  onChange={(event) => set("location", event.target.value)}
                  className={inputClass}
                  placeholder="Contoh: Ruang IT"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-end gap-3 z-10 modal-action-buttons">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-glow transition-all disabled:opacity-60"
          >
            <span>{saving ? "Menyimpan..." : "Simpan Data"}</span>
            <i className="ph-bold ph-floppy-disk" />
          </button>
        </div>
      </div>
    </div>
  );
}

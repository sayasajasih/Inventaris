import { AssetInput, conditionsFor, subKategoriMap } from "./types";

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;

const str = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

export function parseAssetInput(
  body: unknown
): { data: AssetInput } | { error: string } {
  if (typeof body !== "object" || body === null) {
    return { error: "Body permintaan tidak valid" };
  }
  const raw = body as Record<string, unknown>;

  const name = str(raw.name);
  const noRegister = str(raw.noRegister);
  const kodeBarang = str(raw.kodeBarang);
  const category = str(raw.category);
  const subCategory = str(raw.subCategory);
  const asalUsul = str(raw.asalUsul);
  const condition = str(raw.condition);
  const tahun = str(raw.tahun);
  const qty = Number(raw.qty);
  const price = Number(raw.price);
  const image = typeof raw.image === "string" && raw.image ? raw.image : null;

  if (!name) return { error: "Nama aset wajib diisi" };
  if (!noRegister) return { error: "Nomor register wajib diisi" };
  if (!kodeBarang) return { error: "Kode barang wajib diisi" };
  if (!subKategoriMap[category]) return { error: "Kategori utama tidak valid" };
  if (!subKategoriMap[category].includes(subCategory)) {
    return { error: "Sub kategori tidak sesuai dengan kategori utama" };
  }
  if (!asalUsul) return { error: "Asal usul wajib diisi" };
  if (!conditionsFor(category).includes(condition)) {
    return { error: "Kondisi tidak sesuai dengan kategori utama" };
  }
  if (!Number.isInteger(qty) || qty < 1) {
    return { error: "Kuantitas harus berupa angka minimal 1" };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: "Harga satuan harus berupa angka minimal 0" };
  }
  if (!/^\d{4}$/.test(tahun)) {
    return { error: "Tahun pembelian harus 4 digit" };
  }
  if (image && image.length > MAX_IMAGE_BYTES) {
    return { error: "Ukuran foto maksimal 1 MB" };
  }
  if (image && !image.startsWith("data:image/")) {
    return { error: "Format foto tidak valid" };
  }

  return {
    data: {
      name,
      noRegister,
      kodeBarang,
      noPabrik: str(raw.noPabrik),
      noPolisi: str(raw.noPolisi),
      category,
      subCategory,
      asalUsul,
      qty,
      price: Math.round(price),
      condition,
      location: str(raw.location),
      tahun,
      image,
    },
  };
}

export type Category =
  | "Tanah dan Bangunan"
  | "Peralatan dan Mesin"
  | "Aset Tak Berwujud";

export type Condition =
  | "Baik"
  | "Rusak Ringan"
  | "Rusak Berat"
  | "Aktif"
  | "Kadaluwarsa (Expired)";

export interface Asset {
  id: string;
  name: string;
  noRegister: string;
  kodeBarang: string;
  noPabrik: string;
  noPolisi: string;
  category: string;
  subCategory: string;
  asalUsul: string;
  qty: number;
  price: number;
  condition: string;
  location: string;
  tahun: string;
  image: string | null;
}

export type AssetInput = Omit<Asset, "id">;

export const subKategoriMap: Record<string, string[]> = {
  "Tanah dan Bangunan": ["Tanah", "Bangunan"],
  "Peralatan dan Mesin": [
    "Kendaraan",
    "Peralatan Komputer TI",
    "Alat Kantor dan Rumah Tangga",
    "Alat Komunikasi dan Studio",
  ],
  "Aset Tak Berwujud": [
    "Kajian",
    "Lisensi Perangkat Lunak",
    "Aplikasi",
    "Hak Cipta",
  ],
};

export const categories = Object.keys(subKategoriMap);

export const asalUsulOptions = [
  "Pembelian",
  "Hibah",
  "Sewa",
  "Pinjam",
  "Guna Usaha",
  "Lainnya",
];

export const conditionsFor = (category: string): string[] => {
  if (category === "Aset Tak Berwujud") {
    return ["Aktif", "Kadaluwarsa (Expired)"];
  }
  if (category) return ["Baik", "Rusak Ringan", "Rusak Berat"];
  return [];
};

export const allConditions = [
  "Baik",
  "Rusak Ringan",
  "Rusak Berat",
  "Aktif",
  "Kadaluwarsa (Expired)",
];

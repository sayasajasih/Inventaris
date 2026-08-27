import { Asset, AssetInput } from "../types";

export interface AssetStore {
  list(): Promise<Asset[]>;
  get(id: string): Promise<Asset | null>;
  create(input: AssetInput): Promise<Asset>;
  update(id: string, input: AssetInput): Promise<Asset | null>;
  remove(id: string): Promise<boolean>;
}

export const seedAssets: Asset[] = [
  {
    id: "AST-2026-001",
    noRegister: "0001",
    kodeBarang: "3.1.02.01",
    noPabrik: "M3-2024-X",
    noPolisi: "",
    name: "Laptop MacBook Pro M3",
    category: "Peralatan dan Mesin",
    subCategory: "Peralatan Komputer TI",
    asalUsul: "Pembelian",
    qty: 2,
    price: 25000000,
    condition: "Baik",
    location: "Ruang IT / Lantai 2",
    tahun: "2026",
    image: null,
  },
  {
    id: "AST-2026-002",
    noRegister: "0015",
    kodeBarang: "3.1.04.05",
    noPabrik: "HONDA-2991",
    noPolisi: "KT 1234 A",
    name: "Motor Operasional Honda Vario",
    category: "Peralatan dan Mesin",
    subCategory: "Kendaraan",
    asalUsul: "Hibah",
    qty: 1,
    price: 22000000,
    condition: "Baik",
    location: "Parkiran Kantor",
    tahun: "2024",
    image: null,
  },
];

export function nextAssetId(existingIds: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `AST-${year}-`;
  let maxNum = 0;
  for (const id of existingIds) {
    if (!id.startsWith(prefix)) continue;
    const num = parseInt(id.slice(prefix.length), 10);
    if (!Number.isNaN(num) && num > maxNum) maxNum = num;
  }
  return `${prefix}${(maxNum + 1).toString().padStart(3, "0")}`;
}

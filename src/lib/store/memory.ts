import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { Asset } from "../types";
import { AssetStore, nextAssetId, seedAssets } from "./types";

const DATA_FILE = join(process.cwd(), ".data", "assets.json");

const globalForMemory = globalThis as unknown as {
  inventarisAssets?: Asset[];
};

async function load(): Promise<Asset[]> {
  if (globalForMemory.inventarisAssets) return globalForMemory.inventarisAssets;
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    globalForMemory.inventarisAssets = JSON.parse(raw) as Asset[];
  } catch {
    globalForMemory.inventarisAssets = seedAssets.map((asset) => ({ ...asset }));
  }
  return globalForMemory.inventarisAssets;
}

async function persist(assets: Asset[]): Promise<void> {
  globalForMemory.inventarisAssets = assets;
  try {
    await mkdir(dirname(DATA_FILE), { recursive: true });
    await writeFile(DATA_FILE, JSON.stringify(assets, null, 2), "utf8");
  } catch {
    // Read-only filesystem (e.g. serverless): keep data in memory only.
  }
}

/**
 * Fallback store used when DATABASE_URL is not configured. Data lives in a
 * local JSON file during development and is not durable on serverless hosts.
 */
export function createMemoryStore(): AssetStore {
  return {
    async list() {
      return [...(await load())];
    },

    async get(id) {
      const assets = await load();
      return assets.find((asset) => asset.id === id) ?? null;
    },

    async create(input) {
      const assets = await load();
      const asset: Asset = { id: nextAssetId(assets.map((a) => a.id)), ...input };
      await persist([asset, ...assets]);
      return asset;
    },

    async update(id, input) {
      const assets = await load();
      const index = assets.findIndex((asset) => asset.id === id);
      if (index === -1) return null;
      const updated: Asset = { id, ...input };
      const next = [...assets];
      next[index] = updated;
      await persist(next);
      return updated;
    },

    async remove(id) {
      const assets = await load();
      const next = assets.filter((asset) => asset.id !== id);
      if (next.length === assets.length) return false;
      await persist(next);
      return true;
    },
  };
}

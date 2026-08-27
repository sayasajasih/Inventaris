import { neon } from "@neondatabase/serverless";
import { Asset, AssetInput } from "../types";
import { AssetStore, nextAssetId, seedAssets } from "./types";

interface AssetRow {
  id: string;
  name: string;
  no_register: string;
  kode_barang: string;
  no_pabrik: string;
  no_polisi: string;
  category: string;
  sub_category: string;
  asal_usul: string;
  qty: number;
  price: string;
  condition: string;
  location: string;
  tahun: string;
  image: string | null;
}

const toAsset = (row: AssetRow): Asset => ({
  id: row.id,
  name: row.name,
  noRegister: row.no_register,
  kodeBarang: row.kode_barang,
  noPabrik: row.no_pabrik,
  noPolisi: row.no_polisi,
  category: row.category,
  subCategory: row.sub_category,
  asalUsul: row.asal_usul,
  qty: Number(row.qty),
  price: Number(row.price),
  condition: row.condition,
  location: row.location,
  tahun: row.tahun,
  image: row.image,
});

const globalForNeon = globalThis as unknown as {
  inventarisSql?: ReturnType<typeof neon>;
  inventarisReady?: Promise<void>;
};

function getSql() {
  if (!globalForNeon.inventarisSql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured");
    }
    globalForNeon.inventarisSql = neon(connectionString);
  }
  return globalForNeon.inventarisSql;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rows<T = Record<string, any>>(result: any): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === "object" && "rows" in result)
    return (result as { rows: T[] }).rows;
  return [];
}

async function migrate(): Promise<void> {
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS assets (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      no_register  TEXT NOT NULL DEFAULT '',
      kode_barang  TEXT NOT NULL DEFAULT '',
      no_pabrik    TEXT NOT NULL DEFAULT '',
      no_polisi    TEXT NOT NULL DEFAULT '',
      category     TEXT NOT NULL,
      sub_category TEXT NOT NULL DEFAULT '',
      asal_usul    TEXT NOT NULL DEFAULT '',
      qty          INTEGER NOT NULL DEFAULT 1,
      price        BIGINT NOT NULL DEFAULT 0,
      condition    TEXT NOT NULL DEFAULT 'Baik',
      location     TEXT NOT NULL DEFAULT '',
      tahun        TEXT NOT NULL DEFAULT '',
      image        TEXT,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;

  const countResult = await sql`SELECT count(*)::text AS count FROM assets`;
  const countRows = rows<{ count: string }>(countResult);
  const count = countRows[0]?.count ?? "0";
  if (Number(count) === 0) {
    for (const asset of seedAssets) {
      await sql`
        INSERT INTO assets (id, name, no_register, kode_barang, no_pabrik, no_polisi, category, sub_category, asal_usul, qty, price, condition, location, tahun, image)
        VALUES (${asset.id}, ${asset.name}, ${asset.noRegister}, ${asset.kodeBarang}, ${asset.noPabrik}, ${asset.noPolisi}, ${asset.category}, ${asset.subCategory}, ${asset.asalUsul}, ${asset.qty}, ${asset.price}, ${asset.condition}, ${asset.location}, ${asset.tahun}, ${asset.image})
      `;
    }
  }
}

function ready(): Promise<void> {
  if (!globalForNeon.inventarisReady) {
    globalForNeon.inventarisReady = migrate().catch((error) => {
      globalForNeon.inventarisReady = undefined;
      throw error;
    });
  }
  return globalForNeon.inventarisReady;
}

export function createPostgresStore(_connectionString: string): AssetStore {
  return {
    async list() {
      await ready();
      const sql = getSql();
      const result = await sql`SELECT * FROM assets ORDER BY created_at DESC, id DESC`;
      return rows<AssetRow>(result).map(toAsset);
    },

    async get(id) {
      await ready();
      const sql = getSql();
      const result = await sql`SELECT * FROM assets WHERE id = ${id}`;
      const r = rows<AssetRow>(result);
      return r.length ? toAsset(r[0]) : null;
    },

    async create(input) {
      await ready();
      const sql = getSql();
      const idsResult = await sql`SELECT id FROM assets`;
      const id = nextAssetId(rows<{ id: string }>(idsResult).map((row) => row.id));
      const result = await sql`
        INSERT INTO assets (id, name, no_register, kode_barang, no_pabrik, no_polisi, category, sub_category, asal_usul, qty, price, condition, location, tahun, image)
        VALUES (${id}, ${input.name}, ${input.noRegister}, ${input.kodeBarang}, ${input.noPabrik}, ${input.noPolisi}, ${input.category}, ${input.subCategory}, ${input.asalUsul}, ${input.qty}, ${input.price}, ${input.condition}, ${input.location}, ${input.tahun}, ${input.image})
        RETURNING *
      `;
      return toAsset(rows<AssetRow>(result)[0]);
    },

    async update(id, input) {
      await ready();
      const sql = getSql();
      const result = await sql`
        UPDATE assets SET
          name = ${input.name},
          no_register = ${input.noRegister},
          kode_barang = ${input.kodeBarang},
          no_pabrik = ${input.noPabrik},
          no_polisi = ${input.noPolisi},
          category = ${input.category},
          sub_category = ${input.subCategory},
          asal_usul = ${input.asalUsul},
          qty = ${input.qty},
          price = ${input.price},
          condition = ${input.condition},
          location = ${input.location},
          tahun = ${input.tahun},
          image = ${input.image}
        WHERE id = ${id}
        RETURNING *
      `;
      const r = rows<AssetRow>(result);
      return r.length ? toAsset(r[0]) : null;
    },

    async remove(id) {
      await ready();
      const sql = getSql();
      const result = await sql`DELETE FROM assets WHERE id = ${id} RETURNING id`;
      return rows(result).length > 0;
    },
  };
}

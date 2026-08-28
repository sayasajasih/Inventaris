import { Pool } from "pg";
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
  created_at: Date;
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

const globalForPool = globalThis as unknown as {
  inventarisPool?: Pool;
  inventarisReady?: Promise<void>;
};

function getPool(): Pool {
  if (!globalForPool.inventarisPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured");
    }
    globalForPool.inventarisPool = new Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 20000,
      ssl: connectionString.includes("sslmode=require")
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return globalForPool.inventarisPool;
}

async function migrate(): Promise<void> {
  const pool = getPool();

  await pool.query(`
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
  `);

  const { rows } = await pool.query("SELECT count(*)::text AS count FROM assets");
  const count = Number(rows[0]?.count ?? "0");

  if (count === 0) {
    for (const asset of seedAssets) {
      await pool.query(
        `INSERT INTO assets (id, name, no_register, kode_barang, no_pabrik, no_polisi, category, sub_category, asal_usul, qty, price, condition, location, tahun, image)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [
          asset.id,
          asset.name,
          asset.noRegister,
          asset.kodeBarang,
          asset.noPabrik,
          asset.noPolisi,
          asset.category,
          asset.subCategory,
          asset.asalUsul,
          asset.qty,
          asset.price,
          asset.condition,
          asset.location,
          asset.tahun,
          asset.image,
        ]
      );
    }
  }
}

function ready(): Promise<void> {
  if (!globalForPool.inventarisReady) {
    globalForPool.inventarisReady = migrate().catch((error) => {
      globalForPool.inventarisReady = undefined;
      throw error;
    });
  }
  return globalForPool.inventarisReady;
}

export function createPostgresStore(_connectionString: string): AssetStore {
  return {
    async list() {
      await ready();
      const pool = getPool();
      const { rows } = await pool.query<AssetRow>(
        "SELECT * FROM assets ORDER BY created_at DESC, id DESC"
      );
      return rows.map(toAsset);
    },

    async get(id) {
      await ready();
      const pool = getPool();
      const { rows } = await pool.query<AssetRow>(
        "SELECT * FROM assets WHERE id = $1",
        [id]
      );
      return rows.length ? toAsset(rows[0]) : null;
    },

    async create(input) {
      await ready();
      const pool = getPool();
      const { rows: idRows } = await pool.query<{ id: string }>("SELECT id FROM assets");
      const id = nextAssetId(idRows.map((row) => row.id));

      const { rows } = await pool.query<AssetRow>(
        `INSERT INTO assets (id, name, no_register, kode_barang, no_pabrik, no_polisi, category, sub_category, asal_usul, qty, price, condition, location, tahun, image)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
         RETURNING *`,
        [
          id,
          input.name,
          input.noRegister,
          input.kodeBarang,
          input.noPabrik,
          input.noPolisi,
          input.category,
          input.subCategory,
          input.asalUsul,
          input.qty,
          input.price,
          input.condition,
          input.location,
          input.tahun,
          input.image,
        ]
      );
      return toAsset(rows[0]);
    },

    async update(id, input) {
      await ready();
      const pool = getPool();
      const { rows } = await pool.query<AssetRow>(
        `UPDATE assets SET
          name = $2,
          no_register = $3,
          kode_barang = $4,
          no_pabrik = $5,
          no_polisi = $6,
          category = $7,
          sub_category = $8,
          asal_usul = $9,
          qty = $10,
          price = $11,
          condition = $12,
          location = $13,
          tahun = $14,
          image = $15
        WHERE id = $1
        RETURNING *`,
        [
          id,
          input.name,
          input.noRegister,
          input.kodeBarang,
          input.noPabrik,
          input.noPolisi,
          input.category,
          input.subCategory,
          input.asalUsul,
          input.qty,
          input.price,
          input.condition,
          input.location,
          input.tahun,
          input.image,
        ]
      );
      return rows.length ? toAsset(rows[0]) : null;
    },

    async remove(id) {
      await ready();
      const pool = getPool();
      const { rowCount } = await pool.query(
        "DELETE FROM assets WHERE id = $1",
        [id]
      );
      return (rowCount ?? 0) > 0;
    },
  };
}

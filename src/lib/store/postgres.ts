import postgres from "postgres";
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

type Sql = ReturnType<typeof postgres>;

const globalForSql = globalThis as unknown as {
  inventarisSql?: Sql;
  inventarisReady?: Promise<void>;
};

function client(connectionString: string): Sql {
  if (!globalForSql.inventarisSql) {
    globalForSql.inventarisSql = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      prepare: false,
    });
  }
  return globalForSql.inventarisSql;
}

async function migrate(sql: Sql): Promise<void> {
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

  const [{ count }] = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count FROM assets
  `;
  if (Number(count) === 0) {
    for (const asset of seedAssets) {
      await sql`
        INSERT INTO assets ${sql({
          id: asset.id,
          name: asset.name,
          no_register: asset.noRegister,
          kode_barang: asset.kodeBarang,
          no_pabrik: asset.noPabrik,
          no_polisi: asset.noPolisi,
          category: asset.category,
          sub_category: asset.subCategory,
          asal_usul: asset.asalUsul,
          qty: asset.qty,
          price: asset.price,
          condition: asset.condition,
          location: asset.location,
          tahun: asset.tahun,
          image: asset.image,
        })}
      `;
    }
  }
}

function ready(sql: Sql): Promise<void> {
  if (!globalForSql.inventarisReady) {
    globalForSql.inventarisReady = migrate(sql).catch((error) => {
      globalForSql.inventarisReady = undefined;
      throw error;
    });
  }
  return globalForSql.inventarisReady;
}

const columns = (input: AssetInput) => ({
  name: input.name,
  no_register: input.noRegister,
  kode_barang: input.kodeBarang,
  no_pabrik: input.noPabrik,
  no_polisi: input.noPolisi,
  category: input.category,
  sub_category: input.subCategory,
  asal_usul: input.asalUsul,
  qty: input.qty,
  price: input.price,
  condition: input.condition,
  location: input.location,
  tahun: input.tahun,
  image: input.image,
});

export function createPostgresStore(connectionString: string): AssetStore {
  const sql = client(connectionString);

  return {
    async list() {
      await ready(sql);
      const rows = await sql<AssetRow[]>`
        SELECT * FROM assets ORDER BY created_at DESC, id DESC
      `;
      return rows.map(toAsset);
    },

    async get(id) {
      await ready(sql);
      const rows = await sql<AssetRow[]>`
        SELECT * FROM assets WHERE id = ${id}
      `;
      return rows.length ? toAsset(rows[0]) : null;
    },

    async create(input) {
      await ready(sql);
      const ids = await sql<{ id: string }[]>`SELECT id FROM assets`;
      const id = nextAssetId(ids.map((row) => row.id));
      const rows = await sql<AssetRow[]>`
        INSERT INTO assets ${sql({ id, ...columns(input) })} RETURNING *
      `;
      return toAsset(rows[0]);
    },

    async update(id, input) {
      await ready(sql);
      const rows = await sql<AssetRow[]>`
        UPDATE assets SET ${sql(columns(input))} WHERE id = ${id} RETURNING *
      `;
      return rows.length ? toAsset(rows[0]) : null;
    },

    async remove(id) {
      await ready(sql);
      const rows = await sql`DELETE FROM assets WHERE id = ${id} RETURNING id`;
      return rows.length > 0;
    },
  };
}

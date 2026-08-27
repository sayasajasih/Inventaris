import { createMemoryStore } from "./memory";
import { createPostgresStore } from "./postgres";
import { AssetStore } from "./types";

export type { AssetStore } from "./types";

let store: AssetStore | undefined;

export function getStore(): AssetStore {
  if (!store) {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL;
    store = connectionString
      ? createPostgresStore(connectionString)
      : createMemoryStore();
  }
  return store;
}

export const isPersistent = (): boolean =>
  Boolean(
    process.env.DATABASE_URL ||
      process.env.POSTGRES_URL ||
      process.env.POSTGRES_PRISMA_URL
  );

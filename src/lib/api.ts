import { Asset, AssetInput } from "./types";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const payload = (await response.json().catch(() => ({}))) as ApiResponse<T>;
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error || "Terjadi kesalahan pada server");
  }
  return payload.data;
}

export const fetchAssets = () => request<Asset[]>("/api/assets");

export const createAsset = (input: AssetInput) =>
  request<Asset>("/api/assets", {
    method: "POST",
    body: JSON.stringify(input),
  });

export const updateAsset = (id: string, input: AssetInput) =>
  request<Asset>(`/api/assets/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });

export const deleteAsset = (id: string) =>
  request<{ id: string }>(`/api/assets/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

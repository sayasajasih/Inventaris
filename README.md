# InventarisKu — Aplikasi Inventaris Aset Kantor

Aplikasi manajemen inventaris aset kantor (frontend + backend) hasil konversi dari
prototipe HTML statis menjadi aplikasi Next.js dengan API dan database.

## Fitur

- Dashboard metrik: total kuantitas, kondisi baik, perlu perbaikan
- CRUD aset (tambah, ubah, hapus) lewat REST API
- Pencarian dan filter kategori, sub kategori, tahun pembelian, kondisi
- Detail aset, foto aset (data URL, maks 1 MB), lightbox foto
- Cetak daftar aset dan cetak detail satu aset (print stylesheet khusus)
- Validasi di sisi server (kategori ↔ sub kategori ↔ kondisi harus konsisten)

## Teknologi

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS 3 + Phosphor Icons
- Postgres via [postgres.js](https://github.com/porsager/postgres)

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # opsional, isi DATABASE_URL bila punya Postgres
npm run dev                  # http://localhost:3000
```

Tanpa `DATABASE_URL`, data disimpan di file `.data/assets.json` (mode fallback untuk
pengembangan lokal). Dengan `DATABASE_URL`, tabel `assets` dibuat otomatis saat
request pertama dan diisi dua data contoh.

Perintah lain:

```bash
npm run lint    # ESLint
npm run build   # build produksi
```

## REST API

| Method | Endpoint           | Keterangan                   |
| ------ | ------------------ | ---------------------------- |
| GET    | `/api/assets`      | Daftar seluruh aset          |
| POST   | `/api/assets`      | Tambah aset (ID digenerate)  |
| GET    | `/api/assets/{id}` | Detail satu aset             |
| PUT    | `/api/assets/{id}` | Perbarui aset                |
| DELETE | `/api/assets/{id}` | Hapus aset                   |

Format body (POST/PUT):

```json
{
  "name": "Laptop MacBook Pro M3",
  "noRegister": "0001",
  "kodeBarang": "3.1.02.01",
  "noPabrik": "M3-2024-X",
  "noPolisi": "",
  "category": "Peralatan dan Mesin",
  "subCategory": "Peralatan Komputer TI",
  "asalUsul": "Pembelian",
  "qty": 2,
  "price": 25000000,
  "condition": "Baik",
  "location": "Ruang IT",
  "tahun": "2026",
  "image": null
}
```

Respons sukses selalu `{ "data": ... }`, respons gagal `{ "error": "pesan" }`.

## Deploy ke Vercel

1. Push repository ini ke GitHub.
2. Di [vercel.com/new](https://vercel.com/new), import repository tersebut
   (framework terdeteksi otomatis sebagai Next.js, tanpa konfigurasi tambahan).
3. Siapkan database Postgres, misalnya lewat tab **Storage → Create Database →
   Neon/Postgres** pada project Vercel, atau layanan lain (Supabase, Neon).
4. Tambahkan environment variable `DATABASE_URL` (nilai connection string
   Postgres, sertakan `?sslmode=require`) untuk environment Production,
   Preview, dan Development.
5. Deploy. Skema tabel dibuat otomatis pada request pertama ke API.

> Tanpa `DATABASE_URL`, aplikasi tetap jalan di Vercel tetapi data hanya
> bertahan sementara di memori instance serverless (hilang setelah instance
> dimatikan), jadi wajib mengisi variabel ini untuk penggunaan sesungguhnya.

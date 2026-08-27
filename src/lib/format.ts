export const formatRupiah = (angka: number | null | undefined): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka || 0);

export const formatFullDate = (date: Date): string =>
  date.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatDateTime = (date: Date): string =>
  date.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" });

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@phosphor-icons/web/bold";
import "@phosphor-icons/web/duotone";
import "@phosphor-icons/web/fill";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "InventarisKu — Inventaris Aset Kantor",
  description:
    "Aplikasi manajemen inventaris aset kantor: pencatatan, pencarian, filter, dan cetak laporan aset.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body
        className={`${jakarta.className} text-slate-700 antialiased min-h-screen flex flex-col selection:bg-brand-100 selection:text-brand-900 transition-colors`}
      >
        {children}
      </body>
    </html>
  );
}

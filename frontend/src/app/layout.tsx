// File: frontend/src/app/layout.tsx

import type { Metadata } from "next";
// Mengimpor font modern Plus Jakarta Sans langsung dari Google Fonts via Next.js
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Menginisialisasi font dengan subset latin dan mengatur variabel CSS-nya
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans", // Variabel ini akan kita gunakan di Tailwind
});

export const metadata: Metadata = {
  title: "SPK Perundungan SMAN 2 Padang",
  description: "Sistem Pendukung Keputusan Identifikasi Risiko Perundungan AHP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      {/* Menerapkan font ke seluruh body aplikasi */}
      <body className={`${jakartaSans.variable} font-sans antialiased bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  );
}
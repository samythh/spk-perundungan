// File: frontend/src/app/layout.tsx
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
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
    <html lang="id" suppressHydrationWarning>
      {/* Warna latar dasar aplikasi */}
      <body className={`${jakartaSans.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50`}>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        // PERBAIKAN: Baris 'disableTransitionOnChange' telah dihapus di sini
        // agar efek transisi CSS (Fade) diizinkan berjalan saat tema diganti.
        >
          {children}
        </ThemeProvider>

      </body>
    </html>
  );
}
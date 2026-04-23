// File: frontend/src/app/page.tsx

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-2xl w-full bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Indikator Status Database */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold mb-8 border border-emerald-200 shadow-sm">
          <CheckCircle2 size={18} />
          <span>Sistem Siap & Terhubung ke Database</span>
        </div>

        {/* Judul Utama Aplikasi */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Sistem Pendukung Keputusan AHP
        </h1>
        <p className="text-lg text-slate-500 mb-10 leading-relaxed">
          Identifikasi Tingkat Risiko Perundungan Siswa Menggunakan Metode Analytic Hierarchy Process (AHP) Absolut.
        </p>

        {/* Tombol Menuju Halaman Login */}
        <div className="mb-12">
          {/* Menggunakan komponen Link dari Next.js agar perpindahan halaman mulus tanpa loading browser */}
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 text-lg rounded-xl shadow-md group">
              Masuk ke Sistem <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <hr className="border-slate-100 mb-10" />

        {/* Seksi Kredit Pengembang (Kelompok 1) */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left shadow-inner">
          <div className="flex items-center gap-2 mb-4 justify-center md:justify-start">
            <Users className="text-blue-600" size={22} />
            <h2 className="text-lg font-bold text-slate-800">Dikembangkan Oleh : Kelompok 1</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700 font-medium">
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Ihsan Auliya Habiburrahim
            </div>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Mikail Samyth Habibillah
            </div>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Sheva Ramadhan
            </div>
            <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              Duha Alul Bariq
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
// File: frontend/src/app/(dashboard)/dashboard/ahp/hierarki/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Network, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Kriteria {
   kode: string;
   nama: string;
   keterangan?: string; // Menambahkan opsi keterangan untuk tooltip
}

interface SubKriteria {
   kode: string;
   nama: string;
   color?: string;
   keterangan?: string; // Menambahkan opsi keterangan untuk tooltip
}

// Menambahkan deskripsi detail pada data fallback
const fallbackSubKriteria: SubKriteria[] = [
   { kode: "T1", nama: "Sangat Parah", keterangan: "Perundungan fisik/sosial berulang & phobia sekolah.", color: "text-red-700 bg-red-50 border-red-300" },
   { kode: "T2", nama: "Parah", keterangan: "Sering menjadi target ejekan & menarik diri.", color: "text-orange-700 bg-orange-50 border-orange-300" },
   { kode: "T3", nama: "Sedang", keterangan: "Sesekali terjadi konflik sosial ringan.", color: "text-yellow-700 bg-yellow-50 border-yellow-300" },
   { kode: "T4", nama: "Aman", keterangan: "Interaksi stabil, jarang ada masalah.", color: "text-blue-700 bg-blue-50 border-blue-300" },
   { kode: "T5", nama: "Sangat Aman", keterangan: "Lingkungan pergaulan sangat inklusif & suportif.", color: "text-green-700 bg-green-50 border-green-300" },
];

// Mengubah array string menjadi objek agar memiliki keterangan
const alternatifDummy = [
   { nama: "Siswa 1", keterangan: "Evaluasi untuk Alternatif ke-1" },
   { nama: "Siswa 2", keterangan: "Evaluasi untuk Alternatif ke-2" },
   { nama: "Siswa 3", keterangan: "Evaluasi untuk Alternatif ke-3" },
   { nama: "Siswa n", keterangan: "Mendukung n-jumlah siswa" }
];

export default function HierarkiPage() {
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [isLoaded, setIsLoaded] = useState(false);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`);
            const data = await response.json();
            if (data.success) {
               setKriteria(data.data);
            }
         } catch (error) {
            console.error("Gagal memuat data kriteria:", error);
         } finally {
            setTimeout(() => setIsLoaded(true), 100);
         }
      };
      fetchData();
   }, []);

   const getXPos = (index: number, total: number) => {
      if (total <= 1) return 50;
      return 10 + (index * (80 / (total - 1)));
   };

   const displayKriteria = kriteria.length > 0 ? kriteria : [
      { kode: 'C1', nama: 'Memuat...', keterangan: 'Mengambil data...' },
      { kode: 'C2', nama: 'Memuat...', keterangan: 'Mengambil data...' },
      { kode: 'C3', nama: 'Memuat...', keterangan: 'Mengambil data...' },
      { kode: 'C4', nama: 'Memuat...', keterangan: 'Mengambil data...' },
      { kode: 'C5', nama: 'Memuat...', keterangan: 'Mengambil data...' }
   ];

   return (
      <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         {/* HEADER */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-lg">
                  <Network className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight">Struktur Hierarki AHP</h1>
                  <p className="text-sm text-muted-foreground">
                     Peta dekomposisi masalah perundungan (Goal ➔ Kriteria ➔ Sub-Kriteria ➔ Alternatif).
                  </p>
               </div>
            </div>

            <Button asChild variant="outline" className="text-slate-600 shadow-sm border-slate-300">
               <Link href="/dashboard/ahp/perbandingan-kriteria">
                  Selanjutnya: Perbandingan Kriteria
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
               </Link>
            </Button>
         </div>

         {/* KANVAS HIERARKI (MURNI TANPA KOTAK CARD) */}
         <div className="w-full overflow-x-auto min-h-150 flex items-center justify-center pt-8">
            <div className="relative min-w-200 w-full max-w-5xl h-125">

               {/* LAPISAN SVG UNTUK GARIS PENGHUBUNG */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {isLoaded && displayKriteria.map((_, i) => (
                     <line
                        key={`l1-${i}`} x1="50%" y1="30" x2={`${getXPos(i, displayKriteria.length)}%`} y2="130"
                        stroke="#cbd5e1" strokeWidth="2"
                        className="animate-in fade-in duration-700 delay-500 fill-mode-both"
                     />
                  ))}
                  {isLoaded && displayKriteria.map((_, i) =>
                     fallbackSubKriteria.map((_, j) => (
                        <line
                           key={`l2-${i}-${j}`}
                           x1={`${getXPos(i, displayKriteria.length)}%`} y1="190"
                           x2={`${getXPos(j, fallbackSubKriteria.length)}%`} y2="310"
                           stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 2"
                           className="animate-in fade-in duration-700 delay-[900ms] fill-mode-both opacity-60"
                        />
                     ))
                  )}
                  {isLoaded && fallbackSubKriteria.map((_, i) =>
                     alternatifDummy.map((_, j) => (
                        <line
                           key={`l3-${i}-${j}`}
                           x1={`${getXPos(i, fallbackSubKriteria.length)}%`} y1="370"
                           x2={`${getXPos(j, alternatifDummy.length)}%`} y2="490"
                           stroke="#e2e8f0" strokeWidth="1"
                           className="animate-in fade-in duration-700 delay-[1200ms] fill-mode-both opacity-60"
                        />
                     ))
                  )}
               </svg>

               {/* ========================================= */}
               {/* LAPISAN ELEMEN (DENGAN EFEK HOVER TOOLTIP) */}
               {/* ========================================= */}

               {/* Level 1: GOAL */}
               {isLoaded && (
                  <div className="group absolute top-0 left-1/2 -translate-x-1/2 z-10 w-64 bg-blue-700 text-white p-2.5 rounded-lg text-center shadow-lg border border-blue-800 cursor-help animate-in zoom-in-50 fade-in duration-500 delay-300 fill-mode-both">
                     <span className="block text-[10px] uppercase text-blue-200 tracking-widest font-bold">Level 1: Goal</span>
                     <span className="font-bold text-sm">Evaluasi Risiko Perundungan</span>

                     {/* Tooltip Hover */}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-2.5 bg-slate-800 text-white text-[11px] leading-relaxed rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        Menemukan siswa yang paling berisiko menjadi korban perundungan untuk diberikan bimbingan konseling.
                        {/* Panah Tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                     </div>
                  </div>
               )}

               {/* Level 2: KRITERIA */}
               {isLoaded && displayKriteria.map((c, i) => (
                  <div
                     key={c.kode}
                     style={{ left: `${getXPos(i, displayKriteria.length)}%` }}
                     className="group absolute top-27.5 -translate-x-1/2 z-10 w-32 bg-white border-2 border-blue-300 text-blue-800 p-2 rounded-lg text-center shadow-md animate-in slide-in-from-top-4 fade-in duration-500 delay-[600ms] fill-mode-both hover:scale-110 hover:border-blue-500 transition-all cursor-help"
                  >
                     <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Level 2</span>
                     <span className="block font-black">{c.kode}</span>
                     <span className="text-[11px] leading-tight font-medium">{c.nama}</span>

                     {/* Tooltip Hover */}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-2 bg-slate-800 text-white text-[10px] font-normal leading-relaxed rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        {c.keterangan || `Faktor pemicu risiko: ${c.nama}`}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                     </div>
                  </div>
               ))}

               {/* Level 3: SUB-KRITERIA */}
               {isLoaded && fallbackSubKriteria.map((s, i) => (
                  <div
                     key={s.kode}
                     style={{ left: `${getXPos(i, fallbackSubKriteria.length)}%` }}
                     className={`group absolute top-72.5 -translate-x-1/2 z-10 w-28 border-2 p-2 rounded-lg text-center shadow-md animate-in slide-in-from-top-4 fade-in duration-500 delay-[900ms] fill-mode-both hover:scale-110 hover:shadow-lg transition-all cursor-help ${s.color}`}
                  >
                     <span className="block text-[10px] uppercase opacity-70 font-bold mb-1">Level 3</span>
                     <span className="block font-black">{s.kode}</span>
                     <span className="text-[11px] leading-tight font-bold">{s.nama}</span>

                     {/* Tooltip Hover */}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-40 p-2 bg-slate-800 text-white text-[10px] font-normal leading-relaxed rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        {s.keterangan}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                     </div>
                  </div>
               ))}

               {/* Level 4: ALTERNATIF */}
               {isLoaded && alternatifDummy.map((alt, i) => (
                  <div
                     key={alt.nama}
                     style={{ left: `${getXPos(i, alternatifDummy.length)}%` }}
                     className={`group absolute top-117.5 -translate-x-1/2 z-10 w-24 p-2 rounded-lg text-center shadow-md border-2 animate-in slide-in-from-top-4 fade-in duration-500 delay-[1200ms] fill-mode-both hover:scale-110 transition-all cursor-help
                       ${alt.nama === "Siswa n" ? "bg-emerald-50 text-emerald-700 border-emerald-400 border-dashed" : "bg-slate-800 text-white border-slate-900"}`}
                  >
                     <span className="block text-[9px] uppercase text-slate-400 font-bold mb-0.5">Level 4</span>
                     <span className="text-[11px] font-bold">{alt.nama}</span>

                     {/* Tooltip Hover */}
                     <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-36 p-2 bg-slate-700 text-white text-[10px] font-normal leading-relaxed rounded-md shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                        {alt.keterangan}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></div>
                     </div>
                  </div>
               ))}

            </div>
         </div>
      </div>
   );
}
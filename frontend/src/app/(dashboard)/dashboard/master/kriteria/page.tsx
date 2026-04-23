// File: frontend/src/app/(dashboard)/dashboard/master/kriteria/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Database, Calculator, Network } from "lucide-react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";

interface Kriteria {
   id: number;
   kode: string;
   nama: string;
   keterangan: string;
   bobot: number;
}

const subKriteriaData = [
   { kode: "T1", nama: "Sangat Parah", eigen: 0.4162, bobot: 1.0000, color: "text-red-700 bg-red-50 border-red-300" },
   { kode: "T2", nama: "Parah", eigen: 0.2618, bobot: 0.6290, color: "text-orange-700 bg-orange-50 border-orange-300" },
   { kode: "T3", nama: "Sedang", eigen: 0.1610, bobot: 0.3868, color: "text-yellow-700 bg-yellow-50 border-yellow-300" },
   { kode: "T4", nama: "Aman", eigen: 0.0986, bobot: 0.2369, color: "text-blue-700 bg-blue-50 border-blue-300" },
   { kode: "T5", nama: "Sangat Aman", eigen: 0.0624, bobot: 0.1499, color: "text-green-700 bg-green-50 border-green-300" },
];

const matriksPerbandingan = [
   { baris: "T1", T1: "1", T2: "2", T3: "3", T4: "4", T5: "6", eigen: "0.4162" },
   { baris: "T2", T1: "1/2", T2: "1", T3: "2", T4: "3", T5: "4", eigen: "0.2618" },
   { baris: "T3", T1: "1/3", T2: "1/2", T3: "1", T4: "2", T5: "3", eigen: "0.1610" },
   { baris: "T4", T1: "1/4", T2: "1/3", T3: "1/2", T4: "1", T5: "2", eigen: "0.0986" },
   { baris: "T5", T1: "1/6", T2: "1/4", T3: "1/3", T4: "1/2", T5: "1", eigen: "0.0624" },
];

// Data alternatif untuk divisualisasikan di bagan
const alternatifDummy = ["Siswa 1", "Siswa 2", "Siswa 3", "Siswa n"];

export default function DataKriteriaPage() {
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchKriteria = async () => {
         try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`);
            const data = await response.json();
            if (data.success) setKriteria(data.data);
         } catch (error) {
            console.error("Gagal memuat data:", error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchKriteria();
   }, []);

   const maxEigen = Math.max(...subKriteriaData.map(sub => sub.eigen));

   // Fungsi matematis untuk mengatur jarak antar kotak di SVG secara dinamis
   const getXPos = (index: number, total: number) => {
      if (total === 1) return 50;
      return 10 + (index * (80 / (total - 1))); // Menyebar dari 10% hingga 90%
   };

   // Menggunakan kriteria dummy saat loading agar garis tidak error
   const displayKriteria = kriteria.length > 0 ? kriteria : [
      { kode: 'C1', nama: 'Loading...' }, { kode: 'C2', nama: 'Loading...' },
      { kode: 'C3', nama: 'Loading...' }, { kode: 'C4', nama: 'Loading...' }, { kode: 'C5', nama: 'Loading...' }
   ];

   return (
      <div className="space-y-6 pb-10">
         {/* Header */}
         <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
               <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Master Data Kriteria</h1>
               <p className="text-sm text-muted-foreground">
                  Kelola parameter utama dan intensitas penilaian AHP Absolut.
               </p>
            </div>
         </div>

         {/* BAGIAN DIAGRAM HIERARKI MURNI (SVG NETWORK GRAPH) */}
         <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
               <Network className="w-5 h-5 text-slate-600" />
               <h2 className="font-semibold text-card-foreground">Struktur Hierarki Keputusan (AHP Absolut)</h2>
            </div>

            {/* Area Kanvas Diagram - Menggunakan overflow-x-auto agar aman di HP */}
            <div className="w-full overflow-x-auto bg-slate-50/50 p-4">
               <div className="relative min-w-200 h-150 mx-auto">

                  {/* LAPISAN 1: GARIS SVG PENYAMBUNG (Background) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">

                     {/* 1. Garis Goal ke Kriteria (Warna Biru Gelap) */}
                     {displayKriteria.map((_, i) => (
                        <line key={`l1-${i}`} x1="50%" y1="60" x2={`${getXPos(i, displayKriteria.length)}%`} y2="160" stroke="#94a3b8" strokeWidth="2" />
                     ))}

                     {/* 2. Garis Kriteria ke Sub-Kriteria (Jaring-jaring AHP) */}
                     {displayKriteria.map((_, i) =>
                        subKriteriaData.map((_, j) => (
                           <line key={`l2-${i}-${j}`}
                              x1={`${getXPos(i, displayKriteria.length)}%`} y1="220"
                              x2={`${getXPos(j, subKriteriaData.length)}%`} y2="340"
                              stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" className="opacity-50" />
                        ))
                     )}

                     {/* 3. Garis Sub-Kriteria ke Alternatif Siswa */}
                     {subKriteriaData.map((_, i) =>
                        alternatifDummy.map((_, j) => (
                           <line key={`l3-${i}-${j}`}
                              x1={`${getXPos(i, subKriteriaData.length)}%`} y1="400"
                              x2={`${getXPos(j, alternatifDummy.length)}%`} y2="520"
                              stroke="#cbd5e1" strokeWidth="1" />
                        ))
                     )}
                  </svg>

                  {/* LAPISAN 2: KOTAK-KOTAK HIERARKI (Foreground) */}

                  {/* Level 1: GOAL */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 w-64 bg-blue-700 text-white p-2.5 rounded-lg text-center shadow-lg border border-blue-800">
                     <span className="block text-[10px] uppercase text-blue-200 tracking-widest font-bold">Level 1: Goal</span>
                     <span className="font-bold text-sm">Evaluasi Risiko Perundungan</span>
                  </div>

                  {/* Level 2: KRITERIA */}
                  {displayKriteria.map((c, i) => (
                     <div key={c.kode} style={{ left: `${getXPos(i, displayKriteria.length)}%` }}
                        className="absolute top-40 -translate-x-1/2 z-10 w-32 bg-white border-2 border-blue-300 text-blue-800 p-2 rounded-lg text-center shadow-md">
                        <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Level 2</span>
                        <span className="block font-black">{c.kode}</span>
                        <span className="text-[11px] leading-tight font-medium">{c.nama}</span>
                     </div>
                  ))}

                  {/* Level 3: SUB-KRITERIA (Intensitas) */}
                  {subKriteriaData.map((s, i) => (
                     <div key={s.kode} style={{ left: `${getXPos(i, subKriteriaData.length)}%` }}
                        className={`absolute top-85 -translate-x-1/2 z-10 w-28 border-2 p-2 rounded-lg text-center shadow-md ${s.color}`}>
                        <span className="block text-[10px] uppercase opacity-70 font-bold mb-1">Level 3</span>
                        <span className="block font-black">{s.kode}</span>
                        <span className="text-[11px] leading-tight font-bold">{s.nama}</span>
                     </div>
                  ))}

                  {/* Level 4: ALTERNATIF SISWA */}
                  {alternatifDummy.map((alt, i) => (
                     <div key={alt} style={{ left: `${getXPos(i, alternatifDummy.length)}%` }}
                        className={`absolute top-130 -translate-x-1/2 z-10 w-24 p-2 rounded-lg text-center shadow-md border-2 
                          ${alt === "Siswa n" ? "bg-emerald-50 text-emerald-700 border-emerald-400 border-dashed" : "bg-slate-800 text-white border-slate-900"}`}>
                        <span className="block text-[9px] uppercase text-slate-400 font-bold mb-0.5">Level 4</span>
                        <span className="text-[11px] font-bold">{alt}</span>
                     </div>
                  ))}

               </div>
            </div>
         </div>

         {/* BAGIAN TENGAH: TABEL OPERASIONAL PURE */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border rounded-lg bg-card flex flex-col shadow-sm">
               <div className="p-4 border-b bg-muted/30">
                  <h2 className="font-semibold text-card-foreground">1. Kriteria Utama</h2>
               </div>
               <div className="flex-1">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-20 text-center">Kode</TableHead>
                           <TableHead>Kriteria</TableHead>
                           <TableHead className="text-right">Bobot Global</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {isLoading ? (
                           <TableRow>
                              <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">Memuat data...</TableCell>
                           </TableRow>
                        ) : kriteria.map((item) => (
                           <TableRow key={item.id}>
                              <TableCell className="text-center font-medium">{item.kode}</TableCell>
                              <TableCell>
                                 <div className="font-medium">{item.nama}</div>
                                 <div className="text-xs text-muted-foreground mt-0.5">{item.keterangan}</div>
                              </TableCell>
                              <TableCell className="text-right font-mono font-medium">
                                 {item.bobot?.toFixed(4) || "0.0000"}
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            </div>

            <div className="border rounded-lg bg-card flex flex-col shadow-sm">
               <div className="p-4 border-b bg-muted/30">
                  <h2 className="font-semibold text-card-foreground">2. Intensitas Risiko (Sub-Kriteria)</h2>
               </div>
               <div className="flex-1 overflow-x-auto">
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead className="w-16 text-center">Kode</TableHead>
                           <TableHead>Skala Kondisi</TableHead>
                           <TableHead className="text-right">Nilai Eigen</TableHead>
                           <TableHead className="text-right">Bobot Ideal</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {subKriteriaData.map((sub) => (
                           <TableRow key={sub.kode}>
                              <TableCell className="text-center text-muted-foreground">{sub.kode}</TableCell>
                              <TableCell>
                                 <span className={`px-2 py-1 text-[11px] font-medium border rounded-md ${sub.color}`}>
                                    {sub.nama}
                                 </span>
                              </TableCell>
                              <TableCell className="text-right font-mono text-muted-foreground">
                                 {sub.eigen.toFixed(4)}
                              </TableCell>
                              <TableCell className="text-right font-mono font-bold text-slate-700">
                                 {sub.bobot.toFixed(4)}
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               </div>
            </div>
         </div>

         {/* BAGIAN BAWAH: LAMPIRAN VALIDASI PERHITUNGAN */}
         <div className="border rounded-lg bg-card mt-8 shadow-sm">
            <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
               <Calculator className="w-5 h-5 text-slate-600" />
               <h2 className="font-semibold text-card-foreground">3. Lampiran Validasi Perhitungan (AHP Absolut)</h2>
            </div>

            <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                     <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs">A</span>
                     Mencari Nilai Eigen (W<sub>i</sub>)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     Nilai Eigen didapatkan dari rata-rata baris matriks perbandingan berpasangan (Pairwise Comparison) menggunakan skala Saaty (1-9).
                  </p>
                  <div className="overflow-x-auto border rounded-lg">
                     <Table>
                        <TableHeader className="bg-slate-50">
                           <TableRow>
                              <TableHead className="w-12 text-center font-bold border-r">Kriteria</TableHead>
                              <TableHead className="text-center">T1</TableHead>
                              <TableHead className="text-center">T2</TableHead>
                              <TableHead className="text-center">T3</TableHead>
                              <TableHead className="text-center">T4</TableHead>
                              <TableHead className="text-center border-r">T5</TableHead>
                              <TableHead className="text-center font-bold text-blue-700 bg-blue-50/50">W<sub>i</sub></TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {matriksPerbandingan.map((row, idx) => (
                              <TableRow key={idx}>
                                 <TableCell className="text-center font-bold border-r bg-slate-50">{row.baris}</TableCell>
                                 <TableCell className="text-center font-mono text-[11px] text-muted-foreground">{row.T1}</TableCell>
                                 <TableCell className="text-center font-mono text-[11px] text-muted-foreground">{row.T2}</TableCell>
                                 <TableCell className="text-center font-mono text-[11px] text-muted-foreground">{row.T3}</TableCell>
                                 <TableCell className="text-center font-mono text-[11px] text-muted-foreground">{row.T4}</TableCell>
                                 <TableCell className="text-center font-mono text-[11px] text-muted-foreground border-r">{row.T5}</TableCell>
                                 <TableCell className="text-center font-mono text-[11px] font-bold text-blue-700 bg-blue-50/20">
                                    {row.eigen}
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                     <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs">B</span>
                     Proses Idealisasi (I<sub>i</sub>)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                     Bobot Ideal didapatkan dengan membagi setiap Nilai Eigen dengan Nilai Eigen Tertinggi (W<sub>max</sub>). Diketahui W<sub>max</sub> adalah <strong>{maxEigen.toFixed(4)}</strong>.
                  </p>

                  <div className="overflow-x-auto border rounded-lg">
                     <Table>
                        <TableHeader className="bg-slate-50">
                           <TableRow>
                              <TableHead className="w-12 text-center font-bold border-r">Kode</TableHead>
                              <TableHead className="text-center">Rumus (W<sub>i</sub> / W<sub>max</sub>)</TableHead>
                              <TableHead className="text-right font-bold text-emerald-700 bg-emerald-50/50">Bobot Ideal (I<sub>i</sub>)</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {subKriteriaData.map((sub, idx) => (
                              <TableRow key={idx}>
                                 <TableCell className="text-center font-bold border-r bg-slate-50">{sub.kode}</TableCell>
                                 <TableCell className="text-center font-mono text-[11px] text-muted-foreground">
                                    {sub.eigen.toFixed(4)} ÷ {maxEigen.toFixed(4)}
                                 </TableCell>
                                 <TableCell className="text-right font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50/20">
                                    {sub.bobot.toFixed(4)}
                                 </TableCell>
                              </TableRow>
                           ))}
                        </TableBody>
                     </Table>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
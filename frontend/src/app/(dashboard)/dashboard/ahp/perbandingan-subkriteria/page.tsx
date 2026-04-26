// File: frontend/src/app/(dashboard)/dashboard/ahp/perbandingan-subkriteria/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Calculator, Network, GitCommit, CheckCircle2, ChevronRight, ChevronLeft, ClipboardList } from "lucide-react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Kriteria {
   id: number;
   kode: string;
   nama: string;
   bobot: number;
}

interface SubKriteria {
   id?: number;
   kode: string;
   nama: string;
   eigen: number; 
   bobot: number; 
   color?: string; 
}

const fallbackSubKriteria: SubKriteria[] = [
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

const alternatifDummy = ["Siswa 1", "Siswa 2", "Siswa 3", "Siswa n"];

const alurProsesAHP = [
   { label: "Struktur Hierarki", desc: "Pohon keputusan & Kriteria" },
   { label: "Intensitas Risiko", desc: "Skala penilaian baku T1-T5" },
   { label: "Matriks & Eigen", desc: "Perhitungan bobot prioritas" },
   { label: "Uji Konsistensi", desc: "Validasi rasio CR < 10%" },
   { label: "Bobot Ideal", desc: "Skor absolut maksimal" },
];

export default function PerbandinganSubKriteriaPage() {
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [subKriteriaData, setSubKriteriaData] = useState<SubKriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [activeStep, setActiveStep] = useState(0);

   useEffect(() => {
      const fetchData = async () => {
         try {
            const [resKriteria, resSubKriteria] = await Promise.all([
               fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`),
               fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subkriteria`).catch(() => null) 
            ]);

            const dataKrit = await resKriteria.json();
            if (dataKrit.success) setKriteria(dataKrit.data);

            if (resSubKriteria && resSubKriteria.ok) {
               const dataSub = await resSubKriteria.json();
               if (dataSub.success && dataSub.data.length > 0) {
                  const coloredData = dataSub.data.map((item: SubKriteria, idx: number) => ({
                     ...item,
                     color: fallbackSubKriteria[idx]?.color || "text-slate-700 bg-slate-50 border-slate-300"
                  }));
                  setSubKriteriaData(coloredData);
               } else {
                  setSubKriteriaData(fallbackSubKriteria);
               }
            } else {
               setSubKriteriaData(fallbackSubKriteria);
            }
         } catch (error) {
            console.error("Gagal memuat data:", error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchData();
   }, []);

   const eigenValues = subKriteriaData.length > 0 ? subKriteriaData.map(sub => sub.eigen) : [0];
   const maxEigen = Math.max(...eigenValues);

   const getXPos = (index: number, total: number) => {
      if (total <= 1) return 50;
      return 10 + (index * (80 / (total - 1)));
   };

   const displayKriteria = kriteria.length > 0 ? kriteria : [
      { kode: 'C1', nama: 'Loading...', bobot: 0 }, { kode: 'C2', nama: 'Loading...', bobot: 0 },
      { kode: 'C3', nama: 'Loading...', bobot: 0 }, { kode: 'C4', nama: 'Loading...', bobot: 0 }, { kode: 'C5', nama: 'Loading...', bobot: 0 }
   ];

   return (
      <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
               <ClipboardList className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Perbandingan Sub-Kriteria</h1>
               <p className="text-sm text-muted-foreground">
                  Proses perhitungan matematis intensitas risiko (T1-T5) metode AHP Absolut.
               </p>
            </div>
         </div>

         {/* VISUALISASI ALUR PROSES */}
         <div className="bg-white p-6 border rounded-xl shadow-sm mb-6">
            <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <GitCommit className="text-primary" size={20} />
               Alur Tahapan Perhitungan Metode AHP Absolut
            </h2>
            
            <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto px-4 md:px-10">
               <div className="absolute left-0 top-6 w-full h-1 bg-slate-100 z-0 rounded-full"></div>
               {alurProsesAHP.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isPassed = idx < activeStep;

                  return (
                     <div key={idx} className="relative z-10 flex flex-col items-center group">
                        <button 
                           onClick={() => setActiveStep(idx)}
                           className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold border-4 transition-all duration-300 focus:outline-none shadow-md cursor-pointer
                              ${isActive 
                                 ? 'bg-primary text-white border-blue-200 scale-110' 
                                 : isPassed 
                                    ? 'bg-blue-100 text-blue-700 border-white hover:bg-blue-200' 
                                    : 'bg-slate-50 text-slate-400 border-white hover:bg-slate-100'}`}
                        >
                           {idx + 1}
                        </button>
                        <div className="absolute top-14 w-28 text-center cursor-default pointer-events-none">
                           <span className={`block text-[11px] font-bold leading-tight transition-colors ${isActive ? 'text-primary' : 'text-slate-500'}`}>
                              {step.label}
                           </span>
                           <span className="block text-[9px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute w-full left-1/2 -translate-x-1/2 bg-slate-800 text-white p-1.5 rounded shadow-lg z-20">
                              {step.desc}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>
            <div className="h-12"></div>
         </div>

         <div className="min-h-[400px]">
            {/* STEP 0: HIERARKI */}
            {activeStep === 0 && (
               <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
                     <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                        <Network className="w-5 h-5 text-slate-600" />
                        <h2 className="font-semibold text-card-foreground">Struktur Hierarki Keputusan</h2>
                     </div>
                     <div className="w-full overflow-x-auto bg-slate-50/50 p-4">
                        <div className="relative min-w-200 h-150 mx-auto">
                           <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                              {displayKriteria.map((_, i) => (
                                 <line key={`l1-${i}`} x1="50%" y1="60" x2={`${getXPos(i, displayKriteria.length)}%`} y2="160" stroke="#94a3b8" strokeWidth="2" />
                              ))}
                              {displayKriteria.map((_, i) =>
                                 subKriteriaData.map((_, j) => (
                                    <line key={`l2-${i}-${j}`} x1={`${getXPos(i, displayKriteria.length)}%`} y1="220" x2={`${getXPos(j, subKriteriaData.length)}%`} y2="340" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 2" className="opacity-50" />
                                 ))
                              )}
                              {subKriteriaData.map((_, i) =>
                                 alternatifDummy.map((_, j) => (
                                    <line key={`l3-${i}-${j}`} x1={`${getXPos(i, subKriteriaData.length)}%`} y1="400" x2={`${getXPos(j, alternatifDummy.length)}%`} y2="520" stroke="#cbd5e1" strokeWidth="1" />
                                 ))
                              )}
                           </svg>
                           <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-10 w-64 bg-blue-700 text-white p-2.5 rounded-lg text-center shadow-lg border border-blue-800">
                              <span className="block text-[10px] uppercase text-blue-200 tracking-widest font-bold">Level 1: Goal</span>
                              <span className="font-bold text-sm">Evaluasi Risiko Perundungan</span>
                           </div>
                           {displayKriteria.map((c, i) => (
                              <div key={c.kode} style={{ left: `${getXPos(i, displayKriteria.length)}%` }} className="absolute top-40 -translate-x-1/2 z-10 w-32 bg-white border-2 border-blue-300 text-blue-800 p-2 rounded-lg text-center shadow-md">
                                 <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Level 2</span>
                                 <span className="block font-black">{c.kode}</span>
                                 <span className="text-[11px] leading-tight font-medium">{c.nama}</span>
                              </div>
                           ))}
                           {subKriteriaData.map((s, i) => (
                              <div key={s.kode} style={{ left: `${getXPos(i, subKriteriaData.length)}%` }} className={`absolute top-85 -translate-x-1/2 z-10 w-28 border-2 p-2 rounded-lg text-center shadow-md ${s.color}`}>
                                 <span className="block text-[10px] uppercase opacity-70 font-bold mb-1">Level 3</span>
                                 <span className="block font-black">{s.kode}</span>
                                 <span className="text-[11px] leading-tight font-bold">{s.nama}</span>
                              </div>
                           ))}
                           {alternatifDummy.map((alt, i) => (
                              <div key={alt} style={{ left: `${getXPos(i, alternatifDummy.length)}%` }} className={`absolute top-130 -translate-x-1/2 z-10 w-24 p-2 rounded-lg text-center shadow-md border-2 ${alt === "Siswa n" ? "bg-emerald-50 text-emerald-700 border-emerald-400 border-dashed" : "bg-slate-800 text-white border-slate-900"}`}>
                                 <span className="block text-[9px] uppercase text-slate-400 font-bold mb-0.5">Level 4</span>
                                 <span className="text-[11px] font-bold">{alt}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* STEP 1: INTENSITAS RISIKO */}
            {activeStep === 1 && (
               <div className="border rounded-lg bg-card flex flex-col shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-4 border-b bg-muted/30">
                     <h2 className="font-semibold text-card-foreground">Data Intensitas Risiko (Sub-Kriteria Baku)</h2>
                  </div>
                  <div className="flex-1 overflow-x-auto p-4">
                     <div className="border rounded-lg overflow-hidden">
                        <Table>
                           <TableHeader className="bg-slate-50">
                              <TableRow>
                                 <TableHead className="w-16 text-center">Kode</TableHead>
                                 <TableHead>Skala Kondisi</TableHead>
                                 <TableHead className="text-right">Nilai Eigen (W<sub>i</sub>)</TableHead>
                                 <TableHead className="text-right">Bobot Ideal (I<sub>i</sub>)</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {isLoading ? (
                                 <TableRow key="loading-subkriteria">
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">Memuat data...</TableCell>
                                 </TableRow>
                              ) : subKriteriaData.map((sub, idx) => (
                                 <TableRow key={sub.id || `sub-${idx}`}>
                                    <TableCell className="text-center font-bold text-slate-500">{sub.kode}</TableCell>
                                    <TableCell>
                                       <span className={`px-2 py-1 text-[11px] font-bold border rounded-md ${sub.color}`}>{sub.nama}</span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-muted-foreground">{sub.eigen?.toFixed(4) || "0.0000"}</TableCell>
                                    <TableCell className="text-right font-mono font-bold text-slate-700">{sub.bobot?.toFixed(4) || "0.0000"}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </div>
               </div>
            )}

            {/* STEP 2: MATRIKS & NILAI EIGEN */}
            {activeStep === 2 && (
               <div className="border rounded-lg bg-card shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                     <Calculator className="w-5 h-5 text-slate-600" />
                     <h2 className="font-semibold text-card-foreground">Mencari Nilai Eigen (W<sub>i</sub>)</h2>
                  </div>
                  <div className="p-6">
                     <div className="overflow-x-auto border rounded-lg">
                        <Table>
                           <TableHeader className="bg-slate-50">
                              <TableRow>
                                 <TableHead className="w-16 text-center font-bold border-r">Kode</TableHead>
                                 <TableHead className="text-center">T1</TableHead>
                                 <TableHead className="text-center">T2</TableHead>
                                 <TableHead className="text-center">T3</TableHead>
                                 <TableHead className="text-center">T4</TableHead>
                                 <TableHead className="text-center border-r">T5</TableHead>
                                 <TableHead className="text-center font-bold text-blue-700 bg-blue-50/50">Nilai Eigen (W<sub>i</sub>)</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {matriksPerbandingan.map((row, idx) => (
                                 <TableRow key={`matriks-${idx}`} className="hover:bg-slate-50">
                                    <TableCell className="text-center font-bold border-r bg-slate-50">{row.baris}</TableCell>
                                    <TableCell className="text-center font-mono text-[12px] text-slate-600">{row.T1}</TableCell>
                                    <TableCell className="text-center font-mono text-[12px] text-slate-600">{row.T2}</TableCell>
                                    <TableCell className="text-center font-mono text-[12px] text-slate-600">{row.T3}</TableCell>
                                    <TableCell className="text-center font-mono text-[12px] text-slate-600">{row.T4}</TableCell>
                                    <TableCell className="text-center font-mono text-[12px] text-slate-600 border-r">{row.T5}</TableCell>
                                    <TableCell className="text-center font-mono text-[13px] font-bold text-blue-700 bg-blue-50/20">{row.eigen}</TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </div>
               </div>
            )}

            {/* STEP 3: UJI KONSISTENSI */}
            {activeStep === 3 && (
               <div className="bg-white border rounded-xl shadow-sm p-8 text-center animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                     <CheckCircle2 className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Matriks Dinyatakan Konsisten</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
                     <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lambda Max (λ)</p>
                        <p className="text-2xl font-mono font-bold text-slate-800">5.2498</p>
                     </div>
                     <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Index (CI)</p>
                        <p className="text-2xl font-mono font-bold text-slate-800">0.0624</p>
                     </div>
                     <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Random (RI)</p>
                        <p className="text-2xl font-mono font-bold text-slate-800">1.12</p>
                     </div>
                     <div className="p-5 bg-green-50 rounded-xl border border-green-200 shadow-sm ring-1 ring-green-100">
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wider mb-2">Rasio (CR)</p>
                        <p className="text-3xl font-mono font-black text-green-600">5.57%</p>
                     </div>
                  </div>
               </div>
            )}

            {/* STEP 4: BOBOT IDEAL */}
            {activeStep === 4 && (
               <div className="border rounded-lg bg-card shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
                     <Calculator className="w-5 h-5 text-slate-600" />
                     <h2 className="font-semibold text-card-foreground">Proses Idealisasi (Bobot Maksimal 1.0)</h2>
                  </div>
                  <div className="p-6">
                     <div className="overflow-x-auto border rounded-lg max-w-2xl mx-auto">
                        <Table>
                           <TableHeader className="bg-slate-50">
                              <TableRow>
                                 <TableHead className="w-16 text-center font-bold border-r">Kode</TableHead>
                                 <TableHead className="text-center">Rumus (W<sub>i</sub> / W<sub>max</sub>)</TableHead>
                                 <TableHead className="text-right font-bold text-emerald-700 bg-emerald-50/50">Bobot Ideal (I<sub>i</sub>)</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {subKriteriaData.map((sub, idx) => (
                                 <TableRow key={`idealisasi-${idx}`} className="hover:bg-slate-50">
                                    <TableCell className="text-center font-bold border-r bg-slate-50">{sub.kode}</TableCell>
                                    <TableCell className="text-center font-mono text-[13px] text-slate-600">
                                       {sub.eigen?.toFixed(4)} ÷ {maxEigen.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-base font-bold text-emerald-700 bg-emerald-50/20">
                                       {sub.bobot?.toFixed(4)}
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* NAVIGASI WIZARD */}
         <div className="flex items-center justify-between pt-6 border-t mt-8">
            <Button 
               variant="outline" 
               onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
               disabled={activeStep === 0}
            >
               <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
            </Button>
            
            {activeStep < alurProsesAHP.length - 1 ? (
               <Button onClick={() => setActiveStep(prev => Math.min(alurProsesAHP.length - 1, prev + 1))}>
                  Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
               </Button>
            ) : (
               <Button onClick={() => setActiveStep(0)} className="bg-emerald-600 hover:bg-emerald-700">
                  Kembali ke Awal
               </Button>
            )}
         </div>
      </div>
   );
}
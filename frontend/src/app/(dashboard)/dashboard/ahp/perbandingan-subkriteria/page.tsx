// File: frontend/src/app/(dashboard)/dashboard/ahp/perbandingan-subkriteria/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
   Save, RefreshCw, Info, AlertTriangle,
   CheckCircle2, XCircle, Calculator, Sigma,
   PieChart, BookOpen, Activity,
   GitCommit, ChevronLeft, ChevronRight, Target, ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface SubKriteria {
   id: number;
   kode: string;
   nama: string;
}

interface AhpResult {
   bobot: Record<string, number>;
   lambdaMax: number;
   ci: number;
   cr: number;
   isKonsisten: boolean;
}

const alurProsesAHP = [
   { label: "Input Matriks", desc: "Isi perbandingan antar T1-T5" },
   { label: "Normalisasi", desc: "Pembagian matriks kolom" },
   { label: "Vektor Prioritas", desc: "Perhitungan bobot (Eigen)" },
   { label: "Uji Konsistensi", desc: "Validasi rasio (CR < 10%)" },
   { label: "Bobot Ideal (I)", desc: "Skor absolut maksimal" },
];

export default function PerbandinganSubKriteriaPage() {
   const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>({});
   const [warnings, setWarnings] = useState<string[]>([]);
   const [errorPairs, setErrorPairs] = useState<Set<string>>(new Set());
   const [isResultOpen, setIsResultOpen] = useState(false);
   const [resultMessage, setResultMessage] = useState<{ isSuccess: boolean; message: string } | null>(null);
   const [ahpResult, setAhpResult] = useState<AhpResult | null>(null);

   const [activeStep, setActiveStep] = useState(0);

   const fetchSubKriteria = useCallback(async () => {
      setIsLoading(true);
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subkriteria`);
         const json = await res.json();

         if (json.success && json.data.length > 0) {
            const data = json.data;
            setSubKriteria(data);

            const savedMatrix = localStorage.getItem('ahpMatrixSub');
            const savedResult = localStorage.getItem('ahpResultSub');

            if (savedMatrix) {
               setMatrix(JSON.parse(savedMatrix));
            } else {
               const initialMatrix: Record<string, Record<string, number>> = {};
               data.forEach((baris: SubKriteria) => {
                  initialMatrix[baris.kode] = {};
                  data.forEach((kolom: SubKriteria) => {
                     initialMatrix[baris.kode][kolom.kode] = 1;
                  });
               });
               setMatrix(initialMatrix);
            }

            if (savedResult) {
               setAhpResult(JSON.parse(savedResult));
            }
         }
      } catch (error) {
         console.error("Gagal memuat sub-kriteria:", error);
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchSubKriteria();
   }, [fetchSubKriteria]);

   const checkLogika = (currentMatrix: Record<string, Record<string, number>>) => {
      const keys = subKriteria.map(k => k.kode);
      const newWarnings: string[] = [];
      const newErrorPairs = new Set<string>();

      for (let i = 0; i < keys.length; i++) {
         for (let j = 0; j < keys.length; j++) {
            for (let k = 0; k < keys.length; k++) {
               if (i !== j && j !== k && i !== k) {
                  const A = keys[i]; const B = keys[j]; const C = keys[k];
                  if (currentMatrix[A]?.[B] > 1 && currentMatrix[B]?.[C] > 1) {
                     if (currentMatrix[A]?.[C] < 1) {
                        const msg = `Inkonsistensi Logika: Nilai ${A} > ${B} dan ${B} > ${C}, namun ${C} > ${A}.`;
                        if (!newWarnings.includes(msg)) {
                           newWarnings.push(msg);
                           newErrorPairs.add(`${A}-${B}`); newErrorPairs.add(`${B}-${A}`);
                           newErrorPairs.add(`${B}-${C}`); newErrorPairs.add(`${C}-${B}`);
                           newErrorPairs.add(`${A}-${C}`); newErrorPairs.add(`${C}-${A}`);
                        }
                     }
                  }
               }
            }
         }
      }
      setWarnings(Array.from(new Set(newWarnings)));
      setErrorPairs(newErrorPairs);
      if (newWarnings.length > 0) setAhpResult(null);
   };

   const handleMatrixChange = (barisKode: string, kolomKode: string, value: number) => {
      setMatrix((prev) => {
         const newMatrix = { ...prev };
         newMatrix[barisKode] = { ...newMatrix[barisKode], [kolomKode]: value };
         newMatrix[kolomKode] = { ...newMatrix[kolomKode], [barisKode]: 1 / value };
         checkLogika(newMatrix);
         setAhpResult(null);
         return newMatrix;
      });
   };

   const handleSimpan = async () => {
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ahp/hitung-subkriteria`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matrix })
         });
         const result = await response.json();

         if (result.success) {
            setResultMessage({ isSuccess: result.data.isKonsisten, message: result.message });
            setAhpResult(result.data);

            if (result.data.isKonsisten) {
               localStorage.setItem('ahpMatrixSub', JSON.stringify(matrix));
               localStorage.setItem('ahpResultSub', JSON.stringify(result.data));
               setIsResultOpen(true);
               setActiveStep(1);
            } else {
               setIsResultOpen(true);
            }
         }
      } catch (error) {
         console.error("Kesalahan jaringan:", error);
      }
   };

   const pairs: { b: SubKriteria; k: SubKriteria }[] = [];
   for (let i = 0; i < subKriteria.length; i++) {
      for (let j = i + 1; j < subKriteria.length; j++) {
         pairs.push({ b: subKriteria[i], k: subKriteria[j] });
      }
   }

   const getSliderValue = (realValue: number) => {
      if (!realValue) return 0;
      if (realValue >= 1) return Math.round(realValue - 1);
      return -Math.round((1 / realValue) - 1);
   };

   const handleSliderChange = (bKode: string, kKode: string, sliderVal: number) => {
      let realVal = 1;
      if (sliderVal > 0) realVal = sliderVal + 1;
      else if (sliderVal < 0) realVal = 1 / (Math.abs(sliderVal) + 1);
      handleMatrixChange(bKode, kKode, realVal);
   };

   const getSliderLabel = (val: number, leftName: string, rightName: string) => {
      if (val === 0) return "Sama Penting (Seimbang)";
      const absVal = Math.abs(val) + 1;
      const target = val > 0 ? leftName : rightName;
      let desc = "";
      if (absVal === 2) desc = "Mendekati Sedikit Lebih";
      else if (absVal === 3) desc = "Sedikit Lebih Penting";
      else if (absVal === 4) desc = "Mendekati Lebih";
      else if (absVal === 5) desc = "Lebih Penting";
      else if (absVal === 6) desc = "Mendekati Sangat";
      else if (absVal === 7) desc = "Sangat Penting";
      else if (absVal === 8) desc = "Mendekati Mutlak";
      else if (absVal === 9) desc = "Mutlak Lebih Penting";
      return `${target} ${desc}`;
   };

   const colSums: Record<string, number> = {};
   if (subKriteria.length > 0) {
      subKriteria.forEach(k => colSums[k.kode] = 0);
      subKriteria.forEach(baris => {
         subKriteria.forEach(kolom => { colSums[kolom.kode] += matrix[baris.kode]?.[kolom.kode] || 1; });
      });
   }

   const n = subKriteria.length;
   const wsv: Record<string, number> = {};
   const rasio: Record<string, number> = {};
   let calculatedLambdaMax = 0;

   // PERBAIKAN 2 & 3: Mendefinisikan maxEigen secara dinamis dan menghapus maxSubNama yang tidak dipakai
   let maxEigen = 1;

   if (ahpResult) {
      // Mencari nilai bobot/eigen tertinggi dari respons backend
      maxEigen = Math.max(...Object.values(ahpResult.bobot));

      subKriteria.forEach(baris => {
         let sum = 0;
         subKriteria.forEach(kolom => {
            const valAwal = matrix[baris.kode]?.[kolom.kode] || 1;
            const eigenKolom = ahpResult.bobot[kolom.kode] || 0;
            sum += (valAwal * eigenKolom);
         });
         wsv[baris.kode] = sum;

         const eigenBaris = ahpResult.bobot[baris.kode] || 1;
         rasio[baris.kode] = sum / eigenBaris;
         calculatedLambdaMax += rasio[baris.kode];
      });

      calculatedLambdaMax /= n;
   }

   const RI_TABLE: Record<number, number> = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };
   const currentRI = RI_TABLE[n] || 1.12;

   return (
      <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-primary/10 rounded-xl">
                  <ClipboardList className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Perbandingan Sub-Kriteria</h1>
                  <p className="text-sm text-slate-500 mt-1">
                     Pembobotan matriks intensitas risiko (T1-T5) untuk metode AHP Absolut.
                  </p>
               </div>
            </div>
            {activeStep === 0 && (
               <Button onClick={handleSimpan} className="flex items-center gap-2 shadow-md px-6 bg-emerald-600 hover:bg-emerald-700" disabled={warnings.length > 0 || subKriteria.length === 0}>
                  <Save size={16} /> Simpan & Hitung Bobot
               </Button>
            )}
         </div>

         {/* VISUALISASI STEPPER WIZARD */}
         <div className="bg-white p-6 border rounded-xl shadow-sm mb-6">
            <h2 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <GitCommit className="text-primary" size={20} />
               Alur Tahapan Perhitungan AHP Absolut
            </h2>

            <div className="relative flex items-center justify-between w-full max-w-4xl mx-auto px-4 md:px-10">
               <div className="absolute left-0 top-6 w-full h-1 bg-slate-100 z-0 rounded-full"></div>
               {alurProsesAHP.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const isPassed = idx < activeStep;
                  const isLocked = idx > 0 && !ahpResult;

                  return (
                     <div key={idx} className="relative z-10 flex flex-col items-center group">
                        <button
                           onClick={() => !isLocked && setActiveStep(idx)}
                           disabled={isLocked}
                           className={`w-12 h-12 rounded-full flex items-center justify-center font-extrabold border-4 transition-all duration-300 focus:outline-none shadow-md
                              ${isLocked ? 'bg-slate-100 text-slate-300 border-white cursor-not-allowed'
                                 : isActive
                                    ? 'bg-primary text-white border-blue-200 scale-110 cursor-pointer'
                                    : isPassed
                                       ? 'bg-blue-100 text-blue-700 border-white hover:bg-blue-200 cursor-pointer'
                                       : 'bg-slate-50 text-slate-400 border-white hover:bg-slate-100 cursor-pointer'}`}
                        >
                           {idx + 1}
                        </button>
                        <div className="absolute top-14 w-28 text-center cursor-default pointer-events-none">
                           <span className={`block text-[11px] font-bold leading-tight transition-colors ${isActive ? 'text-primary' : isLocked ? 'text-slate-300' : 'text-slate-500'}`}>
                              {step.label}
                           </span>
                           <span className="block text-[9px] text-slate-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute w-full left-1/2 -translate-x-1/2 bg-slate-800 p-1.5 rounded shadow-lg z-20">
                              {step.desc}
                           </span>
                        </div>
                     </div>
                  );
               })}
            </div>
            <div className="h-12"></div>
         </div>

         <div className="min-h-100">
            {isLoading ? (
               <div className="flex justify-center items-center py-20 text-slate-500"><RefreshCw className="animate-spin mr-2" size={24} /> Memuat data dari database...</div>
            ) : subKriteria.length === 0 ? (
               <div className="bg-red-50 border border-red-200 p-8 rounded-xl text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-red-800 mb-2">Data Sub-Kriteria Kosong</h3>
                  <p className="text-red-600">Pastikan Anda telah menambahkan data skala intensitas risiko (T1-T5) di menu Master Data Sub-Kriteria terlebih dahulu.</p>
               </div>
            ) : (
               <>
                  {/* === STEP 0: INPUT MATRIKS === */}
                  {activeStep === 0 && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        {warnings.length > 0 && (
                           <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
                              <div className="flex items-center gap-2 text-red-800 font-bold mb-2"><AlertTriangle size={18} /> Peringatan: Ditemukan {warnings.length} data tidak konsisten.</div>
                              <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-1">
                                 {warnings.map((msg, idx) => <li key={idx}>{msg}</li>)}
                              </ul>
                           </div>
                        )}
                        <div className="bg-white rounded-2xl border shadow-sm p-6">
                           <Tabs defaultValue="form" className="w-full">
                              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-slate-100 rounded-xl">
                                 <TabsTrigger value="form" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Mode Kuesioner (Geser)</TabsTrigger>
                                 <TabsTrigger value="tabel" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Mode Matriks (Pakar)</TabsTrigger>
                              </TabsList>

                              <TabsContent value="form" className="space-y-4">
                                 <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm border border-blue-100">
                                    <Info className="shrink-0 mt-0.5" size={18} />
                                    {/* PERBAIKAN 1: Menerapkan kode escape untuk tanda kutip ganda */}
                                    <p>Tentukan tingkat keparahan risiko antara satu kondisi dengan kondisi lainnya. Misalnya: &quot;Sangat Parah (T1) Mutlak Lebih Berisiko dibanding Sangat Aman (T5)&quot;.</p>
                                 </div>
                                 <div className="space-y-4">
                                    {pairs.map((pair, idx) => {
                                       const currentRealVal = matrix[pair.b.kode]?.[pair.k.kode] || 1;
                                       const sliderVal = getSliderValue(currentRealVal);
                                       const labelText = getSliderLabel(sliderVal, pair.b.kode, pair.k.kode);
                                       const isError = errorPairs.has(`${pair.b.kode}-${pair.k.kode}`);

                                       return (
                                          <div key={idx} className={`flex flex-col md:flex-row justify-between items-center p-5 rounded-xl transition-all shadow-sm gap-4 border-2 ${isError ? 'bg-red-50 border-red-400 shadow-red-100' : 'bg-slate-50 border-transparent hover:border-primary/20'}`}>
                                             <div className={`font-bold w-full md:w-[30%] text-center md:text-left ${sliderVal > 0 ? (isError ? 'text-red-700' : 'text-primary text-lg') : 'text-slate-600'}`}>{pair.b.kode} - {pair.b.nama}</div>
                                             <div className="w-full md:w-[40%] flex flex-col justify-center space-y-2">
                                                <div className="text-center"><span className={`text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border shadow-sm select-none ${isError ? 'bg-red-100 text-red-600 border-red-200' : 'bg-white text-slate-500 border-slate-200'}`}>{labelText}</span></div>
                                                <div className="relative px-2 w-full pt-2">
                                                   <input type="range" min="-8" max="8" step="1" value={sliderVal} onChange={(e) => handleSliderChange(pair.b.kode, pair.k.kode, parseInt(e.target.value))} className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${isError ? 'bg-red-200 accent-red-600 hover:accent-red-700' : 'bg-slate-300 accent-primary hover:accent-blue-700'}`} />
                                                   <div className={`flex justify-between text-[10px] font-bold mt-2 px-1 ${isError ? 'text-red-400' : 'text-slate-400'}`}><span>9</span><span>7</span><span>5</span><span>3</span><span className={isError ? 'text-red-600 text-xs' : 'text-slate-700 text-xs'}>1</span><span>3</span><span>5</span><span>7</span><span>9</span></div>
                                                </div>
                                             </div>
                                             <div className={`font-bold w-full md:w-[30%] text-center md:text-right ${sliderVal < 0 ? (isError ? 'text-red-700' : 'text-primary text-lg') : 'text-slate-600'}`}>{pair.k.kode} - {pair.k.nama}</div>
                                          </div>
                                       );
                                    })}
                                 </div>
                              </TabsContent>

                              <TabsContent value="tabel">
                                 <div className="overflow-x-auto rounded-xl border border-slate-200">
                                    <Table className="min-w-max border-collapse">
                                       <TableHeader className="bg-slate-50">
                                          <TableRow>
                                             <TableHead className="font-bold border w-32 text-center">Sub-Kriteria</TableHead>
                                             {subKriteria.map((k) => <TableHead key={k.kode} className="font-bold text-center border w-32" title={k.nama}>{k.kode}</TableHead>)}
                                          </TableRow>
                                       </TableHeader>
                                       <TableBody>
                                          {subKriteria.map((baris, i) => (
                                             <TableRow key={baris.kode}>
                                                <TableCell className="font-bold text-center border bg-slate-50" title={baris.nama}>{baris.kode}</TableCell>
                                                {subKriteria.map((kolom, j) => {
                                                   const isDiagonal = i === j; const isSegitigaBawah = i > j; const isErrorCell = errorPairs.has(`${baris.kode}-${kolom.kode}`);
                                                   return (
                                                      <TableCell key={kolom.kode} className={`p-2 border text-center transition-colors ${isDiagonal ? 'bg-slate-50/50' : isErrorCell ? 'bg-red-100/80 border-red-300' : isSegitigaBawah ? 'bg-slate-50/50' : ''}`}>
                                                         {isDiagonal ? <div className="text-slate-400 font-bold">1</div> : isSegitigaBawah ? <div className={`font-mono text-sm ${isErrorCell ? 'text-red-600 font-bold' : 'text-slate-400'}`}>{(matrix[baris.kode]?.[kolom.kode] || 1).toFixed(3)}</div> : (
                                                            <select className={`w-full border p-2 rounded-md text-center font-semibold focus:outline-none cursor-pointer ${isErrorCell ? 'bg-red-50 text-red-700 border-red-400' : 'bg-blue-50 text-blue-700 border-primary/30'}`} value={matrix[baris.kode]?.[kolom.kode] || 1} onChange={(e) => handleMatrixChange(baris.kode, kolom.kode, parseFloat(e.target.value))}>
                                                               {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => <option key={num} value={num}>{num}</option>)}
                                                            </select>
                                                         )}
                                                      </TableCell>
                                                   );
                                                })}
                                             </TableRow>
                                          ))}
                                          <TableRow className="bg-slate-100">
                                             <TableCell className="font-bold text-center border text-slate-600">Jumlah (Σ)</TableCell>
                                             {subKriteria.map((kolom) => (
                                                <TableCell key={`sum-${kolom.kode}`} className="font-bold font-mono text-center border text-slate-700">{colSums[kolom.kode]?.toFixed(3)}</TableCell>
                                             ))}
                                          </TableRow>
                                       </TableBody>
                                    </Table>
                                 </div>
                              </TabsContent>
                           </Tabs>
                        </div>
                     </div>
                  )}

                  {/* === STEP 1: MATRIKS NORMALISASI === */}
                  {activeStep === 1 && ahpResult && (
                     <div className="border rounded-2xl bg-white shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><Calculator className="text-primary" /> Matriks Normalisasi</h2>
                        <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800">
                           <BookOpen className="shrink-0 text-primary mt-0.5" size={18} />
                           <div>
                              <p className="font-bold mb-2">Formula Normalisasi AHP:</p>
                              <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 inline-block font-serif text-base italic shadow-sm">X<sub>ij</sub> = A<sub>ij</sub> / ΣA<sub>j</sub></div>
                              <p className="mt-2 text-slate-600">
                                 Membagi setiap Nilai Asli dengan jumlah kolomnya.
                              </p>
                           </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                           <Table className="min-w-max border-collapse w-full">
                              <TableHeader>
                                 <TableRow className="bg-slate-100">
                                    <TableHead className="font-bold text-slate-700 border text-center w-32">Sub-Kriteria</TableHead>
                                    {subKriteria.map((k) => <TableHead key={k.kode} className="font-bold text-center text-slate-700 border">{k.kode}</TableHead>)}
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {subKriteria.map((baris) => (
                                    <TableRow key={baris.kode} className="hover:bg-slate-50">
                                       <TableCell className="font-bold text-center border bg-slate-50">{baris.kode}</TableCell>
                                       {subKriteria.map((kolom) => {
                                          const valAwal = matrix[baris.kode]?.[kolom.kode] || 1;
                                          const sumKolom = colSums[kolom.kode];
                                          const normalisasi = valAwal / sumKolom;

                                          return (
                                             <TableCell key={kolom.kode} className="p-3 border text-center font-mono">
                                                <div className="font-bold text-blue-700 text-sm">{normalisasi.toFixed(4)}</div>
                                                <div className="text-[10px] text-slate-400 mt-1">({valAwal.toFixed(3)} / {sumKolom.toFixed(3)})</div>
                                             </TableCell>
                                          );
                                       })}
                                    </TableRow>
                                 ))}
                                 <TableRow className="bg-blue-50/50">
                                    <TableCell className="font-bold text-center border text-slate-600 text-xs">Jumlah</TableCell>
                                    {subKriteria.map((kolom) => (
                                       <TableCell key={`sum-norm-${kolom.kode}`} className="font-bold text-center border text-blue-800 font-mono text-sm">1.0000</TableCell>
                                    ))}
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                  )}

                  {/* === STEP 2: VEKTOR PRIORITAS === */}
                  {activeStep === 2 && ahpResult && (
                     <div className="border rounded-2xl bg-white shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><PieChart className="text-emerald-600" /> Vektor Prioritas (Bobot Eigen)</h2>
                        <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3 text-sm text-emerald-800">
                           <BookOpen className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                           <div>
                              <p className="font-bold mb-2">Formula Vektor Prioritas (Bobot):</p>
                              <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 inline-block font-serif text-base italic shadow-sm">W<sub>i</sub> = ΣX<sub>ij</sub> / n</div>
                           </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                           <Table className="min-w-max border-collapse w-full">
                              <TableHeader>
                                 <TableRow className="bg-slate-100">
                                    <TableHead className="font-bold text-slate-700 border text-center align-middle" rowSpan={2}>Kode</TableHead>
                                    <TableHead className="font-bold text-slate-700 border text-center" colSpan={subKriteria.length}>1. Nilai Normalisasi Tiap Kriteria (X<sub>ij</sub>)</TableHead>
                                    <TableHead className="font-bold text-slate-700 border text-center align-middle w-24" rowSpan={2}>2. Total (ΣX)</TableHead>
                                    <TableHead className="font-bold text-slate-700 border text-center align-middle w-28" rowSpan={2}>3. Bagi (ΣX / n)</TableHead>
                                    <TableHead className="font-bold text-emerald-700 border text-center align-middle w-28 bg-emerald-50" rowSpan={2}>Bobot (W<sub>i</sub>)</TableHead>
                                 </TableRow>
                                 <TableRow className="bg-slate-50">
                                    {subKriteria.map(k => <TableHead key={k.kode} className="font-bold text-center text-slate-600 border text-xs">{k.kode}</TableHead>)}
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {subKriteria.map((baris) => {
                                    let totalJumlahBaris = 0;
                                    return (
                                       <TableRow key={`eigen-${baris.kode}`} className="hover:bg-slate-50">
                                          <TableCell className="font-bold text-center border bg-slate-50">{baris.kode}</TableCell>
                                          {subKriteria.map(kolom => {
                                             const valAwal = matrix[baris.kode]?.[kolom.kode] || 1;
                                             const sumKolom = colSums[kolom.kode];
                                             const normVal = valAwal / sumKolom;
                                             totalJumlahBaris += normVal;
                                             return (
                                                <TableCell key={kolom.kode} className="text-center border text-slate-500 font-mono text-[11px]">
                                                   {normVal.toFixed(4)}
                                                </TableCell>
                                             );
                                          })}
                                          <TableCell className="font-bold text-center border text-slate-700 font-mono bg-slate-50">
                                             {totalJumlahBaris.toFixed(4)}
                                          </TableCell>
                                          <TableCell className="text-center border text-slate-600 font-mono text-sm">
                                             {totalJumlahBaris.toFixed(4)} / {n}
                                          </TableCell>
                                          <TableCell className="font-bold text-center border text-emerald-700 font-mono text-lg bg-emerald-50/30">
                                             {ahpResult.bobot[baris.kode]?.toFixed(4)}
                                          </TableCell>
                                       </TableRow>
                                    );
                                 })}
                                 <TableRow className="bg-emerald-50/50">
                                    <TableCell colSpan={subKriteria.length + 3} className="font-bold text-right border text-slate-600 text-xs pr-4">Total Penjumlahan Bobot =</TableCell>
                                    <TableCell className="font-bold text-center border text-emerald-800 font-mono text-sm">1.0000</TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                  )}

                  {/* === STEP 3: UJI KONSISTENSI === */}
                  {activeStep === 3 && ahpResult && (
                     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="border rounded-2xl bg-white shadow-sm p-6">
                           <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6"><Activity className="text-purple-600" /> Uji Matriks & Perhitungan Lambda Max (λ)</h2>

                           <div className="mb-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex gap-3 text-sm text-purple-800">
                              <BookOpen className="shrink-0 text-purple-600 mt-0.5" size={18} />
                              <div>
                                 <p className="font-bold mb-2 text-base">Pencarian Nilai Lambda Max (λ<sub>max</sub>):</p>
                                 <p className="mb-3 leading-relaxed text-slate-700">
                                    Nilai <strong>Weighted Sum Vector (WSV)</strong> didapatkan dengan menjumlahkan hasil perkalian antara nilai Matriks Awal dengan Bobot Prioritas (Eigenvector) pada setiap baris.
                                 </p>
                                 <div className="bg-white px-4 py-3 rounded-lg border border-purple-200 inline-block font-serif text-sm italic shadow-sm mt-1 text-purple-900 leading-relaxed">
                                    <strong>WSV<sub>i</sub></strong> = Σ (A<sub>ij</sub> × W<sub>j</sub>) <span className="mx-2 text-purple-300">|</span>
                                    <strong>Rasio<sub>i</sub></strong> = WSV<sub>i</sub> / W<sub>i</sub> <span className="mx-2 text-purple-300">|</span>
                                    <strong>λ<sub>max</sub></strong> = Rata-rata Rasio
                                 </div>
                              </div>
                           </div>

                           <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
                              <Table className="min-w-max border-collapse w-full">
                                 <TableHeader>
                                    <TableRow className="bg-slate-100">
                                       <TableHead className="font-bold text-slate-700 border text-center align-middle" rowSpan={2}>Kode</TableHead>
                                       <TableHead className="font-bold text-slate-700 border text-center" colSpan={subKriteria.length}>1. Proses Perkalian: Matriks Awal × Eigenvector (W<sub>j</sub>)</TableHead>
                                       <TableHead className="font-bold text-purple-700 border text-center align-middle bg-purple-50 w-28" rowSpan={2}>2. Total Baris<br />(WSV)</TableHead>
                                       <TableHead className="font-bold text-emerald-700 border text-center align-middle bg-emerald-50 w-24" rowSpan={2}>Eigen Baris<br />(W<sub>i</sub>)</TableHead>
                                       <TableHead className="font-bold text-orange-700 border text-center align-middle bg-orange-50 w-28" rowSpan={2}>3. Rasio<br />(WSV / W<sub>i</sub>)</TableHead>
                                    </TableRow>
                                    <TableRow className="bg-slate-50">
                                       {subKriteria.map(k => <TableHead key={k.kode} className="font-bold text-center text-slate-600 border text-xs">{k.kode}</TableHead>)}
                                    </TableRow>
                                 </TableHeader>
                                 <TableBody>
                                    {subKriteria.map((baris) => {
                                       const rowProducts = subKriteria.map(kolom => {
                                          const valAwal = matrix[baris.kode]?.[kolom.kode] || 1;
                                          const eigenKolom = ahpResult.bobot[kolom.kode] || 0;
                                          return (valAwal * eigenKolom).toFixed(3);
                                       });

                                       return (
                                          <TableRow key={`wsv-${baris.kode}`} className="hover:bg-slate-50">
                                             <TableCell className="font-bold text-center border bg-slate-50 align-middle">{baris.kode}</TableCell>
                                             {subKriteria.map((kolom) => {
                                                const valAwal = matrix[baris.kode]?.[kolom.kode] || 1;
                                                const eigenKolom = ahpResult.bobot[kolom.kode] || 0;

                                                return (
                                                   <TableCell key={kolom.kode} className="text-center border text-slate-500 font-mono leading-tight align-middle">
                                                      <div className="font-bold text-slate-700 text-[11px]">{valAwal.toFixed(2)}</div>
                                                      <div className="text-[9px] mt-0.5 text-slate-400">× {eigenKolom.toFixed(4)}</div>
                                                   </TableCell>
                                                );
                                             })}
                                             <TableCell className="text-center border bg-purple-50/30 align-middle">
                                                <div className="font-bold text-purple-700 font-mono text-[14px]">
                                                   {wsv[baris.kode]?.toFixed(4)}
                                                </div>
                                                <div className="text-[9px] mt-1.5 text-purple-400 font-mono tracking-tighter max-w-35 mx-auto wrap-break-word leading-tight">
                                                   <span className="text-[8px] mr-1">Σ=</span>{rowProducts.join(' + ')}
                                                </div>
                                             </TableCell>
                                             <TableCell className="font-bold text-center border text-emerald-700 font-mono align-middle bg-emerald-50/30">{ahpResult.bobot[baris.kode]?.toFixed(4)}</TableCell>
                                             <TableCell className="text-center border bg-orange-50/30 align-middle">
                                                <div className="font-bold text-orange-700 font-mono text-[14px]">
                                                   {rasio[baris.kode]?.toFixed(4)}
                                                </div>
                                                <div className="text-[10px] mt-1 text-orange-400 font-mono tracking-tighter">
                                                   {wsv[baris.kode]?.toFixed(4)} ÷ {ahpResult.bobot[baris.kode]?.toFixed(4)}
                                                </div>
                                             </TableCell>
                                          </TableRow>
                                       );
                                    })}
                                    <TableRow className="bg-slate-100">
                                       <TableCell colSpan={subKriteria.length + 3} className="font-bold text-right border text-slate-700 pr-4">Rata-rata Rasio (λ<sub>max</sub>) =</TableCell>
                                       <TableCell className="font-bold text-center border text-slate-900 font-mono text-lg bg-orange-100">{calculatedLambdaMax.toFixed(4)}</TableCell>
                                    </TableRow>
                                 </TableBody>
                              </Table>
                           </div>

                           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4 mt-8"><Sigma size={20} className="text-primary" /> Parameter Uji Konsistensi Akhir</h3>
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                                 <p className="text-sm font-semibold text-slate-500 mb-1 flex items-center gap-1">Lambda Max (λ)</p>
                                 <p className="text-2xl font-mono font-bold text-slate-800">{calculatedLambdaMax.toFixed(4)}</p>
                              </div>
                              <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                                 <p className="text-sm font-semibold text-slate-500 mb-1">Consistency Index (CI)</p>
                                 <p className="text-2xl font-mono font-bold text-slate-800">{ahpResult.ci.toFixed(4)}</p>
                              </div>
                              <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                                 <p className="text-sm font-semibold text-slate-500 mb-1">Random Index (RI n={n})</p>
                                 <p className="text-2xl font-mono font-bold text-slate-800">{currentRI.toFixed(4)}</p>
                              </div>
                              <div className={`p-5 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center ${ahpResult.isKonsisten ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                 <p className={`text-sm font-semibold mb-1 ${ahpResult.isKonsisten ? 'text-green-700' : 'text-red-700'}`}>Consistency Ratio (CR)</p>
                                 <p className={`text-3xl font-mono font-bold ${ahpResult.isKonsisten ? 'text-green-600' : 'text-red-600'}`}>{(ahpResult.cr * 100).toFixed(2)}%</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* === STEP 4: PROSES IDEALISASI (BOBOT MAX 1.0) === */}
                  {activeStep === 4 && ahpResult && (
                     <div className="border rounded-2xl bg-white shadow-sm p-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                           <Target className="text-emerald-600" /> Proses Idealisasi (Bobot Absolut)
                        </h2>
                        <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3 text-sm text-emerald-800">
                           <Info className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                           <div>
                              <p className="leading-relaxed">
                                 Dalam metode <strong>AHP Absolut</strong>, nilai prioritas harus diubah menjadi skor ideal agar penilaian setiap siswa nantinya objektif. Caranya adalah dengan membagi setiap Nilai Eigen dengan <strong>Nilai Eigen Tertinggi (W<sub>max</sub> = {maxEigen.toFixed(4)})</strong>.
                              </p>
                              <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 inline-block font-serif text-sm italic shadow-sm mt-2 text-emerald-900">
                                 Bobot Ideal (I<sub>i</sub>) = W<sub>i</sub> / W<sub>max</sub>
                              </div>
                           </div>
                        </div>
                        <div className="overflow-x-auto border rounded-xl max-w-3xl mx-auto">
                           <Table>
                              <TableHeader className="bg-slate-50">
                                 <TableRow>
                                    <TableHead className="w-20 text-center font-bold border-r">Kode</TableHead>
                                    <TableHead className="text-center font-bold">1. Nilai Eigen (W<sub>i</sub>)</TableHead>
                                    <TableHead className="text-center font-bold">2. Rumus Pembagian</TableHead>
                                    <TableHead className="text-right font-bold text-emerald-700 bg-emerald-50/50 w-36">3. Bobot Ideal (I<sub>i</sub>)</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {subKriteria.map((sub, idx) => {
                                    const eigen = ahpResult.bobot[sub.kode] || 0;
                                    const bobotIdeal = eigen / maxEigen;
                                    return (
                                       <TableRow key={`idealisasi-${idx}`} className="hover:bg-slate-50">
                                          <TableCell className="text-center font-bold border-r bg-slate-50">{sub.kode}</TableCell>
                                          <TableCell className="text-center font-mono text-[13px] text-slate-600">
                                             {eigen.toFixed(4)}
                                          </TableCell>
                                          <TableCell className="text-center font-mono text-[12px] text-slate-500">
                                             {eigen.toFixed(4)} ÷ <span className="font-bold text-emerald-600">{maxEigen.toFixed(4)}</span>
                                          </TableCell>
                                          <TableCell className="text-right font-mono text-base font-bold text-emerald-700 bg-emerald-50/30">
                                             {bobotIdeal.toFixed(4)}
                                          </TableCell>
                                       </TableRow>
                                    );
                                 })}
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                  )}
               </>
            )}
         </div>

         {/* NAVIGASI WIZARD BAWAH */}
         {!isLoading && subKriteria.length > 0 && (
            <div className="flex items-center justify-between pt-6 border-t mt-8">
               <Button
                  variant="outline"
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                  disabled={activeStep === 0}
               >
                  <ChevronLeft className="w-4 h-4 mr-2" /> Sebelumnya
               </Button>

               {activeStep < alurProsesAHP.length - 1 ? (
                  <Button
                     onClick={() => setActiveStep(prev => Math.min(alurProsesAHP.length - 1, prev + 1))}
                     disabled={activeStep === 0 && !ahpResult}
                     className="bg-primary"
                  >
                     Selanjutnya <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
               ) : (
                  <Button onClick={() => setActiveStep(0)} variant="outline" className="text-primary border-primary hover:bg-primary/10">
                     Kembali ke Input Matriks
                  </Button>
               )}
            </div>
         )}

         <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <div className={`mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full ${resultMessage?.isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                     {resultMessage?.isSuccess ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
                  </div>
                  <DialogTitle className="text-center text-xl">{resultMessage?.isSuccess ? "Perhitungan Tersimpan" : "Matriks Tidak Konsisten"}</DialogTitle>
                  <DialogDescription className="text-center text-slate-600 mt-2">{resultMessage?.message}</DialogDescription>
               </DialogHeader>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2 text-center">
                  <p className="text-sm text-slate-500 mb-1">Rasio Konsistensi (CR)</p>
                  <p className={`text-3xl font-bold ${resultMessage?.isSuccess ? 'text-green-600' : 'text-red-600'}`}>{ahpResult ? (ahpResult.cr * 100).toFixed(2) : "0.00"}%</p>
               </div>
               <DialogFooter className="mt-6">
                  <Button className="w-full" onClick={() => setIsResultOpen(false)}>Lihat Detail Perhitungan</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
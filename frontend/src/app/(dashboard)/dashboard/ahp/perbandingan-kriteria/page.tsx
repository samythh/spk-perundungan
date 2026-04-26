// File: frontend/src/app/(dashboard)/dashboard/ahp/perbandingan/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, Info, Database, AlertTriangle, CheckCircle2, XCircle, Calculator, Sigma, FileText, PieChart, ChevronDown, BookOpen, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

interface Kriteria {
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

interface AccordionProps {
   title: string;
   icon: React.ElementType;
   children: React.ReactNode;
   defaultOpen?: boolean;
}

const AccordionSection = ({ title, icon: Icon, children, defaultOpen = false }: AccordionProps) => {
   const [isOpen, setIsOpen] = useState(defaultOpen);

   return (
      <div className="border border-slate-200 rounded-2xl bg-white shadow-sm mb-4 overflow-hidden">
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition-colors focus:outline-none"
         >
            <div className="flex items-center gap-3 text-base md:text-lg font-bold text-slate-800">
               <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <Icon size={18} className="text-primary" />
               </div>
               {title}
            </div>
            <ChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} size={20} />
         </button>
         {isOpen && (
            <div className="p-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-2 duration-300">
               {children}
            </div>
         )}
      </div>
   );
};

export default function PerbandinganKriteriaPage() {
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>({});
   const [warnings, setWarnings] = useState<string[]>([]);
   const [errorPairs, setErrorPairs] = useState<Set<string>>(new Set());
   const [isResultOpen, setIsResultOpen] = useState(false);
   const [resultMessage, setResultMessage] = useState<{ isSuccess: boolean; message: string } | null>(null);
   const [ahpResult, setAhpResult] = useState<AhpResult | null>(null);

   useEffect(() => {
      const fetchKriteria = async () => {
         try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`);
            const json = await res.json();

            if (json.success && json.data.length > 0) {
               const data = json.data;
               setKriteria(data);

               const savedMatrix = localStorage.getItem('ahpMatrix');
               const savedResult = localStorage.getItem('ahpResult');

               if (savedMatrix) {
                  setMatrix(JSON.parse(savedMatrix));
               } else {
                  const initialMatrix: Record<string, Record<string, number>> = {};
                  data.forEach((baris: Kriteria) => {
                     initialMatrix[baris.kode] = {};
                     data.forEach((kolom: Kriteria) => {
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
            console.error("Gagal memuat kriteria:", error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchKriteria();
   }, []);

   const checkLogika = (currentMatrix: Record<string, Record<string, number>>) => {
      const keys = kriteria.map(k => k.kode);
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
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ahp/hitung-kriteria`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ matrix })
         });
         const result = await response.json();

         if (result.success) {
            setResultMessage({ isSuccess: result.data.isKonsisten, message: result.message });
            setAhpResult(result.data);

            if (result.data.isKonsisten) {
               localStorage.setItem('ahpMatrix', JSON.stringify(matrix));
               localStorage.setItem('ahpResult', JSON.stringify(result.data));
            }
            setIsResultOpen(true);
            setTimeout(() => { document.getElementById('hasil-perhitungan')?.scrollIntoView({ behavior: 'smooth' }); }, 500);
         }
      } catch (error) {
         console.error("Kesalahan jaringan:", error);
      }
   };

   const pairs: { b: Kriteria; k: Kriteria }[] = [];
   for (let i = 0; i < kriteria.length; i++) {
      for (let j = i + 1; j < kriteria.length; j++) {
         pairs.push({ b: kriteria[i], k: kriteria[j] });
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
   if (kriteria.length > 0) {
      kriteria.forEach(k => colSums[k.kode] = 0);
      kriteria.forEach(baris => {
         kriteria.forEach(kolom => { colSums[kolom.kode] += matrix[baris.kode]?.[kolom.kode] || 1; });
      });
   }

   let maxKode = ""; let maxBobot = -1; let maxKriteriaName = "";
   const n = kriteria.length;

   const wsv: Record<string, number> = {};
   const rasio: Record<string, number> = {};
   let calculatedLambdaMax = 0;

   if (ahpResult) {
      Object.entries(ahpResult.bobot).forEach(([kode, bobot]) => {
         if (bobot > maxBobot) { maxBobot = bobot; maxKode = kode; }
      });
      maxKriteriaName = kriteria.find(k => k.kode === maxKode)?.nama || "";

      kriteria.forEach(baris => {
         let sum = 0;
         kriteria.forEach(kolom => {
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

   const RI_TABLE: Record<number, number> = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45 };
   const currentRI = RI_TABLE[n] || 1.12;

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Perbandingan Kriteria (AHP)</h1>
               <p className="text-slate-500 text-sm mt-1">Sistem pembobotan kriteria menggunakan metode Analytic Hierarchy Process.</p>
            </div>
            <Button onClick={handleSimpan} className="flex items-center gap-2 shadow-md px-6" disabled={warnings.length > 0}>
               <Save size={16} /> Simpan & Hitung Bobot
            </Button>
         </div>

         {warnings.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-2 text-red-800 font-bold mb-2"><AlertTriangle size={18} /> Peringatan: Ditemukan {warnings.length} data tidak konsisten.</div>
               <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-1">
                  {warnings.map((msg, idx) => <li key={idx}>{msg}</li>)}
               </ul>
            </div>
         )}

         {isLoading ? (
            <div className="flex justify-center items-center py-10 text-slate-500"><RefreshCw className="animate-spin mr-2" size={20} /> Memuat data...</div>
         ) : (
            <>
               <div className="bg-white rounded-2xl border shadow-sm p-6">
                  <Tabs defaultValue="form" className="w-full">
                     <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-slate-100 rounded-xl">
                        <TabsTrigger value="form" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Mode Kuesioner (Geser)</TabsTrigger>
                        <TabsTrigger value="tabel" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Mode Matriks (Pakar)</TabsTrigger>
                     </TabsList>
                     <TabsContent value="form" className="space-y-4">
                        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm border border-blue-100">
                           <Info className="shrink-0 mt-0.5" size={18} />
                           <p>Tentukan tingkat kepentingan antar kriteria dengan menggeser titik indikator.</p>
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
                                    <TableHead className="font-bold border w-32 text-center">Kriteria</TableHead>
                                    {kriteria.map((k) => <TableHead key={k.kode} className="font-bold text-center border w-32" title={k.nama}>{k.kode}</TableHead>)}
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {kriteria.map((baris, i) => (
                                    <TableRow key={baris.kode}>
                                       <TableCell className="font-bold text-center border bg-slate-50" title={baris.nama}>{baris.kode}</TableCell>
                                       {kriteria.map((kolom, j) => {
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
                                    {kriteria.map((kolom) => (
                                       <TableCell key={`sum-${kolom.kode}`} className="font-bold font-mono text-center border text-slate-700">{colSums[kolom.kode]?.toFixed(3)}</TableCell>
                                    ))}
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </TabsContent>
                  </Tabs>
               </div>

               {ahpResult && (
                  <div id="hasil-perhitungan" className="space-y-6 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                     <div className="flex items-center gap-2 mb-6">
                        <Database className="text-slate-400" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">Detail Laporan Perhitungan Matematis AHP</h2>
                     </div>

                     <AccordionSection title="1. Matriks Normalisasi" icon={Calculator} defaultOpen={false}>
                        <div className="mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800">
                           <BookOpen className="shrink-0 text-primary mt-0.5" size={18} />
                           <div>
                              <p className="font-bold mb-2">Formula Normalisasi AHP:</p>
                              <div className="bg-white px-3 py-2 rounded-lg border border-blue-200 inline-block font-serif text-base italic shadow-sm">X<sub>ij</sub> = A<sub>ij</sub> / ΣA<sub>j</sub></div>
                              <p className="mt-2 text-slate-600">
                                 Setiap kotak di bawah ini menampilkan hasil normalisasi yang didapatkan dari: <strong>Nilai Matriks Asli dibagi dengan Total Kolomnya</strong>.
                              </p>
                           </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                           <Table className="min-w-max border-collapse w-full">
                              <TableHeader>
                                 <TableRow className="bg-slate-100">
                                    <TableHead className="font-bold text-slate-700 border text-center w-32">Kriteria</TableHead>
                                    {kriteria.map((k) => <TableHead key={k.kode} className="font-bold text-center text-slate-700 border">{k.kode}</TableHead>)}
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {kriteria.map((baris) => (
                                    <TableRow key={baris.kode} className="hover:bg-slate-50">
                                       <TableCell className="font-bold text-center border bg-slate-50">{baris.kode}</TableCell>
                                       {kriteria.map((kolom) => {
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
                                    {kriteria.map((kolom) => (
                                       <TableCell key={`sum-norm-${kolom.kode}`} className="font-bold text-center border text-blue-800 font-mono text-sm">1.0000</TableCell>
                                    ))}
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </AccordionSection>

                     {/* LACI 2: VEKTOR PRIORITAS (Dirombak untuk menampilkan perhitungan detail) */}
                     <AccordionSection title="2. Vektor Prioritas (Bobot Eigen)" icon={PieChart} defaultOpen={false}>
                        <div className="mb-6 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-3 text-sm text-emerald-800">
                           <BookOpen className="shrink-0 text-emerald-600 mt-0.5" size={18} />
                           <div>
                              <p className="font-bold mb-2">Formula Vektor Prioritas (Bobot):</p>
                              <div className="bg-white px-3 py-2 rounded-lg border border-emerald-200 inline-block font-serif text-base italic shadow-sm">W<sub>i</sub> = ΣX<sub>ij</sub> / n</div>
                              <p className="mt-2 text-slate-600">
                                 Setiap bobot di bawah ini didapatkan dari: <strong>Jumlah seluruh nilai normalisasi dalam satu baris (ΣX) dibagi dengan jumlah total kriteria (n={n})</strong>.
                              </p>
                           </div>
                        </div>
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                           <Table className="min-w-max border-collapse w-full">
                              <TableHeader>
                                 <TableRow className="bg-slate-100">
                                    <TableHead className="font-bold text-slate-700 border text-center w-20">Kode</TableHead>
                                    <TableHead className="font-bold text-slate-700 border text-center">Rincian Penjumlahan Baris Normalisasi (ΣX)</TableHead>
                                    <TableHead className="font-bold text-slate-700 border text-center w-36">Pembagian (ΣX / n)</TableHead>
                                    <TableHead className="font-bold text-emerald-700 border text-center w-32 bg-emerald-50">Bobot Final (W<sub>i</sub>)</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {kriteria.map((baris) => {
                                    // Mengambil array nilai normalisasi untuk baris ini
                                    const rowNormsArray = kriteria.map(kolom => {
                                       const valAwal = matrix[baris.kode]?.[kolom.kode] || 1;
                                       const sumKolom = colSums[kolom.kode];
                                       return valAwal / sumKolom;
                                    });

                                    // Membuat string rincian penjumlahan: (0.4380 + 0.4898 + ...)
                                    const rincianJumlah = rowNormsArray.map(val => val.toFixed(4)).join(" + ");

                                    // Total penjumlahannya
                                    const totalJumlahBaris = rowNormsArray.reduce((acc, curr) => acc + curr, 0);

                                    return (
                                       <TableRow key={`eigen-${baris.kode}`} className="hover:bg-slate-50">
                                          <TableCell className="font-bold text-center border bg-slate-50">{baris.kode}</TableCell>

                                          {/* KOLOM RINCIAN PENJUMLAHAN */}
                                          <TableCell className="text-left border font-mono text-[11px] leading-tight text-slate-500">
                                             ({rincianJumlah}) = <span className="font-bold text-slate-700">{totalJumlahBaris.toFixed(4)}</span>
                                          </TableCell>

                                          {/* KOLOM PEMBAGIAN */}
                                          <TableCell className="text-center border text-slate-600 font-mono text-sm">
                                             {totalJumlahBaris.toFixed(4)} / {n}
                                          </TableCell>

                                          {/* KOLOM HASIL AKHIR BOBOT */}
                                          <TableCell className="font-bold text-center border text-emerald-700 font-mono text-lg bg-emerald-50/30">
                                             {ahpResult.bobot[baris.kode]?.toFixed(4)}
                                          </TableCell>
                                       </TableRow>
                                    );
                                 })}

                                 {/* BARIS PEMBUKTIAN: Jumlah Total Bobot Pasti = 1 */}
                                 <TableRow className="bg-emerald-50/50">
                                    <TableCell colSpan={3} className="font-bold text-right border text-slate-600 text-xs pr-4">Total Penjumlahan Bobot =</TableCell>
                                    <TableCell className="font-bold text-center border text-emerald-800 font-mono text-sm">
                                       1.0000
                                    </TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </AccordionSection>

                     <AccordionSection title="3. Uji Matriks & Perhitungan Lambda Max (λ)" icon={Activity} defaultOpen={false}>
                        <div className="mb-6 p-4 bg-purple-50/50 rounded-xl border border-purple-100 flex gap-3 text-sm text-purple-800">
                           <BookOpen className="shrink-0 text-purple-600 mt-0.5" size={18} />
                           <div>
                              <p className="font-bold mb-2">Pencarian Nilai Lambda Max (λ<sub>max</sub>):</p>
                              <p className="mb-2 leading-relaxed">Untuk menemukan λ<sub>max</sub>, kita harus mengalikan Matriks Awal dengan Eigenvector untuk mendapatkan <strong>Weighted Sum Vector (WSV)</strong>, lalu membaginya kembali dengan Eigenvector untuk mendapatkan rasio.</p>
                              <div className="bg-white px-3 py-2 rounded-lg border border-purple-200 inline-block font-serif text-sm italic shadow-sm mt-1">λ<sub>max</sub> = Rata-rata dari (WSV<sub>i</sub> / W<sub>i</sub>)</div>
                           </div>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
                           <Table className="min-w-max border-collapse w-full">
                              <TableHeader>
                                 <TableRow className="bg-slate-100">
                                    <TableHead className="font-bold text-slate-700 border text-center">Kriteria</TableHead>
                                    <TableHead className="font-bold text-slate-700 border text-center">Matriks Awal × Eigenvector</TableHead>
                                    <TableHead className="font-bold text-purple-700 border text-center bg-purple-50">WSV</TableHead>
                                    <TableHead className="font-bold text-emerald-700 border text-center bg-emerald-50">Eigen (W<sub>i</sub>)</TableHead>
                                    <TableHead className="font-bold text-orange-700 border text-center bg-orange-50">Rasio (WSV / W<sub>i</sub>)</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {kriteria.map((baris) => {
                                    const rincianPerkalian = kriteria.map(kolom => {
                                       const valAwal = matrix[baris.kode]?.[kolom.kode] || 1;
                                       const eigenKolom = ahpResult.bobot[kolom.kode] || 0;
                                       return `(${valAwal.toFixed(2)} × ${eigenKolom.toFixed(4)})`;
                                    }).join(" + ");

                                    return (
                                       <TableRow key={`wsv-${baris.kode}`} className="hover:bg-slate-50">
                                          <TableCell className="font-bold text-center border bg-slate-50">{baris.kode}</TableCell>
                                          <TableCell className="text-left border text-slate-500 font-mono text-[10px] leading-tight max-w-xs">{rincianPerkalian}</TableCell>
                                          <TableCell className="font-bold text-center border text-purple-700 font-mono bg-purple-50/30">{wsv[baris.kode]?.toFixed(4)}</TableCell>
                                          <TableCell className="font-bold text-center border text-emerald-700 font-mono bg-emerald-50/30">{ahpResult.bobot[baris.kode]?.toFixed(4)}</TableCell>
                                          <TableCell className="font-bold text-center border text-orange-700 font-mono bg-orange-50/30">{rasio[baris.kode]?.toFixed(4)}</TableCell>
                                       </TableRow>
                                    );
                                 })}
                                 <TableRow className="bg-slate-100">
                                    <TableCell colSpan={4} className="font-bold text-right border text-slate-700 pr-4">Rata-rata Rasio (λ<sub>max</sub>) =</TableCell>
                                    <TableCell className="font-bold text-center border text-slate-900 font-mono text-lg bg-orange-100">{calculatedLambdaMax.toFixed(4)}</TableCell>
                                 </TableRow>
                              </TableBody>
                           </Table>
                        </div>
                     </AccordionSection>

                     <div className="mt-8 mb-4">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4"><Sigma size={20} className="text-primary" /> 4. Parameter Uji Konsistensi Akhir</h3>
                        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex gap-3 text-sm text-slate-700 shadow-sm">
                           <BookOpen className="shrink-0 text-slate-500 mt-0.5" size={18} />
                           <div className="w-full">
                              <p className="font-bold mb-3">Substitusi Formula Konsistensi:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="font-serif italic text-sm text-center mb-2 border-b pb-2">CI = (λ<sub>max</sub> - n) / (n - 1)</div>
                                    <div className="text-center font-mono font-bold text-slate-700 mt-2">
                                       CI = ({calculatedLambdaMax.toFixed(4)} - {n}) / ({n} - 1) <br />
                                       CI = {ahpResult.ci.toFixed(4)}
                                    </div>
                                 </div>
                                 <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="font-serif italic text-sm text-center mb-2 border-b pb-2">CR = CI / RI</div>
                                    <div className="text-center font-mono font-bold text-slate-700 mt-2">
                                       CR = {ahpResult.ci.toFixed(4)} / {currentRI.toFixed(4)} <br />
                                       CR = {ahpResult.cr.toFixed(4)}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

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

                     <div className={`p-6 rounded-2xl border shadow-sm mt-6 ${ahpResult.isKonsisten ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                        <h3 className={`text-lg font-bold mb-3 flex items-center gap-2 ${ahpResult.isKonsisten ? 'text-blue-900' : 'text-red-900'}`}>
                           <FileText size={20} /> 5. Kesimpulan Hasil Perhitungan
                        </h3>
                        <div className={`space-y-3 text-sm leading-relaxed ${ahpResult.isKonsisten ? 'text-blue-800' : 'text-red-800'}`}>
                           <p><strong>1. Tingkat Konsistensi:</strong> Nilai <em>Consistency Ratio</em> (CR) adalah <strong>{(ahpResult.cr * 100).toFixed(2)}%</strong>. {ahpResult.isKonsisten ? <span>Karena (CR &le; 10%), matriks dinyatakan <strong>VALID dan KONSISTEN</strong>.</span> : <span className="text-red-600">Karena (CR &gt; 10%), matriks dinyatakan <strong>TIDAK KONSISTEN</strong>.</span>}</p>
                           {ahpResult.isKonsisten && <p><strong>2. Vektor Prioritas:</strong> Kriteria tertinggi adalah <strong>{maxKode} - {maxKriteriaName}</strong> dengan bobot <strong>{(maxBobot * 100).toFixed(2)}%</strong>.</p>}
                        </div>
                     </div>
                  </div>
               )}
            </>
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
               <DialogFooter className="mt-6"><Button className="w-full" onClick={() => setIsResultOpen(false)}>Tutup Detail</Button></DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
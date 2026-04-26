// File: frontend/src/app/(dashboard)/dashboard/ahp/penilaian/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
   Calculator, RefreshCw, AlertCircle,
   CheckCircle2, ClipboardCheck
} from "lucide-react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Siswa {
   id: number;
   nisn: string;
   nama: string;
   kelas: string;
}

interface Kriteria {
   id: number;
   kode: string;
   nama: string;
   bobot: number;
}

interface SubKriteria {
   kode: string;
   nama: string;
   bobot: number;
}

type PenilaianRecord = Record<number, Record<string, string>>;

export default function PenilaianAlternatifPage() {
   const [siswa, setSiswa] = useState<Siswa[]>([]);
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([]);

   const [penilaian, setPenilaian] = useState<PenilaianRecord>({});
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

   const showToast = useCallback((msg: string, type: 'success' | 'error') => {
      setToast({ show: true, msg, type });
      setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
   }, []);

   const fetchAllData = useCallback(async () => {
      setIsLoading(true);
      try {
         const [resSiswa, resKrit, resSub] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siswa`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subkriteria`)
         ]);

         const [dataSiswa, dataKrit, dataSub] = await Promise.all([
            resSiswa.json(), resKrit.json(), resSub.json()
         ]);

         if (dataSiswa.success) setSiswa(dataSiswa.data);
         if (dataKrit.success) setKriteria(dataKrit.data);
         if (dataSub.success) setSubKriteria(dataSub.data);

         const initialPenilaian: PenilaianRecord = {};
         dataSiswa.data.forEach((s: Siswa) => {
            initialPenilaian[s.id] = {};
            dataKrit.data.forEach((k: Kriteria) => {
               initialPenilaian[s.id][k.kode] = "";
            });
         });
         setPenilaian(initialPenilaian);

      } catch (error) {
         console.error("Gagal memuat data master:", error);
         showToast("Gagal terhubung ke database.", "error");
      } finally {
         setIsLoading(false);
      }
   }, [showToast]);

   useEffect(() => {
      fetchAllData();
   }, [fetchAllData]);

   const handlePenilaianChange = (siswaId: number, kriteriaKode: string, subKode: string) => {
      setPenilaian(prev => ({
         ...prev,
         [siswaId]: {
            ...prev[siswaId],
            [kriteriaKode]: subKode
         }
      }));
   };

   const isSemuaTerisi = () => {
      if (siswa.length === 0 || kriteria.length === 0) return false;
      for (const s of siswa) {
         for (const k of kriteria) {
            if (!penilaian[s.id]?.[k.kode]) return false;
         }
      }
      return true;
   };

   const handleSimpanPenilaian = async () => {
      setIsSaving(true);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/simpan-evaluasi`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ penilaian })
         });

         const result = await response.json();
         if (result.success) {
            showToast("Evaluasi siswa berhasil disimpan dan dikalkulasi!", "success");
         } else {
            showToast("Gagal menyimpan evaluasi.", "error");
         }
      } catch (error) {
         console.error("Kesalahan jaringan:", error);
         showToast("Terjadi kesalahan sistem.", "error");
      } finally {
         setIsSaving(false);
      }
   };

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-500 relative">

         {toast.show && (
            <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-bottom-5 fade-in duration-300
               ${toast.type === 'success' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 shadow-red-600/20'}`}
            >
               {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
               <span>{toast.msg}</span>
            </div>
         )}

         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-primary/10 rounded-xl">
                  <ClipboardCheck className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Evaluasi & Penilaian Siswa</h1>
                  <p className="text-sm text-slate-500 mt-1">Berikan penilaian intensitas perundungan (T1-T5) untuk setiap siswa berdasarkan kriteria.</p>
               </div>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="gap-2" onClick={fetchAllData} disabled={isLoading}>
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Segarkan Data
               </Button>
               <Button
                  onClick={handleSimpanPenilaian}
                  disabled={isLoading || isSaving || !isSemuaTerisi()}
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-md gap-2"
               >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Calculator size={16} />}
                  Kalkulasi & Simpan Nilai Akhir
               </Button>
            </div>
         </div>

         {!isSemuaTerisi() && !isLoading && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
               <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
               <p className="text-sm text-amber-800 leading-relaxed">
                  <strong>Perhatian:</strong> Masih ada kolom penilaian yang kosong. Tombol kalkulasi hanya akan aktif setelah Anda memberikan penilaian intensitas pada seluruh siswa di setiap kriteria.
               </p>
            </div>
         )}

         <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
            {/* PERBAIKAN W-FULL: Memastikan kontainer bisa di-scroll tapi proporsinya pas */}
            <div className="overflow-x-auto w-full">
               <Table className="w-full min-w-max border-collapse">
                  <TableHeader className="bg-slate-50 border-b-2 border-slate-200">
                     <TableRow>
                        <TableHead className="font-bold text-slate-800 border-r w-10 text-center">No</TableHead>
                        {/* PERBAIKAN: Kolom nama di-set min-width-nya agar tidak mendesak C1-C5 */}
                        <TableHead className="font-bold text-slate-800 border-r min-w-50">Nama Alternatif (Siswa)</TableHead>
                        {kriteria.map(k => (
                           // PERBAIKAN: min-w diturunkan menjadi 120px agar C5 tidak terpotong
                           <TableHead key={k.kode} className="font-bold text-center text-slate-700 border-r min-w-30 max-w-32.5">
                              <div className="text-primary text-sm">{k.kode}</div>
                              <div className="text-[11px] font-normal text-slate-500 truncate px-1" title={k.nama}>{k.nama}</div>
                           </TableHead>
                        ))}
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        <TableRow>
                           <TableCell colSpan={kriteria.length + 2} className="h-32 text-center text-slate-500">
                              <RefreshCw className="animate-spin inline-block mr-2" size={20} /> Mempersiapkan lembar evaluasi...
                           </TableCell>
                        </TableRow>
                     ) : siswa.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={kriteria.length + 2} className="h-32 text-center text-red-500 font-medium">
                              Belum ada data siswa. Silakan tambahkan siswa di menu Alternatif terlebih dahulu.
                           </TableCell>
                        </TableRow>
                     ) : (
                        siswa.map((s, index) => (
                           <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                              <TableCell className="text-center font-bold text-slate-400 border-r">{index + 1}</TableCell>
                              <TableCell className="border-r">
                                 <div className="font-bold text-slate-800">{s.nama}</div>
                                 <div className="text-[11px] text-slate-500 mt-0.5 font-mono">NISN: {s.nisn} | Kelas: {s.kelas}</div>
                              </TableCell>

                              {kriteria.map(k => {
                                 const selectedVal = penilaian[s.id]?.[k.kode] || "";
                                 return (
                                    <TableCell key={`${s.id}-${k.kode}`} className="p-2 border-r text-center align-middle">
                                       {/* PERBAIKAN: Warna kuning dibuang. Diganti Slate untuk kosong, Emerald untuk terisi */}
                                       <select
                                          className={`w-full py-2 px-1 text-[13px] border rounded-md focus:ring-2 focus:ring-primary focus:outline-none shadow-sm cursor-pointer transition-all
                                             ${selectedVal === ""
                                                ? "border-slate-300 bg-slate-50 text-slate-400"
                                                : "border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold"}`}
                                          value={selectedVal}
                                          onChange={(e) => handlePenilaianChange(s.id, k.kode, e.target.value)}
                                       >
                                          <option value="" disabled>-- Pilih --</option>
                                          {subKriteria.map(sub => (
                                             <option key={sub.kode} value={sub.kode}>
                                                {sub.kode} - {sub.nama}
                                             </option>
                                          ))}
                                       </select>
                                    </TableCell>
                                 );
                              })}
                           </TableRow>
                        ))
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>

      </div>
   );
}
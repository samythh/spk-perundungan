// File: frontend/src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, ListChecks, Activity, ShieldAlert, BarChart3, PieChart, TrendingUp, AlertTriangle } from "lucide-react";

// 1. PENYESUAIAN INTERFACE: Menyelaraskan dengan skema AHP Absolut
interface Siswa {
   id: number;
   nisn: string;
   nama: string;
   kelas: string;
}

interface Kriteria {
   kode: string; // Menggunakan kode, bukan ID
   nama: string;
   bobot: number;
}

interface SubKriteria {
   kode: string;
   nama_sub: string;
   bobot_ideal: number;
}

interface HasilAkhir extends Siswa {
   totalSkor: number;
   label: string;
   warna: string;
}

export default function DashboardPage() {
   const [siswa, setSiswa] = useState<Siswa[]>([]);
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [, setSubKriteria] = useState<SubKriteria[]>([]);
   const [hasilAkhir, setHasilAkhir] = useState<HasilAkhir[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   // 2. ROMBAK TOTAL FUNGSI KALKULASI: Menggunakan WSM AHP Absolut
   const kalkulasiHasil = useCallback((
      dataSiswa: Siswa[],
      dataKriteria: Kriteria[],
      dataSubKriteria: SubKriteria[],
      dataScores: Record<number, Record<string, string>>
   ) => {
      const ranking: HasilAkhir[] = dataSiswa.map(s => {
         let totalSkor = 0;

         // Kalikan Bobot Global Kriteria dengan Bobot Ideal Sub-Kriteria terpilih
         dataKriteria.forEach(k => {
            const subKodeTerpilih = dataScores[s.id]?.[k.kode];
            if (subKodeTerpilih) {
               const subTerpilih = dataSubKriteria.find(sub => sub.kode === subKodeTerpilih);
               if (subTerpilih) {
                  totalSkor += (k.bobot * subTerpilih.bobot_ideal);
               }
            }
         });

         // Kategori Risiko berdasarkan skala 0 - 1.0
         let label = "Sangat Aman";
         let warna = "bg-green-100 text-green-700";

         if (totalSkor >= 0.8) {
            label = "Sangat Parah (Bahaya)";
            warna = "bg-red-100 text-red-700";
         } else if (totalSkor >= 0.6) {
            label = "Parah (Perhatian)";
            warna = "bg-orange-100 text-orange-700";
         } else if (totalSkor >= 0.4) {
            label = "Sedang (Waspada)";
            warna = "bg-yellow-100 text-yellow-700";
         } else if (totalSkor >= 0.2) {
            label = "Aman";
            warna = "bg-blue-100 text-blue-700";
         }

         return { ...s, totalSkor, label, warna };
      });

      ranking.sort((a, b) => b.totalSkor - a.totalSkor);
      setHasilAkhir(ranking);
   }, []);

   const fetchData = useCallback(async () => {
      setIsLoading(true);
      try {
         // PERBAIKAN FATAL: Memperbaiki URL string menjadi literal template
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/data`);
         const json = await res.json();

         if (json.success) {
            setSiswa(json.data.siswa);

            // Urutkan kriteria berdasarkan bobot tertinggi untuk grafik Pie Chart
            const sortedKriteria = [...json.data.kriteria].sort((a, b) => b.bobot - a.bobot);
            setKriteria(sortedKriteria);

            // Ambil data subkriteria dari backend
            setSubKriteria(json.data.subKriteria);

            // Mapping struktur data penilaian baru (menggunakan string kode)
            const loadedScores: Record<number, Record<string, string>> = {};
            json.data.penilaian.forEach((p: { siswa_id: number; kriteria_kode: string; subkriteria_kode: string }) => {
               if (!loadedScores[p.siswa_id]) loadedScores[p.siswa_id] = {};
               loadedScores[p.siswa_id][p.kriteria_kode] = p.subkriteria_kode;
            });

            kalkulasiHasil(json.data.siswa, sortedKriteria, json.data.subKriteria, loadedScores);
         }
      } catch (error) {
         console.error("Gagal menarik data dashboard:", error);
      } finally {
         setIsLoading(false);
      }
   }, [kalkulasiHasil]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   const top5Siswa = hasilAkhir.slice(0, 5);
   // Mendeteksi jumlah siswa di zona Parah & Sangat Parah (Skor >= 0.6)
   const jumlahRisikoTinggi = hasilAkhir.filter(h => h.totalSkor >= 0.6).length;

   if (isLoading) {
      return (
         <div className="flex h-[80vh] flex-col justify-center items-center text-slate-500">
            <Activity className="animate-pulse mb-4 text-primary" size={40} />
            <p className="font-medium animate-pulse text-sm">Memuat data dashboard...</p>
         </div>
      );
   }

   return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">

         <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Utama</h1>
            <p className="text-slate-500 mt-1 text-sm">Ringkasan hasil Sistem Pendukung Keputusan Deteksi Perundungan SMAN 2 Padang.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                  <Users size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Siswa</p>
                  <p className="text-2xl font-extrabold text-slate-800">{siswa.length} <span className="text-xs font-medium text-slate-400 normal-case">Orang</span></p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ListChecks size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jumlah Kriteria</p>
                  <p className="text-2xl font-extrabold text-slate-800">{kriteria.length} <span className="text-xs font-medium text-slate-400 normal-case">Parameter</span></p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
               <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Metode SPK</p>
                  <p className="text-2xl font-extrabold text-slate-800">AHP Absolut</p>
               </div>
            </div>

         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
               <div className="flex items-center gap-2 mb-4 border-b pb-3">
                  <BarChart3 className="text-primary" size={18} />
                  <h2 className="text-base font-bold text-slate-800">Grafik Kerentanan Tertinggi (Top 5)</h2>
               </div>

               <div className="grow flex items-end justify-around gap-2 mt-2 h-48 pt-4">
                  {top5Siswa.map((s, idx) => {
                     // Karena AHP Absolut nilai maksimalnya 1.0, persentase didapat langsung dari (Skor * 100)
                     const heightPercent = s.totalSkor > 1 ? 100 : s.totalSkor * 100;
                     const barColor = s.totalSkor >= 0.8 ? 'bg-red-500' : s.totalSkor >= 0.6 ? 'bg-orange-500' : s.totalSkor >= 0.4 ? 'bg-amber-500' : 'bg-primary';

                     return (
                        <div key={s.id} className="w-1/6 flex flex-col items-center justify-end h-full group">
                           <div className="text-[11px] font-bold text-slate-500 mb-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {s.totalSkor.toFixed(4)}
                           </div>
                           <div
                              className={`w-full max-w-12.5 rounded-t-md transition-all duration-1000 ease-out shadow-sm relative overflow-hidden ${barColor}`}
                              style={{ height: `${heightPercent}%` }}
                           >
                              <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent"></div>
                           </div>
                           <div className="mt-2 text-[11px] font-bold text-slate-700 text-center truncate w-full px-1" title={s.nama}>
                              {s.nama.split(' ')[0]}
                           </div>
                           <div className="text-[9px] text-slate-400 font-mono mt-0.5">Rank {idx + 1}</div>
                        </div>
                     );
                  })}
               </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
               <div className="flex items-center gap-2 mb-4 border-b pb-3">
                  <PieChart className="text-emerald-500" size={18} />
                  <h2 className="text-base font-bold text-slate-800">Distribusi Bobot Kriteria</h2>
               </div>

               <div className="grow flex flex-col justify-center space-y-4">
                  {kriteria.map((k) => (
                     <div key={k.kode} className="group">
                        <div className="flex justify-between items-end mb-1">
                           <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">{k.kode} - {k.nama}</span>
                           <span className="text-[11px] font-mono font-bold text-slate-500">{(k.bobot * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                           <div
                              className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${k.bobot * 100}%` }}
                           ></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                  <TrendingUp className="text-primary" size={18} />
                  <h2 className="text-base font-bold text-slate-800">Hasil Ranking Prioritas (Top 5)</h2>
               </div>
               <div className="overflow-x-auto p-2">
                  <table className="w-full text-sm text-left">
                     <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                           <th className="py-2.5 px-3 font-bold w-12 text-center text-xs">Rank</th>
                           <th className="py-2.5 px-3 font-bold text-xs">Nama Siswa</th>
                           <th className="py-2.5 px-3 font-bold text-center text-xs">Kelas</th>
                           <th className="py-2.5 px-3 font-bold text-center text-xs">Skor AHP</th>
                           <th className="py-2.5 px-3 font-bold text-center text-xs">Status</th>
                        </tr>
                     </thead>
                     <tbody>
                        {top5Siswa.length === 0 ? (
                           <tr><td colSpan={5} className="text-center py-5 text-slate-400 text-xs">Belum ada data evaluasi.</td></tr>
                        ) : top5Siswa.map((s, idx) => (
                           <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0">
                              <td className="py-2 px-3 text-center">
                                 <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full font-bold text-[10px] ${idx === 0 ? 'bg-red-100 text-red-700' : idx === 1 ? 'bg-orange-100 text-orange-700' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {idx + 1}
                                 </span>
                              </td>
                              <td className="py-2 px-3 font-bold text-slate-800 text-[13px]">{s.nama}</td>
                              <td className="py-2 px-3 text-center text-slate-600 text-[13px]">{s.kelas}</td>
                              <td className="py-2 px-3 text-center font-mono font-bold text-primary text-[13px]">{s.totalSkor.toFixed(4)}</td>
                              <td className="py-2 px-3 text-center">
                                 <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-extrabold tracking-wider ${s.warna}`}>
                                    {s.label.split(' ')[0]}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm flex flex-col">
               <div className="flex items-center gap-2 mb-3 border-b border-blue-200/50 pb-3">
                  <AlertTriangle className="text-red-500" size={20} />
                  <h2 className="text-base font-bold text-blue-900">Kesimpulan Analisis</h2>
               </div>

               <div className="grow space-y-3 text-[13px] text-blue-800 leading-relaxed">
                  {siswa.length === 0 ? (
                     <p>Belum ada data evaluasi yang dapat disimpulkan.</p>
                  ) : (
                     <>
                        <p>
                           Berdasarkan perhitungan metode AHP Absolut terhadap <strong>{siswa.length} siswa</strong>, ditemukan <strong>{jumlahRisikoTinggi} siswa</strong> terindikasi berada di zona <strong className="text-red-700">Risiko Tinggi (Parah & Sangat Parah)</strong>.
                        </p>
                        {top5Siswa.length > 0 && (
                           <p>
                              Siswa <strong>{top5Siswa[0].nama}</strong> berada di peringkat pertama kerentanan. Kriteria utama pemicunya adalah <strong>{kriteria[0]?.nama}</strong> ({(kriteria[0]?.bobot * 100).toFixed(1)}%).
                           </p>
                        )}
                        <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
                           <p className="font-bold text-slate-800 mb-1 text-xs">Rekomendasi:</p>
                           <p className="text-slate-600 text-[11px] leading-tight">Prioritaskan investigasi, pemanggilan, dan pendampingan psikologis untuk siswa di Top 5 kerentanan ini.</p>
                        </div>
                     </>
                  )}
               </div>
            </div>

         </div>

      </div>
   );
}
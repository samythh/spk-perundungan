// File: frontend/src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { 
   Users, ListChecks, ShieldAlert, // PERBAIKAN: Menghapus 'Activity' yang sudah tidak dipakai
   BarChart3, PieChart, TrendingUp, AlertTriangle, 
   BrainCircuit, Sparkles, UserCheck, Database // PERBAIKAN: Menambahkan 'Database'
} from "lucide-react";

interface Siswa {
   id: number;
   nisn: string;
   nama: string;
   kelas: string;
   nilai_akhir: number | null;
   kategori: string | null;
}

interface Kriteria {
   kode: string;
   nama: string;
   bobot: number;
}

export default function DashboardPage() {
   const [siswaSemua, setSiswaSemua] = useState<Siswa[]>([]);
   const [siswaDinilai, setSiswaDinilai] = useState<Siswa[]>([]);
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const fetchData = useCallback(async () => {
      setIsLoading(true);
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/data`);
         if (!res.ok) throw new Error("Gagal mengambil data");
         
         const json = await res.json();

         if (json.success) {
            const dataSiswa: Siswa[] = json.data.siswa;
            setSiswaSemua(dataSiswa);

            // Filter siswa yang sudah dinilai & urutkan dari risiko tertinggi
            const sudahDievaluasi = dataSiswa.filter(s => s.nilai_akhir !== null);
            sudahDievaluasi.sort((a, b) => (b.nilai_akhir || 0) - (a.nilai_akhir || 0));
            setSiswaDinilai(sudahDievaluasi);

            // Urutkan kriteria berdasarkan bobot tertinggi
            const sortedKriteria = [...json.data.kriteria].sort((a, b) => b.bobot - a.bobot);
            setKriteria(sortedKriteria);
         }
      } catch (error) {
         console.error("Gagal menarik data dashboard:", error);
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   // Variabel Statistik
   const top5Siswa = siswaDinilai.slice(0, 5);
   const jumlahRisikoTinggi = siswaDinilai.filter(s => s.kategori?.includes("Parah")).length;
   const persenSelesai = siswaSemua.length > 0 ? (siswaDinilai.length / siswaSemua.length) * 100 : 0;

   // Fungsi utilitas warna bar chart
   const getBarColor = (kategori: string | null) => {
      if (kategori?.includes("Sangat Parah")) return "from-red-500 to-rose-600 shadow-red-200";
      if (kategori?.includes("Parah")) return "from-orange-400 to-orange-500 shadow-orange-200";
      if (kategori?.includes("Sedang")) return "from-amber-400 to-amber-500 shadow-amber-200";
      return "from-blue-500 to-indigo-600 shadow-blue-200";
   };

   // Fungsi utilitas lencana tabel
   const getBadgeStyle = (kategori: string | null) => {
      if (kategori?.includes("Sangat Parah")) return "bg-red-100 text-red-700 border-red-200";
      if (kategori?.includes("Parah")) return "bg-orange-100 text-orange-700 border-orange-200";
      if (kategori?.includes("Sedang")) return "bg-amber-100 text-amber-700 border-amber-200";
      if (kategori?.includes("Rentan")) return "bg-blue-100 text-blue-700 border-blue-200";
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
   };

   if (isLoading) {
      return (
         <div className="flex h-[80vh] flex-col justify-center items-center text-slate-400">
            <div className="relative w-16 h-16 mb-4">
               <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="font-medium animate-pulse text-sm tracking-wide">Mempersiapkan Ruang Komando...</p>
         </div>
      );
   }

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">

         {/* HEADER DASHBOARD */}
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-linear-to-r from-slate-900 to-slate-800 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 opacity-10">
               <BrainCircuit size={180} />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2 text-blue-300 font-medium text-sm tracking-widest uppercase">
                  <Sparkles size={16} /> Sistem Pendukung Keputusan
               </div>
               <h1 className="text-3xl font-extrabold tracking-tight">Dashboard Eksekutif</h1>
               <p className="text-slate-300 mt-2 max-w-xl text-sm leading-relaxed">
                  Pemantauan waktu nyata kerentanan perundungan siswa SMA Negeri 2 Padang berdasarkan analisis <strong>AHP Absolut</strong>.
               </p>
            </div>
         </div>

         {/* KARTU STATISTIK (TOP ROW) */}
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
               <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Populasi</p>
                  <p className="text-2xl font-black text-slate-800">{siswaSemua.length} <span className="text-xs font-medium text-slate-400 normal-case">Siswa</span></p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center relative overflow-hidden hover:shadow-md transition-all">
               <div className="flex justify-between items-start mb-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progres Evaluasi</p>
                  <UserCheck size={16} className="text-emerald-500" />
               </div>
               <div className="flex items-end gap-2 mb-2">
                  <p className="text-2xl font-black text-slate-800">{siswaDinilai.length}</p>
                  <p className="text-xs font-medium text-slate-400 mb-1">/ {siswaSemua.length} Selesai</p>
               </div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full transition-all duration-1000" style={{ width: `${persenSelesai}%` }}></div>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group">
               <div className="p-3.5 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <ListChecks size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Parameter Ukur</p>
                  <p className="text-2xl font-black text-slate-800">{kriteria.length} <span className="text-xs font-medium text-slate-400 normal-case">Kriteria</span></p>
               </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-100 shadow-[0_2px_10px_-3px_rgba(239,68,68,0.2)] flex items-center gap-4">
               <div className="p-3.5 bg-red-100 text-red-600 rounded-xl animate-pulse">
                  <ShieldAlert size={24} />
               </div>
               <div>
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-0.5">Risiko Tinggi</p>
                  <p className="text-2xl font-black text-red-700">{jumlahRisikoTinggi} <span className="text-xs font-medium text-red-400 normal-case">Siswa</span></p>
               </div>
            </div>
         </div>

         {/* AREA GRAFIK (MIDDLE ROW) */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* GRAFIK BAR - TOP 5 */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
               <div className="flex justify-between items-center mb-6">
                  <div>
                     <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="text-primary" size={20} />
                        Peta Kerentanan Tertinggi (Top 5)
                     </h2>
                     <p className="text-xs text-slate-500 mt-1">Berdasarkan skor Absolut AHP (Mendekati 1.0 = Semakin Bahaya)</p>
                  </div>
               </div>

               <div className="grow flex items-end justify-around gap-4 mt-4 h-56 pt-6 border-b border-slate-100/80 pb-2 relative">
                  <div className="absolute top-1/2 w-full border-t border-dashed border-slate-200 z-0"></div>
                  
                  {top5Siswa.length === 0 ? (
                     <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm z-10">Belum ada data evaluasi.</div>
                  ) : top5Siswa.map((s, idx) => {
                     const heightPercent = (s.nilai_akhir || 0) * 100;
                     const gradientColor = getBarColor(s.kategori);

                     return (
                        <div key={s.id} className="w-1/5 flex flex-col items-center justify-end h-full group z-10 cursor-crosshair">
                           <div className="text-[12px] font-black text-slate-700 mb-2 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                              {(s.nilai_akhir || 0).toFixed(4)}
                           </div>
                           
                           <div className="w-full max-w-15 h-full flex items-end relative">
                              <div
                                 className={`w-full rounded-t-xl bg-linear-to-t ${gradientColor} shadow-lg transition-all duration-1000 ease-out relative overflow-hidden`}
                                 style={{ height: `${heightPercent}%`, minHeight: '5%' }}
                              >
                                 <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>
                           </div>
                           
                           <div className="mt-3 text-xs font-bold text-slate-700 text-center truncate w-full px-1" title={s.nama}>
                              {s.nama.split(' ')[0]}
                           </div>
                           <div className="text-[10px] text-slate-400 font-mono mt-0.5 bg-slate-100 px-2 py-0.5 rounded-full">Rank {idx + 1}</div>
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* GRAFIK DISTRIBUSI BOBOT KRITERIA */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
               <div className="mb-6">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     <PieChart className="text-indigo-500" size={20} />
                     Pengaruh Kriteria
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">Distribusi bobot kepentingan global (Eigenvector).</p>
               </div>

               <div className="grow flex flex-col justify-center space-y-5">
                  {kriteria.map((k) => (
                     <div key={k.kode} className="group">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{k.kode} - {k.nama}</span>
                           <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{(k.bobot * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                           <div
                              className="bg-linear-to-r from-indigo-400 to-indigo-600 h-full rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${k.bobot * 100}%` }}
                           ></div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

         </div>

         {/* AREA BAWAH (TABLE & INSIGHT) */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* TABEL PREVIEW RANKING */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
               <div className="p-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <TrendingUp className="text-primary" size={18} />
                     <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Preview Ranking Penanganan</h2>
                  </div>
                  <a href="/dashboard/ahp/hasil" className="text-xs font-bold text-primary hover:text-blue-800 hover:underline">Lihat Laporan Lengkap &rarr;</a>
               </div>
               
               <div className="overflow-x-auto p-2 grow">
                  <table className="w-full text-sm text-left">
                     <thead>
                        <tr className="text-slate-400 border-b border-slate-100">
                           <th className="py-3 px-4 font-bold w-12 text-center text-xs uppercase tracking-wider">Rank</th>
                           <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider">Identitas Siswa</th>
                           <th className="py-3 px-4 font-bold text-center text-xs uppercase tracking-wider">Skor AHP</th>
                           <th className="py-3 px-4 font-bold text-center text-xs uppercase tracking-wider">Status Evaluasi</th>
                        </tr>
                     </thead>
                     <tbody>
                        {top5Siswa.length === 0 ? (
                           <tr><td colSpan={4} className="text-center py-10 text-slate-400 text-sm">Belum ada data siswa yang dievaluasi.</td></tr>
                        ) : top5Siswa.map((s, idx) => (
                           <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors last:border-0 group">
                              <td className="py-3 px-4 text-center">
                                 <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs shadow-sm
                                    ${idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {idx + 1}
                                 </span>
                              </td>
                              <td className="py-3 px-4">
                                 <div className="font-bold text-slate-800 text-[13px] group-hover:text-primary transition-colors">{s.nama}</div>
                                 <div className="text-[11px] text-slate-400 mt-0.5">{s.kelas} • NISN: {s.nisn}</div>
                              </td>
                              <td className="py-3 px-4 text-center font-mono font-black text-slate-700 text-[13px]">
                                 {(s.nilai_akhir || 0).toFixed(4)}
                              </td>
                              <td className="py-3 px-4 text-center">
                                 <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-extrabold tracking-wider border shadow-sm ${getBadgeStyle(s.kategori)}`}>
                                    {s.kategori?.split(' ')[0]}
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* KOTAK INSIGHT / KESIMPULAN CERDAS */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50/50 p-6 rounded-2xl border border-blue-100 shadow-sm flex flex-col relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl"></div>
               
               <div className="flex items-center gap-2 mb-4 border-b border-blue-200/50 pb-4 relative z-10">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                     <AlertTriangle size={18} />
                  </div>
                  <h2 className="text-base font-bold text-slate-800">Insight Sistem</h2>
               </div>

               <div className="grow space-y-4 text-sm text-slate-700 leading-relaxed relative z-10 flex flex-col justify-center">
                  {siswaDinilai.length === 0 ? (
                     <div className="text-center text-slate-500 opacity-70">
                        <Database size={40} className="mx-auto mb-3" />
                        <p>Lakukan evaluasi siswa di menu <strong>Proses AHP</strong> untuk melihat insight cerdas di sini.</p>
                     </div>
                  ) : (
                     <>
                        <p className="bg-white/60 p-3 rounded-xl border border-white">
                           Terdapat <strong className="text-red-600 text-lg">{jumlahRisikoTinggi} siswa</strong> yang saat ini masuk dalam radar <strong>Risiko Tinggi & Parah</strong>.
                        </p>
                        
                        {top5Siswa.length > 0 && (
                           <p className="bg-white/60 p-3 rounded-xl border border-white">
                              Prioritas pemanggilan utama jatuh kepada <strong>{top5Siswa[0].nama}</strong> dengan tingkat kerentanan <strong>{(top5Siswa[0].nilai_akhir || 0).toFixed(4)}</strong>. 
                           </p>
                        )}
                        
                        <div className="mt-auto pt-2">
                           <div className="p-3 bg-slate-800 text-white rounded-xl shadow-md border border-slate-700">
                              <p className="font-bold text-xs text-blue-300 uppercase tracking-wider mb-1">Tindakan Disarankan</p>
                              <p className="text-xs leading-tight text-slate-300">Cetak laporan hasil, kemudian jadwalkan sesi konseling tertutup untuk siswa di peringkat Top 5 secepatnya.</p>
                           </div>
                        </div>
                     </>
                  )}
               </div>
            </div>

         </div>

      </div>
   );
}
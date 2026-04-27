// File: frontend/src/app/(dashboard)/dashboard/ahp/hasil/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
   Trophy, AlertTriangle, ShieldCheck, Printer,
   RefreshCw, FileText, UserCircle, Target
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

// Definisi antarmuka struktur data siswa sesuai skema Prisma
interface Siswa {
   id: number;
   nisn: string;
   nama: string;
   kelas: string;
   nilai_akhir: number | null;
   kategori: string | null;
}

export default function HasilPerangkinganPage() {
   const [siswa, setSiswa] = useState<Siswa[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   // Mengambil data siswa menggunakan rute /api/penilaian/data yang sudah ada di backend
   const fetchRankingData = useCallback(async () => {
      setIsLoading(true);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/data`);

         // Jika backend mati atau rute salah, cegah error JSON Parse HTML
         if (!response.ok) throw new Error("Gagal terhubung ke API backend.");

         const result = await response.json();

         if (result.success) {
            // Ambil array siswa dari dalam objek data backend Anda
            const dataSiswaAsli = result.data.siswa;

            // Memfilter hanya siswa yang sudah dinilai (nilai_akhir tidak null)
            const siswaDinilai = dataSiswaAsli.filter((s: Siswa) => s.nilai_akhir !== null);

            // MENGURUTKAN (SORTING): Dari nilai terbesar (risiko tertinggi) ke terkecil
            siswaDinilai.sort((a: Siswa, b: Siswa) => (b.nilai_akhir || 0) - (a.nilai_akhir || 0));

            setSiswa(siswaDinilai);
         }
      } catch (error) {
         console.error("Gagal memuat data ranking:", error);
         alert("Terjadi kesalahan jaringan atau rute API tidak ditemukan.");
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchRankingData();
   }, [fetchRankingData]);

   // Fungsi utilitas untuk memberikan lencana (badge) warna-warni berdasarkan kategori
   const getKategoriBadge = (kategori: string | null) => {
      if (!kategori) return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs">Belum Dievaluasi</span>;

      if (kategori.includes("Sangat Parah")) {
         return <span className="px-3 py-1 bg-red-100 text-red-700 border border-red-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max mx-auto"><AlertTriangle size={12} /> Sangat Parah</span>;
      } else if (kategori.includes("Parah")) {
         return <span className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-bold uppercase tracking-wider w-max mx-auto">Parah</span>;
      } else if (kategori.includes("Sedang")) {
         return <span className="px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full text-xs font-bold uppercase tracking-wider w-max mx-auto">Sedang</span>;
      } else if (kategori.includes("Rentan")) {
         return <span className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider w-max mx-auto">Rentan</span>;
      } else {
         return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-max mx-auto"><ShieldCheck size={12} /> Sangat Aman</span>;
      }
   };

   // Fungsi memicu cetak dokumen bawaan browser
   const handlePrint = () => {
      window.print();
   };

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-500">

         {/* HEADER - Disembunyikan saat mode cetak (print) */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b print:hidden">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-primary/10 rounded-xl">
                  <Trophy className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Hasil Perangkingan</h1>
                  <p className="text-sm text-slate-500 mt-1">Daftar prioritas penanganan siswa berdasarkan evaluasi risiko perundungan.</p>
               </div>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="gap-2" onClick={fetchRankingData} disabled={isLoading}>
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Segarkan
               </Button>
               <Button onClick={handlePrint} className="bg-slate-800 hover:bg-slate-900 gap-2 shadow-md" disabled={siswa.length === 0}>
                  <Printer size={16} /> Cetak Laporan
               </Button>
            </div>
         </div>

         {/* KOP SURAT - Hanya muncul saat mencetak kertas */}
         <div className="hidden print:block text-center mb-8 border-b-2 border-black pb-4">
            <h1 className="text-2xl font-black uppercase">Laporan Evaluasi Risiko Perundungan Siswa</h1>
            <p className="text-sm mt-1">Sistem Pendukung Keputusan (Metode AHP Absolut)</p>
            <p className="text-xs text-gray-500 mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
         </div>

         {/* KARTU RINGKASAN STATISTIK */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
               <div className="p-3 bg-red-50 rounded-full text-red-600"><AlertTriangle size={24} /></div>
               <div>
                  <p className="text-sm font-bold text-slate-500">Risiko Tinggi (Sangat Parah)</p>
                  <p className="text-2xl font-black text-slate-800">
                     {siswa.filter(s => s.kategori?.includes("Sangat Parah")).length} Siswa
                  </p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
               <div className="p-3 bg-amber-50 rounded-full text-amber-600"><Target size={24} /></div>
               <div>
                  <p className="text-sm font-bold text-slate-500">Pemantauan (Parah & Sedang)</p>
                  <p className="text-2xl font-black text-slate-800">
                     {siswa.filter(s => s.kategori?.includes("Parah") && !s.kategori?.includes("Sangat")).length +
                        siswa.filter(s => s.kategori?.includes("Sedang")).length} Siswa
                  </p>
               </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border shadow-sm flex items-center gap-4">
               <div className="p-3 bg-emerald-50 rounded-full text-emerald-600"><ShieldCheck size={24} /></div>
               <div>
                  <p className="text-sm font-bold text-slate-500">Kondisi Aman (Rentan & Aman)</p>
                  <p className="text-2xl font-black text-slate-800">
                     {siswa.filter(s => s.kategori?.includes("Rentan") || s.kategori?.includes("Aman")).length} Siswa
                  </p>
               </div>
            </div>
         </div>

         {/* TABEL KLASMEN PERANGKINGAN */}
         <div className="border rounded-2xl bg-white shadow-sm overflow-hidden print:border-none print:shadow-none">
            <div className="overflow-x-auto">
               <Table className="w-full min-w-max border-collapse print:text-sm">
                  <TableHeader className="bg-slate-50 print:bg-transparent border-b-2 border-slate-200">
                     <TableRow>
                        <TableHead className="font-bold text-slate-800 border-r w-16 text-center">Rank</TableHead>
                        <TableHead className="font-bold text-slate-800 border-r min-w-[250px]">Identitas Siswa</TableHead>
                        <TableHead className="font-bold text-slate-800 border-r w-32 text-center">Skor AHP</TableHead>
                        <TableHead className="font-bold text-slate-800 text-center min-w-[180px]">Status Kategori</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        <TableRow>
                           <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                              <RefreshCw className="animate-spin inline-block mr-2" size={20} /> Menyusun laporan perangkingan...
                           </TableCell>
                        </TableRow>
                     ) : siswa.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center">
                                 <FileText className="w-10 h-10 text-slate-300 mb-2" />
                                 <p className="font-semibold text-slate-700">Belum ada data siswa yang selesai dievaluasi.</p>
                                 <p className="text-xs text-slate-400 mt-1">Silakan lakukan penilaian di menu Evaluasi terlebih dahulu, lalu klik tombol Kalkulasi & Simpan.</p>
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : (
                        siswa.map((s, index) => {
                           const isTop3 = index < 3;

                           return (
                              <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                 {/* KOLOM RANKING */}
                                 <TableCell className="text-center font-bold border-r align-middle">
                                    {isTop3 ? (
                                       <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-white font-black shadow-sm
                                          ${index === 0 ? 'bg-amber-400 ring-4 ring-amber-100' :
                                             index === 1 ? 'bg-slate-400 ring-4 ring-slate-100' :
                                                'bg-orange-400 ring-4 ring-orange-100'}`}>
                                          {index + 1}
                                       </div>
                                    ) : (
                                       <span className="text-slate-400 text-lg">{index + 1}</span>
                                    )}
                                 </TableCell>

                                 {/* KOLOM IDENTITAS */}
                                 <TableCell className="border-r align-middle">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 print:hidden">
                                          <UserCircle size={24} />
                                       </div>
                                       <div>
                                          <div className="font-bold text-slate-800 text-base">{s.nama}</div>
                                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                                             NISN: {s.nisn} <span className="mx-1">•</span> Kelas: {s.kelas}
                                          </div>
                                       </div>
                                    </div>
                                 </TableCell>

                                 {/* KOLOM SKOR (PERSENTASE) */}
                                 <TableCell className="text-center align-middle border-r">
                                    <div className="font-mono text-xl font-black text-slate-700">
                                       {((s.nilai_akhir || 0) * 100).toFixed(2)}%
                                    </div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-1">
                                       Absolut: {(s.nilai_akhir || 0).toFixed(4)}
                                    </div>
                                 </TableCell>

                                 {/* KOLOM KATEGORI (BADGE) */}
                                 <TableCell className="text-center align-middle">
                                    {getKategoriBadge(s.kategori)}
                                 </TableCell>
                              </TableRow>
                           );
                        })
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>

         {/* PANDUAN TANDA TANGAN (KHUSUS CETAK) */}
         <div className="hidden print:flex justify-between w-full mt-20 px-10">
            <div className="text-center">
               <p>Mengetahui,</p>
               <p className="font-bold">Kepala SMA Negeri 2 Padang</p>
               <div className="h-24"></div>
               <p className="font-bold underline">( ......................................... )</p>
               <p>NIP. ........................................</p>
            </div>
            <div className="text-center">
               <p>Padang, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
               <p className="font-bold">Guru Bimbingan Konseling</p>
               <div className="h-24"></div>
               <p className="font-bold underline">( ......................................... )</p>
               <p>NIP. ........................................</p>
            </div>
         </div>

      </div>
   );
}
// File: frontend/src/app/(dashboard)/dashboard/ahp/hasil/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
   Trophy, AlertTriangle, ShieldCheck, Printer,
   RefreshCw, FileText, UserCircle, Target, Search
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
   nilai_akhir: number | null;
   kategori: string | null;
}

interface Kriteria {
   kode: string;
   nama: string;
   bobot: number;
}

interface SubKriteria {
   kode: string;
   nama_sub: string;
   bobot_ideal: number;
}

interface Penilaian {
   siswa_id: number;
   kriteria_kode: string;
   subkriteria_kode: string;
}

export default function HasilPerangkinganPage() {
   const [siswa, setSiswa] = useState<Siswa[]>([]);
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([]);
   const [penilaianRecords, setPenilaianRecords] = useState<Penilaian[]>([]);

   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState("");

   const fetchRankingData = useCallback(async () => {
      setIsLoading(true);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/data`);

         if (!response.ok) throw new Error("Gagal terhubung ke API backend.");

         const result = await response.json();

         if (result.success) {
            setKriteria(result.data.kriteria);
            setSubKriteria(result.data.subKriteria);
            setPenilaianRecords(result.data.penilaian);

            const dataSiswaAsli = result.data.siswa;
            const siswaDinilai = dataSiswaAsli.filter((s: Siswa) => s.nilai_akhir !== null);

            siswaDinilai.sort((a: Siswa, b: Siswa) => (b.nilai_akhir || 0) - (a.nilai_akhir || 0));

            setSiswa(siswaDinilai);
         }
      } catch (error) {
         console.error("Gagal memuat data ranking:", error);
         alert("Terjadi kesalahan jaringan saat memuat data.");
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchRankingData();
   }, [fetchRankingData]);

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

   const filteredSiswa = siswa.filter(s =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const handlePrint = () => {
      const printWindow = window.open('', '_blank', 'width=900,height=650');
      if (!printWindow) {
         alert("Pop-up diblokir oleh browser. Izinkan pop-up untuk mencetak PDF.");
         return;
      }

      const currentDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

      const tableRows = filteredSiswa.map((h, idx) => `
      <tr>
        <td style="border: 1px solid #000; padding: 6px 8px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 6px 8px;"><strong>${h.nama}</strong><br><span style="font-size: 10pt; color: #555;">NISN: ${h.nisn}</span></td>
        <td style="border: 1px solid #000; padding: 6px 8px; text-align: center;">${h.kelas}</td>
        <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-family: monospace; font-size: 12pt;">${(h.nilai_akhir || 0).toFixed(4)}</td>
        <td style="border: 1px solid #000; padding: 6px 8px; text-align: center; font-weight: bold;">
          ${h.kategori?.includes('Parah') ? `<span style="color: #d32f2f;">${h.kategori}</span>` :
            h.kategori?.includes('Sedang') ? `<span style="color: #f57c00;">${h.kategori}</span>` :
               `<span style="color: #388e3c;">${h.kategori}</span>`}
        </td>
      </tr>
      `).join('');

      const htmlContent = `
      <html>
        <head>
          <title>Laporan_Risiko_Perundungan_${currentDate}</title>
          <style>
            @media print {
              @page { margin: 2.5cm; }
              body { -webkit-print-color-adjust: exact; }
            }
            body { 
               font-family: 'Times New Roman', Times, serif; 
               font-size: 12pt; 
               color: #000; 
               line-height: 1.5; 
               margin: 0; 
               padding: 20px; 
            }
            .kop-surat { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .kop-surat h1 { margin: 0; font-size: 14pt; text-transform: uppercase; font-weight: normal; }
            .kop-surat h2 { margin: 0; font-size: 16pt; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
            .kop-surat p { margin: 5px 0 0 0; font-size: 11pt; }
            
            .judul-laporan { text-align: center; font-size: 12pt; margin: 30px 0 20px 0; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
            .deskripsi { font-size: 12pt; margin-bottom: 20px; text-align: justify; text-indent: 1.27cm; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12pt; }
            th { border: 1px solid #000; padding: 8px; background-color: #f0f0f0 !important; font-weight: bold; text-align: center; }
            td { border: 1px solid #000; padding: 8px; }
            
            .ttd-container { width: 100%; margin-top: 50px; display: flex; justify-content: space-between; padding: 0 20px; box-sizing: border-box; }
            .ttd-box { width: 280px; text-align: center; font-size: 12pt; }
            .ttd-box p { margin: 0; line-height: 1.5; }
            .ttd-space { height: 80px; }
          </style>
        </head>
        <body>
          <div class="kop-surat">
            <h1>Pemerintah Provinsi Sumatera Barat</h1>
            <h1>Dinas Pendidikan</h1>
            <h2>SMA Negeri 2 Padang</h2>
            <p>Jl. Musi No.2, Rimbo Kaluang, Kec. Padang Barat, Kota Padang, Sumatera Barat 25116</p>
            <p>Telepon: (0751) 7055655 | Email: sman2padang@gmail.com</p>
          </div>
          
          <div class="judul-laporan">Laporan Hasil Deteksi Dini Risiko Perundungan</div>
          
          <div class="deskripsi">
            Dokumen ini merupakan laporan resmi hasil pemetaan tingkat kerentanan peserta didik terhadap risiko perundungan (<i>bullying</i>) di lingkungan SMA Negeri 2 Padang. Penilaian dieksekusi secara objektif oleh Guru Bimbingan Konseling menggunakan Sistem Pendukung Keputusan (Metode <em>Analytic Hierarchy Process Absolut</em>). Peserta didik dengan indikasi kerentanan tinggi menjadi target prioritas untuk tindakan preventif.
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%;">No</th>
                <th style="width: 35%;">Data Siswa</th>
                <th style="width: 15%;">Kelas</th>
                <th style="width: 15%;">Skor AHP</th>
                <th style="width: 30%;">Indikasi Risiko</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows || '<tr><td colspan="5" style="text-align: center; padding: 10px;">Tidak ada data yang dicetak.</td></tr>'}
            </tbody>
          </table>

          <div class="ttd-container">
            <div class="ttd-box">
              <p><br></p>
              <p>Mengetahui,</p>
              <p><strong>Kepala SMA Negeri 2 Padang</strong></p>
              <div class="ttd-space"></div>
              <p style="text-decoration: underline; font-weight: bold;">( ......................................... )</p>
              <p>NIP. ........................................</p>
            </div>
            <div class="ttd-box">
              <p>Padang, ${currentDate}</p>
              <p><br></p>
              <p><strong>Guru Bimbingan Konseling</strong></p>
              <div class="ttd-space"></div>
              <p style="text-decoration: underline; font-weight: bold;">( ......................................... )</p>
              <p>NIP. ........................................</p>
            </div>
          </div>

          <script>
            window.onload = function() { 
              window.print(); 
              window.onafterprint = function() { window.close(); }
            }
          </script>
        </body>
      </html>
      `;

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
   };

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-500">

         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
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
                  <Printer size={16} /> Cetak Laporan PDF
               </Button>
            </div>
         </div>

         <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
               type="text"
               placeholder="Cari nama atau NISN siswa..."
               className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-white shadow-sm hover:bg-slate-50 transition-colors"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

         <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
               <Table className="w-full min-w-max border-collapse">
                  <TableHeader className="bg-slate-50 border-b-2 border-slate-200">
                     <TableRow>
                        <TableHead className="font-bold text-slate-800 border-r w-16 text-center">Rank</TableHead>
                        <TableHead className="font-bold text-slate-800 border-r min-w-62.5">Identitas Siswa</TableHead>
                        {/* PERBAIKAN 1: Lebar kolom skor dipaskan agar proporsional */}
                        <TableHead className="font-bold text-slate-800 border-r min-w-40 text-center">Skor AHP Absolut</TableHead>
                        <TableHead className="font-bold text-slate-800 text-center min-w-45">Status Kategori</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        <TableRow>
                           <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                              <RefreshCw className="animate-spin inline-block mr-2" size={20} /> Menyusun laporan perangkingan...
                           </TableCell>
                        </TableRow>
                     ) : filteredSiswa.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                              <div className="flex flex-col items-center justify-center">
                                 <FileText className="w-10 h-10 text-slate-300 mb-2" />
                                 <p className="font-semibold text-slate-700">
                                    {searchTerm ? "Tidak ditemukan hasil untuk pencarian tersebut." : "Belum ada data siswa yang selesai dievaluasi."}
                                 </p>
                              </div>
                           </TableCell>
                        </TableRow>
                     ) : (
                        filteredSiswa.map((s, index) => {
                           const isTop3 = index < 3 && !searchTerm;

                           const catatanSiswa = penilaianRecords.filter(p => p.siswa_id === s.id);
                           const rincianRumus = catatanSiswa.map(p => {
                              const kData = kriteria.find(k => k.kode === p.kriteria_kode);
                              const subData = subKriteria.find(sub => sub.kode === p.subkriteria_kode);

                              if (!kData || !subData) return null;
                              return `(${kData.bobot.toFixed(3)}×${subData.bobot_ideal.toFixed(3)})`;
                           }).filter(Boolean).join(" + ");

                           return (
                              <TableRow key={s.id} className="hover:bg-slate-50/50 transition-colors group">
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

                                 <TableCell className="border-r align-middle">
                                    <div className="flex items-center gap-3">
                                       <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
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

                                 {/* PERBAIKAN 2: Mengecilkan font dan membatasi lebar menggunakan break-words */}
                                 <TableCell className="text-center align-middle border-r px-2">
                                    <div className="font-mono text-xl font-black text-slate-700">
                                       {(s.nilai_akhir || 0).toFixed(4)}
                                    </div>
                                    <div
                                       className="text-[8px] mt-1.5 text-slate-400 font-mono tracking-tighter max-w-40 mx-auto whitespace-normal wrap-break-word leading-tight"
                                       title="Rincian: (Bobot Kriteria × Bobot Ideal T)"
                                    >
                                       {rincianRumus}
                                    </div>
                                 </TableCell>

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
      </div>
   );
}
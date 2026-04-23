// File: frontend/src/app/(dashboard)/dashboard/ahp/hasil/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, RefreshCw, Trophy, AlertCircle, CheckCircle2, Search, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

// 1. PENYESUAIAN INTERFACE: Menyesuaikan dengan schema.prisma yang baru
interface Siswa {
   id: number;
   nisn: string;
   nama: string;
   kelas: string;
   gender: string;
}

interface Kriteria {
   kode: string; // Menggunakan kode (C1, C2) sebagai ID
   nama: string;
   keterangan: string;
   bobot: number;
}

interface SubKriteria {
   kode: string; // Menggunakan kode (T1, T2) sebagai ID
   nama_sub: string;
   bobot_ideal: number;
}

interface HasilAkhir extends Siswa {
   totalSkor: number;
   label: string;
   warna: string;
}

export default function HasilPenilaianPage() {
   const [siswa, setSiswa] = useState<Siswa[]>([]);
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([]); // Menyimpan pilihan T1-T5
   const [isLoading, setIsLoading] = useState(true);

   // State Scores diubah menjadi: { siswa_id: { kriteria_kode: subkriteria_kode } }
   // Contoh: { 1: { "C1": "T2", "C2": "T4" } }
   const [scores, setScores] = useState<Record<number, Record<string, string>>>({});
   const [hasilAkhir, setHasilAkhir] = useState<HasilAkhir[]>([]);

   const [isResultOpen, setIsResultOpen] = useState(false);
   const [resultData, setResultData] = useState<{ isSuccess: boolean; message: string } | null>(null);
   const [searchTerm, setSearchTerm] = useState("");

   // 2. ROMBAK TOTAL RUMUS KALKULASI (AHP ABSOLUT MURNI)
   const kalkulasiHasil = useCallback((
      dataSiswa: Siswa[],
      dataKriteria: Kriteria[],
      dataSubKriteria: SubKriteria[],
      dataScores: Record<number, Record<string, string>>
   ) => {

      const ranking: HasilAkhir[] = dataSiswa.map(s => {
         let totalSkor = 0;

         // Loop setiap kriteria untuk menghitung skor siswa ini
         dataKriteria.forEach(k => {
            const subKodeTerpilih = dataScores[s.id]?.[k.kode]; // Misal: "T2"

            if (subKodeTerpilih) {
               // Cari bobot ideal dari T2
               const subTerpilih = dataSubKriteria.find(sub => sub.kode === subKodeTerpilih);
               if (subTerpilih) {
                  // RUMUS AHP ABSOLUT: Bobot Global (W) * Bobot Ideal (I)
                  totalSkor += (k.bobot * subTerpilih.bobot_ideal);
               }
            }
         });

         // Logika Kategori berdasarkan Total Skor AHP Absolut (Maksimal ~1.0)
         let label = "Sangat Aman";
         let warna = "bg-green-100 text-green-700 border-green-200";

         if (totalSkor >= 0.8) {
            label = "Sangat Parah (Bahaya)";
            warna = "bg-red-100 text-red-700 border-red-200";
         } else if (totalSkor >= 0.6) {
            label = "Parah (Perhatian)";
            warna = "bg-orange-100 text-orange-700 border-orange-200";
         } else if (totalSkor >= 0.4) {
            label = "Sedang (Waspada)";
            warna = "bg-yellow-100 text-yellow-700 border-yellow-200";
         } else if (totalSkor >= 0.2) {
            label = "Aman";
            warna = "bg-blue-100 text-blue-700 border-blue-200";
         }

         return { ...s, totalSkor, label, warna };
      });

      // Urutkan dari risiko tertinggi (skor terbesar) ke terendah
      ranking.sort((a, b) => b.totalSkor - a.totalSkor);
      setHasilAkhir(ranking);
   }, []);

   const fetchData = useCallback(async () => {
      setIsLoading(true);
      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/data`);
         const json = await res.json();
         if (json.success) {
            setSiswa(json.data.siswa);
            setKriteria(json.data.kriteria);
            setSubKriteria(json.data.subKriteria); // Ambil data opsi T1-T5

            const loadedScores: Record<number, Record<string, string>> = {};

            // Menggunakan tabel "penilaian" yang baru, dengan kriteria_kode dan subkriteria_kode
            json.data.penilaian.forEach((p: { siswa_id: number; kriteria_kode: string; subkriteria_kode: string }) => {
               if (!loadedScores[p.siswa_id]) loadedScores[p.siswa_id] = {};
               loadedScores[p.siswa_id][p.kriteria_kode] = p.subkriteria_kode;
            });

            setScores(loadedScores);
            kalkulasiHasil(json.data.siswa, json.data.kriteria, json.data.subKriteria, loadedScores);
         }
      } catch (error) {
         console.error("Gagal menarik data:", error);
      } finally {
         setIsLoading(false);
      }
   }, [kalkulasiHasil]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   // Fungsi update state saat admin memilih dropdown
   const handleScoreChange = (siswaId: number, kriteriaKode: string, subKode: string) => {
      setScores(prev => ({
         ...prev,
         [siswaId]: {
            ...(prev[siswaId] || {}),
            [kriteriaKode]: subKode
         }
      }));
   };

   // Fungsi mengirim payload ke backend (Format AHP Absolut)
   const handleSimpan = async () => {
      const payload: { siswa_id: number; kriteria_kode: string; subkriteria_kode: string }[] = [];

      Object.keys(scores).forEach((sIdStr) => {
         const sId = parseInt(sIdStr);
         Object.keys(scores[sId]).forEach((kKode) => {
            const subKode = scores[sId][kKode];
            if (subKode) {
               payload.push({
                  siswa_id: sId,
                  kriteria_kode: kKode,
                  subkriteria_kode: subKode
               });
            }
         });
      });

      if (payload.length === 0) {
         setResultData({ isSuccess: false, message: "Harap isi setidaknya satu nilai sebelum menyimpan." });
         setIsResultOpen(true);
         return;
      }

      try {
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/penilaian/simpan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ scores: payload })
         });
         const json = await res.json();

         if (json.success) {
            setResultData({ isSuccess: true, message: json.message });
            setIsResultOpen(true);
            // Hitung ulang ranking setelah data sukses disimpan
            kalkulasiHasil(siswa, kriteria, subKriteria, scores);
         }
      } catch (error) {
         console.error("Gagal simpan:", error);
         setResultData({ isSuccess: false, message: "Gagal menghubungi server. Periksa koneksi Anda." });
         setIsResultOpen(true);
      }
   };

   const filteredSiswa = siswa.filter(s =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.toLowerCase().includes(searchTerm.toLowerCase())
   );

   const filteredHasil = hasilAkhir.filter(h =>
      h.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.nisn.toLowerCase().includes(searchTerm.toLowerCase())
   );

   // (Fungsi Cetak PDF tetap utuh, tidak diubah)
   const handleCetakPDF = () => {
      const printWindow = window.open('', '_blank', 'width=900,height=650');
      if (!printWindow) {
         alert("Pop-up diblokir oleh browser. Izinkan pop-up untuk mencetak PDF.");
         return;
      }

      const currentDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

      const tableRows = filteredHasil.map((h, idx) => `
      <tr>
        <td style="border: 1px solid #000; padding: 10px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #000; padding: 10px;"><strong>${h.nama}</strong><br><span style="font-size: 12px; color: #555;">NISN: ${h.nisn}</span></td>
        <td style="border: 1px solid #000; padding: 10px; text-align: center;">${h.kelas}</td>
        <td style="border: 1px solid #000; padding: 10px; text-align: center; font-family: monospace; font-size: 14px;">${h.totalSkor.toFixed(4)}</td>
        <td style="border: 1px solid #000; padding: 10px; text-align: center; font-weight: bold;">
          ${h.label.includes('Parah') ? `<span style="color: #d32f2f;">${h.label}</span>` :
            h.label.includes('Sedang') ? `<span style="color: #f57c00;">${h.label}</span>` :
               `<span style="color: #388e3c;">${h.label}</span>`}
        </td>
      </tr>
    `).join('');

      const htmlContent = `
      <html>
        <head>
          <title>Laporan_Risiko_Perundungan_${currentDate}</title>
          <style>
            @media print {
              @page { margin: 2cm; }
              body { -webkit-print-color-adjust: exact; }
            }
            body { font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.5; margin: 0; padding: 20px; }
            .kop-surat { text-align: center; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; position: relative; }
            .kop-surat h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: normal; }
            .kop-surat h2 { margin: 0; font-size: 24px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px; }
            .kop-surat p { margin: 5px 0 0 0; font-size: 12px; }
            
            .judul-laporan { text-align: center; font-size: 16px; margin: 30px 0 20px 0; font-weight: bold; text-transform: uppercase; text-decoration: underline; }
            .deskripsi { font-size: 14px; margin-bottom: 20px; text-align: justify; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px; }
            th { border: 1px solid #000; padding: 12px; background-color: #f0f0f0 !important; font-weight: bold; text-align: center; }
            td { border: 1px solid #000; padding: 10px; }
            
            .ttd-container { width: 100%; margin-top: 50px; display: flex; justify-content: space-between; padding: 0 20px; }
            .ttd-box { width: 280px; text-align: center; font-size: 14px; }
            .ttd-box p { margin: 0; }
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
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Analisis Hasil SPK</h1>
               <p className="text-slate-500 text-sm mt-1">Evaluasi kondisi siswa menggunakan penilaian Absolut AHP.</p>
            </div>
            <Button onClick={handleSimpan} className="flex items-center gap-2 shadow-md px-6 bg-primary hover:bg-blue-700">
               <Save size={16} /> Simpan Evaluasi
            </Button>
         </div>

         {isLoading ? (
            <div className="flex justify-center items-center py-20 text-slate-500">
               <RefreshCw className="animate-spin mr-2" size={24} /> Sinkronisasi data...
            </div>
         ) : (
            <div className="bg-white rounded-2xl border shadow-sm p-6">
               <Tabs defaultValue="input" className="w-full">

                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
                     <TabsList className="grid w-full lg:w-1/2 grid-cols-2 p-1 bg-slate-100 rounded-xl">
                        <TabsTrigger value="input" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">1. Evaluasi Kondisi</TabsTrigger>
                        <TabsTrigger value="hasil" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold text-primary">2. Hasil Perankingan</TabsTrigger>
                     </TabsList>

                     <div className="relative w-full lg:w-1/3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                           type="text"
                           placeholder="Cari nama atau NISN siswa..."
                           className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm bg-slate-50 hover:bg-white transition-colors"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                     </div>
                  </div>

                  {/* TAB 1: FORM INPUT DENGAN DROPDOWN INTENSITAS */}
                  <TabsContent value="input">
                     <div className="bg-blue-50 text-blue-800 p-4 rounded-xl flex items-start gap-3 mb-4 text-sm border border-blue-100">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p>Pilih tingkat intensitas/kondisi siswa pada masing-masing kriteria. Semakin tinggi risiko yang dipilih (contoh: Sangat Parah), semakin tinggi skor akhir siswa tersebut.</p>
                     </div>
                     <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <Table className="min-w-max border-collapse">
                           <TableHeader className="bg-slate-50">
                              <TableRow>
                                 <TableHead className="font-bold border bg-slate-100 text-center w-10">No</TableHead>
                                 <TableHead className="font-bold border bg-slate-100 min-w-50">Nama Siswa</TableHead>

                                 {/* Hapus lencana Cost/Benefit karena ini AHP Absolut */}
                                 {kriteria.map((k) => (
                                    <TableHead key={k.kode} className="font-bold border align-top min-w-40 p-3 bg-slate-50">
                                       <div className="flex flex-col items-center text-center">
                                          <span className="text-sm text-primary font-extrabold">{k.kode}</span>
                                          <span className="text-xs font-semibold text-slate-700 mt-1 whitespace-normal leading-tight">{k.nama}</span>
                                       </div>
                                    </TableHead>
                                 ))}
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {filteredSiswa.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={kriteria.length + 2} className="text-center py-12 text-slate-500">
                                       {searchTerm ? `Tidak ditemukan siswa dengan kata kunci "${searchTerm}"` : "Belum ada data siswa."}
                                    </TableCell>
                                 </TableRow>
                              ) : filteredSiswa.map((s, idx) => (
                                 <TableRow key={s.id} className="hover:bg-slate-50">
                                    <TableCell className="text-center font-bold border">{idx + 1}</TableCell>
                                    <TableCell className="font-semibold border bg-white sticky left-0 z-10 shadow-[1px_0_0_0_#e2e8f0]">
                                       {s.nama} <span className="text-xs font-normal text-slate-400 block">{s.kelas} | {s.nisn}</span>
                                    </TableCell>
                                    {kriteria.map((k) => (
                                       <TableCell key={k.kode} className="border p-2">

                                          {/* Rombak Dropdown menggunakan data dari SubKriteria (T1-T5) */}
                                          <select
                                             className={`w-full border p-2 text-xs md:text-sm rounded-md font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer ${scores[s.id]?.[k.kode] ? 'bg-blue-50 border-primary/30 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-500'
                                                }`}
                                             value={scores[s.id]?.[k.kode] || ""}
                                             onChange={(e) => handleScoreChange(s.id, k.kode, e.target.value)}
                                          >
                                             <option value="" disabled>-- Pilih Kondisi --</option>
                                             {subKriteria.map((sub) => (
                                                <option key={sub.kode} value={sub.kode}>
                                                   {sub.nama_sub} ({sub.kode})
                                                </option>
                                             ))}
                                          </select>

                                       </TableCell>
                                    ))}
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>
                  </TabsContent>

                  {/* TAB 2: HASIL PERANKINGAN */}
                  <TabsContent value="hasil">
                     <div className="mb-6 bg-blue-50 p-5 rounded-xl border border-blue-100 mt-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                           <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
                              <Trophy className="text-yellow-500" /> Hasil Akhir Analisis Risiko Perundungan
                           </h3>
                           <p className="text-sm text-blue-800 leading-relaxed max-w-2xl">
                              Tabel di bawah ini menampilkan peringkat tingkat kerentanan siswa terhadap perundungan. Siswa dengan indikasi <span className="text-red-600 font-bold">Sangat Parah (Bahaya)</span> memerlukan perhatian khusus.
                           </p>
                        </div>
                        <Button
                           onClick={handleCetakPDF}
                           className="bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2 shadow-md shrink-0"
                           disabled={filteredHasil.length === 0}
                        >
                           <Printer size={16} /> Cetak Laporan PDF
                        </Button>
                     </div>

                     <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                        <Table className="min-w-max border-collapse">
                           <TableHeader className="bg-slate-800">
                              <TableRow>
                                 <TableHead className="font-bold text-white border-slate-700 text-center w-16">Peringkat</TableHead>
                                 <TableHead className="font-bold text-white border-slate-700">Nama Siswa</TableHead>
                                 <TableHead className="font-bold text-white border-slate-700 text-center">Kelas</TableHead>
                                 <TableHead className="font-bold text-white border-slate-700 text-center">Skor AHP Absolut</TableHead>
                                 <TableHead className="font-bold text-white border-slate-700 text-center">Indikasi Kerentanan</TableHead>
                              </TableRow>
                           </TableHeader>
                           <TableBody>
                              {filteredHasil.length === 0 ? (
                                 <TableRow>
                                    <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                       {searchTerm ? `Tidak ditemukan hasil untuk "${searchTerm}"` : "Simpan nilai terlebih dahulu untuk melihat hasil."}
                                    </TableCell>
                                 </TableRow>
                              ) : filteredHasil.map((h, idx) => (
                                 <TableRow key={h.id} className={idx < 3 && !searchTerm ? 'bg-red-50/30' : 'hover:bg-slate-50'}>
                                    <TableCell className="text-center border">
                                       {hasilAkhir.findIndex(item => item.id === h.id) === 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 font-bold border border-red-300 shadow-sm">1</span> :
                                          hasilAkhir.findIndex(item => item.id === h.id) === 1 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold border border-orange-300 shadow-sm">2</span> :
                                             hasilAkhir.findIndex(item => item.id === h.id) === 2 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-300 shadow-sm">3</span> :
                                                <span className="font-bold text-slate-500">{hasilAkhir.findIndex(item => item.id === h.id) + 1}</span>}
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-800 border">
                                       {h.nama} <span className="text-xs font-normal text-slate-400 block">{h.nisn}</span>
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600 border">{h.kelas}</TableCell>
                                    <TableCell className="text-center font-mono font-bold text-primary border text-lg">
                                       {h.totalSkor.toFixed(4)}
                                    </TableCell>
                                    <TableCell className="text-center border">
                                       <span className={`px-3 py-1.5 rounded-md text-xs font-bold border shadow-sm ${h.warna}`}>
                                          {h.label}
                                       </span>
                                    </TableCell>
                                 </TableRow>
                              ))}
                           </TableBody>
                        </Table>
                     </div>

                     {hasilAkhir.length > 0 && (
                        <div className="mt-6 p-6 rounded-2xl border shadow-sm bg-slate-50 border-slate-200">
                           <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-slate-800">
                              <FileText size={20} className="text-primary" /> Kesimpulan Hasil Evaluasi
                           </h3>
                           <div className="space-y-3 text-sm leading-relaxed text-slate-700">
                              <p>
                                 Berdasarkan perhitungan Absolut AHP dari <strong>{siswa.length}</strong> data siswa yang telah dievaluasi, sistem menyimpulkan bahwa <strong>{hasilAkhir[0].nama}</strong> (Kelas {hasilAkhir[0].kelas}) menduduki peringkat pertama dengan tingkat kerentanan tertinggi sebesar <strong>{hasilAkhir[0].totalSkor.toFixed(4)}</strong>.
                              </p>
                              <p>
                                 Siswa tersebut terindikasi berada pada status <strong className="text-red-600">{hasilAkhir[0].label}</strong>. Oleh karena itu, direkomendasikan kepada pihak sekolah—khususnya Guru Bimbingan Konseling (BK)—untuk memprioritaskan investigasi dan pendampingan psikologis terhadap siswa yang bersangkutan.
                              </p>
                           </div>
                        </div>
                     )}
                  </TabsContent>
               </Tabs>
            </div>
         )}

         {/* Pop-up Dialog Tetap Utuh */}
         <Dialog open={isResultOpen} onOpenChange={setIsResultOpen}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <div className={`mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full ${resultData?.isSuccess ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                     {resultData?.isSuccess ? <CheckCircle2 size={32} className="animate-in zoom-in duration-300" /> : <AlertCircle size={32} />}
                  </div>
                  <DialogTitle className="text-center text-xl">
                     {resultData?.isSuccess ? "Evaluasi Berhasil Disimpan!" : "Perhatian!"}
                  </DialogTitle>
                  <DialogDescription className="text-center text-slate-600 mt-2">
                     {resultData?.message}
                  </DialogDescription>
               </DialogHeader>
               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-2 text-center">
                  <p className="text-sm text-slate-500 mb-1">Status Penyimpanan</p>
                  <p className={`text-xl font-bold ${resultData?.isSuccess ? 'text-green-600' : 'text-amber-600'}`}>Selesai</p>
               </div>
               <DialogFooter className="mt-6">
                  <Button className="w-full" onClick={() => setIsResultOpen(false)}>Tutup & Lanjutkan</Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
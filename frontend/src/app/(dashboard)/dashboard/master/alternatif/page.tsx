// File: frontend/src/app/(dashboard)/dashboard/master/alternatif/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
// PERBAIKAN: Menambahkan ikon Upload, Download, dan Loader untuk fitur CSV
import { Plus, Edit, Trash2, Upload, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Siswa {
   id: number;
   nisn: string;
   nama: string;
   kelas: string;
   gender: string;
}

export default function AlternatifPage() {
   const [siswa, setSiswa] = useState<Siswa[]>([]);
   const [formData, setFormData] = useState({ nisn: "", nama: "", kelas: "", gender: "L" });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editId, setEditId] = useState<number | null>(null);

   // STATE BARU: Untuk fitur CSV
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [isUploading, setIsUploading] = useState(false);

   const fetchSiswa = async () => {
      try {
         // PERBAIKAN 1: Menarik data (GET) menggunakan backtick dan ${}
         const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siswa`);
         const json = await res.json();
         if (json.success) setSiswa(json.data);
      } catch (error) {
         console.error("Gagal mengambil data siswa", error);
      }
   };

   useEffect(() => {
      const loadInitialData = async () => {
         await fetchSiswa();
      };
      loadInitialData();
   }, []);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // PERBAIKAN 2: Mengatur URL Edit (PUT) dan Tambah (POST) menggunakan backtick dan ${}
      const url = editId ? `${process.env.NEXT_PUBLIC_API_URL}/api/siswa/${editId}` : `${process.env.NEXT_PUBLIC_API_URL}/api/siswa`;
      const method = editId ? "PUT" : "POST";

      await fetch(url, {
         method,
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify(formData),
      });

      setIsModalOpen(false);
      setEditId(null);
      setFormData({ nisn: "", nama: "", kelas: "", gender: "L" });
      fetchSiswa();
   };

   const handleDelete = async (id: number) => {
      if (confirm("Yakin ingin menghapus siswa ini?")) {
         // PERBAIKAN 3: Menghapus data (DELETE) menggunakan backtick dan ${}
         await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siswa/${id}`, { method: "DELETE" });
         fetchSiswa();
      }
   };

   // ====================================================================
   // FITUR BARU: Mengunduh Template CSV agar format pengguna tidak salah
   // ====================================================================
   const downloadTemplate = () => {
      const headers = "NISN,Nama,Kelas,Gender\n";
      const sampleData = "1234567890,Budi Santoso,X.1,L\n0987654321,Siti Aminah,X.2,P";
      const blob = new Blob([headers + sampleData], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Template_Data_Siswa.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   // ====================================================================
   // FITUR BARU: Membaca file CSV yang diunggah dan mengirimnya ke Backend
   // ====================================================================
   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();

      // Saat file selesai dibaca oleh browser...
      reader.onload = async (event) => {
         const text = event.target?.result as string;
         // Memecah teks berdasarkan baris baru (enter)
         const lines = text.split('\n').filter(line => line.trim() !== '');

         if (lines.length < 2) {
            alert("File CSV kosong atau tidak memiliki data.");
            return;
         }

         const newStudents = [];

         // Loop dimulai dari index 1 (karena index 0 adalah Header kolom)
         for (let i = 1; i < lines.length; i++) {
            // Memecah baris berdasarkan tanda koma
            const cols = lines[i].split(',');
            if (cols.length >= 4) {
               newStudents.push({
                  nisn: cols[0].trim(),
                  nama: cols[1].trim(),
                  kelas: cols[2].trim(),
                  // Memastikan gender hanya bernilai 'L' atau 'P'
                  gender: cols[3].trim().toUpperCase() === 'P' ? 'P' : 'L'
               });
            }
         }

         if (newStudents.length > 0) {
            setIsUploading(true);
            try {
               // Mengirim semua data sekaligus menggunakan Promise.all
               await Promise.all(newStudents.map(student =>
                  // PERBAIKAN 4: Menyimpan impor CSV (POST) menggunakan backtick dan ${}
                  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/siswa`, {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify(student)
                  })
               ));
               alert(`Sukses! Berhasil mengimpor ${newStudents.length} data siswa.`);
               fetchSiswa(); // Perbarui tabel di layar
            } catch (error) {
               console.error("Gagal impor:", error);
               alert("Terjadi kesalahan saat mengimpor data ke server.");
            } finally {
               setIsUploading(false);
               // Mereset input file agar bisa memilih file yang sama lagi jika perlu
               if (fileInputRef.current) fileInputRef.current.value = '';
            }
         }
      };

      // Perintah untuk mulai membaca file sebagai teks mentah
      reader.readAsText(file);
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

         <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl border shadow-sm gap-4">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Data Alternatif (Siswa)</h1>
               <p className="text-slate-500 text-sm mt-1">Daftar siswa yang akan dianalisis risikonya.</p>
            </div>

            <div className="flex flex-wrap gap-2">
               {/* Input file tersembunyi yang akan dipicu oleh tombol "Import CSV" */}
               <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
               />

               <Button
                  variant="outline"
                  className="bg-slate-50 border-slate-200 text-slate-600 hover:text-primary hover:border-primary/50"
                  onClick={downloadTemplate}
               >
                  <Download className="mr-2 h-4 w-4" /> Template CSV
               </Button>

               <Button
                  variant="outline"
                  className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
               >
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  {isUploading ? "Mengimpor..." : "Import CSV"}
               </Button>

               <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                     <Button
                        className="bg-primary hover:bg-blue-700 shadow-md"
                        onClick={() => { setEditId(null); setFormData({ nisn: "", nama: "", kelas: "", gender: "L" }); }}
                     >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Manual
                     </Button>
                  </DialogTrigger>
                  <DialogContent>
                     <DialogHeader><DialogTitle className="text-xl">{editId ? "Edit Data Siswa" : "Tambah Siswa Baru"}</DialogTitle></DialogHeader>
                     <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Nomor Induk (NISN)</label>
                           <Input placeholder="Ketik NISN..." value={formData.nisn} onChange={(e) => setFormData({ ...formData, nisn: e.target.value })} required />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Nama Lengkap</label>
                           <Input placeholder="Ketik nama siswa..." value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Kelas</label>
                           <Input placeholder="Contoh: X.1" value={formData.kelas} onChange={(e) => setFormData({ ...formData, kelas: e.target.value })} required />
                        </div>
                        <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Jenis Kelamin</label>
                           <select className="w-full border border-slate-200 bg-slate-50 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                              <option value="L">Laki-laki</option>
                              <option value="P">Perempuan</option>
                           </select>
                        </div>
                        <Button type="submit" className="w-full mt-2">{editId ? "Simpan Perubahan" : "Simpan Data Siswa"}</Button>
                     </form>
                  </DialogContent>
               </Dialog>
            </div>
         </div>

         <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <Table>
               <TableHeader className="bg-slate-50">
                  <TableRow>
                     <TableHead className="font-bold text-slate-700 w-32">NISN</TableHead>
                     <TableHead className="font-bold text-slate-700">Nama Siswa</TableHead>
                     <TableHead className="font-bold text-slate-700 text-center w-32">Kelas</TableHead>
                     <TableHead className="font-bold text-slate-700 text-right w-32">Tindakan</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {siswa.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                           Belum ada data siswa terdaftar. Tambahkan manual atau impor via CSV.
                        </TableCell>
                     </TableRow>
                  ) : siswa.map((s) => (
                     <TableRow key={s.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-slate-500">{s.nisn}</TableCell>
                        <TableCell>
                           <div className="font-bold text-slate-800">{s.nama}</div>
                           <div className="text-xs text-slate-400 mt-0.5">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                        </TableCell>
                        <TableCell className="text-center font-medium text-slate-600">{s.kelas}</TableCell>
                        <TableCell className="text-right">
                           <div className="flex justify-end gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => { setEditId(s.id); setFormData(s); setIsModalOpen(true); }} title="Edit"><Edit size={14} /></Button>
                              <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(s.id)} title="Hapus"><Trash2 size={14} /></Button>
                           </div>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
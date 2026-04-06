// File: frontend/src/app/(dashboard)/dashboard/master/alternatif/page.tsx
"use client";

import { useState, useEffect } from "react";
// PERBAIKAN 4: Ikon 'UserPlus' sudah dihapus dari daftar impor
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// PERBAIKAN 3: Membuat 'Cetakan Tipe Data' (Interface) khusus untuk Siswa
interface Siswa {
   id: number;
   nisn: string;
   nama: string;
   kelas: string;
   gender: string;
}

export default function AlternatifPage() {
   // Memberitahu TypeScript bahwa state ini berisi kumpulan data <Siswa[]>
   const [siswa, setSiswa] = useState<Siswa[]>([]);
   const [formData, setFormData] = useState({ nisn: "", nama: "", kelas: "", gender: "L" });
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [editId, setEditId] = useState<number | null>(null);

   const fetchSiswa = async () => {
      try {
         const res = await fetch("http://localhost:8000/api/siswa");
         const json = await res.json();
         if (json.success) setSiswa(json.data);
      } catch (error) {
         console.error("Gagal mengambil data siswa", error);
      }
   };

   // PERBAIKAN 2: Membungkus pemanggilan fetch dengan fungsi async internal 
   // agar ESLint tidak menganggapnya sebagai pembaruan sinkron yang berbahaya.
   useEffect(() => {
      const loadInitialData = async () => {
         await fetchSiswa();
      };
      loadInitialData();
   }, []);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const url = editId ? `http://localhost:8000/api/siswa/${editId}` : "http://localhost:8000/api/siswa";
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
         await fetch(`http://localhost:8000/api/siswa/${id}`, { method: "DELETE" });
         fetchSiswa();
      }
   };

   return (
      <div className="space-y-6">
         <div className="flex justify-between items-center bg-white p-6 rounded-2xl border shadow-sm">
            <div>
               <h1 className="text-2xl font-bold">Data Alternatif (Siswa)</h1>
               <p className="text-slate-500 text-sm">Daftar siswa yang akan dianalisis risikonya.</p>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
               <DialogTrigger asChild>
                  <Button onClick={() => { setEditId(null); setFormData({ nisn: "", nama: "", kelas: "", gender: "L" }); }}>
                     <Plus className="mr-2 h-4 w-4" /> Tambah Siswa
                  </Button>
               </DialogTrigger>
               <DialogContent>
                  <DialogHeader><DialogTitle>{editId ? "Edit Data Siswa" : "Tambah Siswa Baru"}</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                     <Input placeholder="NISN" value={formData.nisn} onChange={(e) => setFormData({ ...formData, nisn: e.target.value })} required />
                     <Input placeholder="Nama Lengkap" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} required />
                     <Input placeholder="Kelas (Contoh: X.1)" value={formData.kelas} onChange={(e) => setFormData({ ...formData, kelas: e.target.value })} required />
                     <select className="w-full border p-2 rounded-md" value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                     </select>
                     <Button type="submit" className="w-full">{editId ? "Simpan Perubahan" : "Simpan Data"}</Button>
                  </form>
               </DialogContent>
            </Dialog>
         </div>

         <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <Table>
               <TableHeader className="bg-slate-50">
                  <TableRow>
                     <TableHead>NISN</TableHead>
                     <TableHead>Nama Siswa</TableHead>
                     <TableHead>Kelas</TableHead>
                     <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {/* PERBAIKAN 3: Kata 'any' dihapus karena s otomatis dikenali sebagai 'Siswa' */}
                  {siswa.map((s) => (
                     <TableRow key={s.id}>
                        <TableCell className="font-mono">{s.nisn}</TableCell>
                        <TableCell className="font-medium">{s.nama} ({s.gender})</TableCell>
                        <TableCell>{s.kelas}</TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                           <Button variant="outline" size="sm" onClick={() => { setEditId(s.id); setFormData(s); setIsModalOpen(true); }}><Edit size={14} /></Button>
                           <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></Button>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
// File: frontend/src/app/(dashboard)/dashboard/master/kriteria/page.tsx

"use client";

import { useState, useEffect } from "react";
import {
   Database,
   Calculator,
   Plus,
   Pencil,
   Trash2,
   AlertCircle,
   Loader2
} from "lucide-react";
import Link from "next/link";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogTrigger,
   DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Kriteria {
   id: number;
   kode: string;
   nama: string;
   keterangan: string;
   bobot: number;
}

export default function MasterKriteriaPage() {
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const [isOpen, setIsOpen] = useState(false);
   const [editingItem, setEditingItem] = useState<Kriteria | null>(null);
   const [formData, setFormData] = useState({ kode: "", nama: "", keterangan: "" });

   const [isSubmitting, setIsSubmitting] = useState(false);

   useEffect(() => {
      fetchKriteria();
   }, []);

   const fetchKriteria = async () => {
      setIsLoading(true);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`);
         const data = await response.json();
         if (data.success) setKriteria(data.data);
      } catch (error) {
         console.error("Gagal memuat data kriteria:", error);
      } finally {
         setIsLoading(false);
      }
   };

   const handleSubmit = async () => {
      setIsSubmitting(true);

      const url = editingItem
         ? `${process.env.NEXT_PUBLIC_API_URL}/api/kriteria/${editingItem.id}`
         : `${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`;

      const method = editingItem ? "PUT" : "POST";

      try {
         const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });

         // Ambil detail pesan dari backend (jika backend mengirimkan JSON error)
         const result = await response.json();

         if (response.ok) {
            alert(`Kriteria berhasil ${editingItem ? "diperbarui" : "ditambahkan"}!`);
            setIsOpen(false);
            setEditingItem(null);
            setFormData({ kode: "", nama: "", keterangan: "" });
            await fetchKriteria();
         } else {
            // MODIFIKASI: Menampilkan pesan error spesifik dari backend
            console.error("Backend Error:", result);
            alert(`Gagal: ${result.message || "Terjadi kesalahan pada server"}`);
         }
      } catch (error) {
         console.error("Network Error:", error);
         alert("Tidak dapat terhubung ke server. Pastikan Backend sudah dijalankan.");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleDelete = async (id: number) => {
      if (confirm("Apakah Anda yakin ingin menghapus kriteria ini? Ini akan meriset perhitungan AHP Anda.")) {
         try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria/${id}`, { method: "DELETE" });
            alert("Kriteria berhasil dihapus!");
            await fetchKriteria();
         } catch (error) {
            console.error("Gagal menghapus:", error);
            alert("Gagal menghapus kriteria.");
         }
      }
   };

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-500">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight">Manajemen Kriteria</h1>
                  <p className="text-sm text-muted-foreground">Kelola parameter dan bobot dasar keputusan.</p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <Button variant="outline" asChild className="gap-2 border-primary text-primary hover:bg-primary/5">
                  <Link href="/dashboard/ahp/perbandingan-kriteria">
                     <Calculator size={16} />
                     Lihat Perhitungan AHP
                  </Link>
               </Button>

               <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                     <Button className="gap-2" onClick={() => {
                        setEditingItem(null);
                        setFormData({ kode: `C${kriteria.length + 1}`, nama: "", keterangan: "" });
                     }}>
                        <Plus size={16} />
                        Tambah Kriteria
                     </Button>
                  </DialogTrigger>
                  <DialogContent>
                     <DialogHeader>
                        <DialogTitle>{editingItem ? "Edit Kriteria" : "Tambah Kriteria Baru"}</DialogTitle>
                     </DialogHeader>
                     <div className="space-y-4 py-4">
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Kode Kriteria</label>
                           <Input
                              value={formData.kode}
                              onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                              placeholder="Contoh: C6"
                              disabled={isSubmitting}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Nama Kriteria</label>
                           <Input
                              value={formData.nama}
                              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                              placeholder="Contoh: Lingkungan Keluarga"
                              disabled={isSubmitting}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Keterangan</label>
                           <textarea
                              value={formData.keterangan}
                              onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                              placeholder="Jelaskan definisi kriteria ini..."
                              disabled={isSubmitting}
                              className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                           />
                        </div>
                     </div>
                     <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                           Batal
                        </Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                           {isSubmitting ? (
                              <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Menyimpan...
                              </>
                           ) : (
                              "Simpan Kriteria"
                           )}
                        </Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            </div>
         </div>

         <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 items-start">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-amber-800 leading-relaxed">
               <strong>Catatan:</strong> Menambah atau menghapus kriteria akan memengaruhi struktur matriks perbandingan.
               Anda diwajibkan melakukan perhitungan ulang pada menu <strong>Proses AHP</strong> setelah melakukan perubahan data di sini.
            </p>
         </div>

         <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
            <Table>
               <TableHeader className="bg-muted/50">
                  <TableRow>
                     <TableHead className="w-20 text-center">Kode</TableHead>
                     <TableHead>Kriteria</TableHead>
                     <TableHead className="text-right">Bobot (AHP)</TableHead>
                     <TableHead className="w-32 text-center">Aksi</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     <TableRow key="loading-row-kriteria">
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">Memuat data kriteria...</TableCell>
                     </TableRow>
                  ) : kriteria.map((item, index) => (
                     <TableRow key={item.id || item.kode || `fallback-${index}`} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="text-center font-bold text-primary">{item.kode}</TableCell>
                        <TableCell>
                           <div className="font-semibold">{item.nama}</div>
                           <div className="text-xs text-muted-foreground line-clamp-1">{item.keterangan}</div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                           {item.bobot ? item.bobot.toFixed(4) : "0.0000"}
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center justify-center gap-2">
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8 text-slate-500 hover:text-primary"
                                 onClick={() => {
                                    setEditingItem(item);
                                    setFormData({ kode: item.kode, nama: item.nama, keterangan: item.keterangan });
                                    setIsOpen(true);
                                 }}
                              >
                                 <Pencil size={14} />
                              </Button>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-8 w-8 text-slate-500 hover:text-destructive"
                                 onClick={() => handleDelete(item.id)}
                              >
                                 <Trash2 size={14} />
                              </Button>
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
// File: frontend/src/app/(dashboard)/dashboard/master/kriteria/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { 
   Database, 
   Calculator, 
   Plus, 
   Pencil, 
   Trash2, 
   AlertCircle,
   Loader2,
   CheckCircle2, 
   XCircle,      
   AlertTriangle 
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

   const [toast, setToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ 
      show: false, msg: '', type: 'success' 
   });

   const [deleteKode, setDeleteKode] = useState<string | null>(null);
   const [isDeleting, setIsDeleting] = useState(false);

   const showToast = useCallback((msg: string, type: 'success' | 'error') => {
      setToast({ show: true, msg, type });
      setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
   }, []);

   const fetchKriteria = useCallback(async () => {
      setIsLoading(true);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`);
         const data = await response.json();
         if (data.success) setKriteria(data.data);
      } catch (error) {
         console.error("Gagal memuat data:", error);
         showToast("Gagal memuat data dari server.", "error");
      } finally {
         setIsLoading(false);
      }
   }, [showToast]);

   useEffect(() => {
      fetchKriteria();
   }, [fetchKriteria]);

   const handleSubmit = async () => {
      setIsSubmitting(true);
      
      const url = editingItem 
         ? `${process.env.NEXT_PUBLIC_API_URL}/api/kriteria/${editingItem.kode}` 
         : `${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`;
      
      const method = editingItem ? "PUT" : "POST";

      try {
         const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
         });
         
         if (response.ok) {
            showToast(`Kriteria berhasil ${editingItem ? "diperbarui" : "ditambahkan"}!`, "success");
            setIsOpen(false);
            setEditingItem(null);
            setFormData({ kode: "", nama: "", keterangan: "" });
            
            await fetchKriteria(); 
         } else {
            showToast("Gagal menyimpan. Pastikan kode tidak duplikat.", "error");
         }
      } catch (error) {
         console.error("Terjadi kesalahan:", error);
         showToast("Terjadi kesalahan jaringan sistem.", "error");
      } finally {
         setIsSubmitting(false);
      }
   };

   const executeDelete = async () => {
      if (!deleteKode) return;
      setIsDeleting(true);

      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria/${deleteKode}`, { 
            method: "DELETE" 
         });
         
         if (response.ok) {
            showToast("Data kriteria berhasil dihapus!", "success");
            await fetchKriteria(); 
         } else {
            showToast("Gagal menghapus kriteria. Server menolak.", "error");
         }
      } catch (error) {
         console.error("Gagal menghapus:", error);
         showToast("Kesalahan jaringan saat menghapus data.", "error");
      } finally {
         setIsDeleting(false);
         setDeleteKode(null); 
      }
   };

   return (
      <div className="space-y-6 pb-10 animate-in fade-in duration-500 relative">
         
         {toast.show && (
            <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white font-medium animate-in slide-in-from-bottom-5 fade-in duration-300
               ${toast.type === 'success' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-red-600 shadow-red-600/20'}`}
            >
               {toast.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
               <span>{toast.msg}</span>
            </div>
         )}

         <Dialog open={!!deleteKode} onOpenChange={(open) => !open && setDeleteKode(null)}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader className="flex flex-col items-center text-center sm:text-center pt-6">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                     <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <DialogTitle className="text-xl font-bold">Konfirmasi Penghapusan</DialogTitle>
               </DialogHeader>
               <div className="text-center text-slate-500 py-2">
                  Apakah Anda yakin ingin menghapus kriteria <strong>{deleteKode}</strong> ini?<br/>
                  <span className="text-xs text-red-500 font-semibold mt-2 block">Tindakan ini tidak dapat dibatalkan dan akan meriset matriks AHP.</span>
               </div>
               <DialogFooter className="flex gap-2 sm:justify-center w-full mt-4">
                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDeleteKode(null)} disabled={isDeleting}>
                     Batal
                  </Button>
                  {/* PERBAIKAN: Menambahkan text-white agar tulisan kontras dengan background merah */}
                  <Button variant="destructive" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white" onClick={executeDelete} disabled={isDeleting}>
                     {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin text-white" /> Menghapus...</> : "Ya, Hapus Data"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

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
                              onChange={(e) => setFormData({...formData, kode: e.target.value})} 
                              placeholder="Contoh: C6"
                              disabled={isSubmitting || !!editingItem} 
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Nama Kriteria</label>
                           <Input 
                              value={formData.nama} 
                              onChange={(e) => setFormData({...formData, nama: e.target.value})} 
                              placeholder="Contoh: Lingkungan Keluarga"
                              disabled={isSubmitting}
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-sm font-medium">Keterangan</label>
                           <textarea 
                              value={formData.keterangan} 
                              onChange={(e) => setFormData({...formData, keterangan: e.target.value})} 
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
                     <TableRow key={item.kode || `fallback-${index}`} className="hover:bg-muted/30 transition-colors">
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
                                 className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-blue-50"
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
                                 className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                 onClick={() => setDeleteKode(item.kode)} 
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
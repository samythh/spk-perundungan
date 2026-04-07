// File: frontend/src/app/(dashboard)/dashboard/master/kriteria/page.tsx

"use client";

import { useState, useEffect } from "react";
// Ikon Plus, Edit, Trash2 dihapus karena tidak ada CRUD
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";

interface Kriteria {
   id: number;
   kode: string;
   nama: string;
   keterangan: string;
   sifat: string;
}

export default function DataKriteriaPage() {
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchKriteria = async () => {
         try {
            const response = await fetch("process.env.NEXT_PUBLIC_API_URL/api/kriteria");
            const data = await response.json();
            if (data.success) setKriteria(data.data);
         } catch (error) {
            console.error("Gagal memuat data:", error);
         } finally {
            setIsLoading(false);
         }
      };
      fetchKriteria();
   }, []);

   return (
      <div className="space-y-6">

         {/* Header Halaman (Tombol Tambah dihapus sesuai instruksi dosen) */}
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div>
               <h1 className="text-2xl font-bold text-slate-900">Data Kriteria</h1>
               <p className="text-slate-500 text-sm mt-1 italic">
                  * Kriteria bersifat tetap dan telah divalidasi untuk perhitungan AHP.
               </p>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <Table>
               <TableHeader className="bg-slate-50 border-b border-slate-100">
                  <TableRow>
                     <TableHead className="font-bold text-slate-700 w-24 text-center">Kode</TableHead>
                     <TableHead className="font-bold text-slate-700">Nama Kriteria</TableHead>
                     <TableHead className="font-bold text-slate-700 hidden md:table-cell">Deskripsi</TableHead>
                     <TableHead className="font-bold text-slate-700 text-center">Sifat</TableHead>
                     {/* Kolom Aksi dihapus */}
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {isLoading ? (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center py-10">Memuat data...</TableCell>
                     </TableRow>
                  ) : kriteria.map((item) => (
                     <TableRow key={item.id} className="hover:bg-slate-50/50">
                        <TableCell className="font-bold text-center">{item.kode}</TableCell>
                        <TableCell className="font-medium">{item.nama}</TableCell>
                        <TableCell className="text-slate-500 text-sm hidden md:table-cell">{item.keterangan}</TableCell>
                        <TableCell className="text-center">
                           <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.sifat === 'Cost'
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-green-50 text-green-600 border border-green-100'
                              }`}>
                              {item.sifat}
                           </span>
                        </TableCell>
                     </TableRow>
                  ))}
               </TableBody>
            </Table>
         </div>
      </div>
   );
}
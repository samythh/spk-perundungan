// File: frontend/src/app/(dashboard)/dashboard/master/kriteria/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Database } from "lucide-react";
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
   bobot: number;
}

const subKriteriaData = [
   { kode: "T1", nama: "Sangat Parah", eigen: 0.4162, bobot: 1.0000, color: "text-red-600 bg-red-50 border-red-200" },
   { kode: "T2", nama: "Parah", eigen: 0.2618, bobot: 0.6290, color: "text-orange-600 bg-orange-50 border-orange-200" },
   { kode: "T3", nama: "Sedang", eigen: 0.1610, bobot: 0.3868, color: "text-yellow-600 bg-yellow-50 border-yellow-200" },
   { kode: "T4", nama: "Aman", eigen: 0.0986, bobot: 0.2369, color: "text-blue-600 bg-blue-50 border-blue-200" },
   { kode: "T5", nama: "Sangat Aman", eigen: 0.0624, bobot: 0.1499, color: "text-green-600 bg-green-50 border-green-200" },
];

export default function DataKriteriaPage() {
   const [kriteria, setKriteria] = useState<Kriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchKriteria = async () => {
         try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kriteria`);
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
         {/* Header */}
         <div className="flex items-center gap-3 pb-4 border-b">
            <div className="p-2 bg-primary/10 rounded-lg">
               <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
               <h1 className="text-2xl font-bold tracking-tight">Master Data Kriteria</h1>
               <p className="text-sm text-muted-foreground">
                  Kelola parameter utama dan intensitas penilaian AHP Absolut.
               </p>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Tabel Kriteria Utama */}
            <div className="border rounded-lg bg-card">
               <div className="p-4 border-b bg-muted/30">
                  <h2 className="font-semibold text-card-foreground">1. Kriteria Utama</h2>
               </div>
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead className="w-20 text-center">Kode</TableHead>
                        <TableHead>Kriteria</TableHead>
                        <TableHead className="text-right">Bobot Global</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        <TableRow>
                           <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                              Memuat data...
                           </TableCell>
                        </TableRow>
                     ) : kriteria.map((item) => (
                        <TableRow key={item.id}>
                           <TableCell className="text-center font-medium">{item.kode}</TableCell>
                           <TableCell>
                              <div className="font-medium">{item.nama}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{item.keterangan}</div>
                           </TableCell>
                           <TableCell className="text-right font-mono">
                              {item.bobot?.toFixed(4) || "0.0000"}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>

            {/* Tabel Sub-Kriteria */}
            <div className="border rounded-lg bg-card self-start">
               <div className="p-4 border-b bg-muted/30">
                  <h2 className="font-semibold text-card-foreground">2. Intensitas Risiko (Sub-Kriteria)</h2>
               </div>
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead className="w-16 text-center">Kode</TableHead>
                        <TableHead>Skala Kondisi</TableHead>
                        <TableHead className="text-right">Nilai Eigen</TableHead>
                        <TableHead className="text-right">Bobot Ideal</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {subKriteriaData.map((sub) => (
                        <TableRow key={sub.kode}>
                           <TableCell className="text-center text-muted-foreground">{sub.kode}</TableCell>
                           <TableCell>
                              <span className={`px-2 py-1 text-[11px] font-medium border rounded-md ${sub.color}`}>
                                 {sub.nama}
                              </span>
                           </TableCell>
                           <TableCell className="text-right font-mono text-muted-foreground">
                              {sub.eigen.toFixed(4)}
                           </TableCell>
                           <TableCell className="text-right font-mono font-medium">
                              {sub.bobot.toFixed(4)}
                           </TableCell>
                        </TableRow>
                     ))}
                  </TableBody>
               </Table>
            </div>

         </div>
      </div>
   );
}
// File: frontend/src/app/(dashboard)/dashboard/master/subkriteria/page.tsx

"use client";

import { useState, useEffect } from "react";
import { Database, ArrowRight, Calculator } from "lucide-react";
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

interface SubKriteria {
   id?: number;
   kode: string;
   nama: string;
   eigen: number;
   bobot: number;
   color?: string;
}

// Data fallback (Sementara) jika API belum siap
const fallbackSubKriteria: SubKriteria[] = [
   { kode: "T1", nama: "Sangat Parah", eigen: 0.4162, bobot: 1.0000, color: "text-red-700 bg-red-50 border-red-300" },
   { kode: "T2", nama: "Parah", eigen: 0.2618, bobot: 0.6290, color: "text-orange-700 bg-orange-50 border-orange-300" },
   { kode: "T3", nama: "Sedang", eigen: 0.1610, bobot: 0.3868, color: "text-yellow-700 bg-yellow-50 border-yellow-300" },
   { kode: "T4", nama: "Aman", eigen: 0.0986, bobot: 0.2369, color: "text-blue-700 bg-blue-50 border-blue-300" },
   { kode: "T5", nama: "Sangat Aman", eigen: 0.0624, bobot: 0.1499, color: "text-green-700 bg-green-50 border-green-300" },
];

export default function MasterSubKriteriaPage() {
   const [subKriteria, setSubKriteria] = useState<SubKriteria[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      const fetchSubKriteria = async () => {
         try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subkriteria`);
            if (response.ok) {
               const data = await response.json();
               if (data.success && data.data.length > 0) {
                  // Integrasi warna UI
                  const coloredData = data.data.map((item: SubKriteria, idx: number) => ({
                     ...item,
                     color: fallbackSubKriteria[idx]?.color || "text-slate-700 bg-slate-50 border-slate-300"
                  }));
                  setSubKriteria(coloredData);
               } else {
                  setSubKriteria(fallbackSubKriteria);
               }
            } else {
               setSubKriteria(fallbackSubKriteria);
            }
         } catch (error) {
            console.error("Gagal memuat data sub-kriteria:", error);
            setSubKriteria(fallbackSubKriteria); // Fallback jika DB belum nyala
         } finally {
            setIsLoading(false);
         }
      };
      fetchSubKriteria();
   }, []);

   return (
      <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="w-6 h-6 text-primary" />
               </div>
               <div>
                  <h1 className="text-2xl font-bold tracking-tight">Data Sub-Kriteria</h1>
                  <p className="text-sm text-muted-foreground">
                     Kelola skala intensitas risiko baku (T1-T5).
                  </p>
               </div>
            </div>
            
            {/* TOMBOL PINTASAN KE PERHITUNGAN */}
            <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
               <Link href="/dashboard/ahp/perbandingan-subkriteria">
                  <Calculator className="w-4 h-4 mr-2" />
                  Lihat Perhitungan AHP
                  <ArrowRight className="w-4 h-4 ml-2" />
               </Link>
            </Button>
         </div>

         <div className="border rounded-lg bg-card flex flex-col shadow-sm">
            <div className="p-4 border-b bg-muted/30">
               <h2 className="font-semibold text-card-foreground">Daftar Intensitas Risiko</h2>
            </div>
            <div className="flex-1 overflow-x-auto">
               <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead className="w-20 text-center">Kode</TableHead>
                        <TableHead>Skala Kondisi</TableHead>
                        <TableHead className="text-right">Nilai Eigen (W<sub>i</sub>)</TableHead>
                        <TableHead className="text-right">Bobot Ideal (I<sub>i</sub>)</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading ? (
                        <TableRow key="loading-subkriteria">
                           <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                              Memuat data sub-kriteria...
                           </TableCell>
                        </TableRow>
                     ) : subKriteria.map((sub, idx) => (
                        <TableRow key={sub.id || `sub-${idx}`}>
                           <TableCell className="text-center font-bold text-slate-500">{sub.kode}</TableCell>
                           <TableCell>
                              <span className={`px-2 py-1 text-[11px] font-bold border rounded-md ${sub.color}`}>
                                 {sub.nama}
                              </span>
                           </TableCell>
                           <TableCell className="text-right font-mono text-muted-foreground">
                              {sub.eigen?.toFixed(4) || "0.0000"}
                           </TableCell>
                           <TableCell className="text-right font-mono font-bold text-blue-700">
                              {sub.bobot?.toFixed(4) || "0.0000"}
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
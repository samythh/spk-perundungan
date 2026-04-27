// File: frontend/src/components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
   // Mengambil tema saat ini dan fungsi pengubahnya dari next-themes
   const { theme, setTheme } = useTheme();

   return (
      <Button
         variant="ghost" // Menggunakan ghost agar terlihat bersih di header
         size="icon"
         className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
         // Logika Toggle: Jika tema saat ini gelap, ubah ke terang. Jika tidak, ubah ke gelap.
         onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
         title="Ganti Tema"
      >
         {/* Ikon Matahari muncul saat mode terang (siap diubah ke gelap) */}
         <Sun className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />

         {/* Ikon Bulan muncul saat mode gelap (siap diubah ke terang) */}
         <Moon className="absolute h-[1.3rem] w-[1.3rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />

         <span className="sr-only">Toggle theme</span>
      </Button>
   );
}
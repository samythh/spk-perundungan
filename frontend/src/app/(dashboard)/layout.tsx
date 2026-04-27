// File: frontend/src/app/(dashboard)/layout.tsx
import * as React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle"; // Impor komponen toggle

export default function DashboardLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <TooltipProvider delayDuration={300}>
         <SidebarProvider>
            <AppSidebar />

            <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden">

               {/* HEADER: justify-between membagi elemen ke sisi kiri dan kanan */}
               <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 shadow-sm transition-colors duration-300">

                  {/* Bagian Kiri: Tombol Menu & Judul */}
                  <div className="flex items-center gap-4">
                     <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50" />
                     <div className="flex items-center gap-3">
                        <div className="h-5 w-1.5 bg-primary rounded-full"></div>
                        <h1 className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight text-lg">
                           Panel Administrator SMAN 2 Padang
                        </h1>
                     </div>
                  </div>

                  {/* Bagian Kanan: Tombol Toggle Tema */}
                  <div className="flex items-center">
                     <ThemeToggle />
                  </div>

               </header>

               <main className="flex-1 w-full p-4 md:p-6 lg:p-8">
                  {children}
               </main>

            </div>
         </SidebarProvider>
      </TooltipProvider>
   );
}
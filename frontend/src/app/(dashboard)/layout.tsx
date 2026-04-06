// File: frontend/src/app/(dashboard)/layout.tsx

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

// MENGATASI ERROR: Mengimpor TooltipProvider dari Shadcn
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      // Membungkus seluruh aplikasi Dashboard dengan TooltipProvider
      // Hal ini mengizinkan elemen apapun di dalam Dashboard untuk memunculkan tooltip
      <TooltipProvider>
         <SidebarProvider>
            <div className="flex min-h-screen w-full bg-slate-50/50">

               <AppSidebar />

               <main className="flex-1 overflow-y-auto">
                  <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-6 sticky top-0 z-10 shadow-sm">
                     {/* Menggunakan w-px sesuai saran kerapian Tailwind sebelumnya */}
                     <div className="h-4 w-px bg-slate-200 mx-2" />
                     <h2 className="text-sm font-semibold text-slate-700">Panel Administrator SMAN 2 Padang</h2>
                  </header>

                  <div className="p-6 md:p-10">
                     {children}
                  </div>
               </main>

            </div>
         </SidebarProvider>
      </TooltipProvider>
   );
}
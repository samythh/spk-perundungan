// File: frontend/src/components/app-sidebar.tsx

"use client";



import * as React from "react";

import { usePathname } from "next/navigation";

import {

   LayoutDashboard, Database, Calculator, UserCog,

   LogOut, ChevronRight, ClipboardList

} from "lucide-react";



import {

   Sidebar, SidebarContent, SidebarFooter, SidebarHeader,

   SidebarMenu, SidebarMenuButton, SidebarMenuItem,

   SidebarMenuSub, SidebarMenuSubItem, SidebarGroup, SidebarGroupLabel,

   SidebarRail,

   SidebarTrigger,

} from "@/components/ui/sidebar";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";



// PERBAIKAN: Impor ThemeToggle telah dihapus secara permanen dari file ini



export function AppSidebar() {

   const pathname = usePathname();



   const isMasterDataActive = pathname.startsWith('/dashboard/master');

   const isAnalisisActive = pathname.startsWith('/dashboard/ahp');



   return (

      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-slate-200 dark:border-slate-800 dark:bg-slate-950">



         <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center transition-all">

            <div className="flex items-center gap-2">

               <SidebarTrigger className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100" />

               <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden overflow-hidden transition-all">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-md">

                     <Calculator size={18} />

                  </div>

                  <div className="flex flex-col whitespace-nowrap">

                     <span className="font-bold text-slate-900 dark:text-white leading-none text-sm">SPK-AHP</span>

                     <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">SMAN 2 Padang</span>

                  </div>

               </div>

            </div>

         </SidebarHeader>



         <SidebarContent className="px-2">



            {/* GROUP: DASHBOARD */}

            <SidebarGroup>

               <SidebarMenu>

                  <SidebarMenuItem>

                     <SidebarMenuButton

                        asChild

                        tooltip="Dashboard"

                        className={`hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 ${pathname === '/dashboard' ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold' : 'dark:text-slate-300'}`}

                     >

                        <a href="/dashboard">

                           <LayoutDashboard />

                           <span>Dashboard</span>

                        </a>

                     </SidebarMenuButton>

                  </SidebarMenuItem>

               </SidebarMenu>

            </SidebarGroup>



            {/* GROUP: MASTER DATA */}

            <SidebarGroup>

               <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">

                  Master Data

               </SidebarGroupLabel>

               <SidebarMenu>

                  <Collapsible className="group/collapsible" defaultOpen={isMasterDataActive}>

                     <SidebarMenuItem>

                        <CollapsibleTrigger asChild>

                           <SidebarMenuButton tooltip="Master Data" className={`hover:bg-primary/10 dark:hover:bg-primary/20 ${isMasterDataActive ? 'text-primary font-semibold' : 'dark:text-slate-300'}`}>

                              <Database />

                              <span>Data Utama</span>

                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />

                           </SidebarMenuButton>

                        </CollapsibleTrigger>

                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">

                           <SidebarMenuSub>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/master/kriteria"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/master/kriteria' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Data Kriteria

                                 </a>

                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/master/subkriteria"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/master/subkriteria' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Data Sub-Kriteria

                                 </a>

                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/master/alternatif"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/master/alternatif' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Data Alternatif

                                 </a>

                              </SidebarMenuSubItem>

                           </SidebarMenuSub>

                        </CollapsibleContent>

                     </SidebarMenuItem>

                  </Collapsible>

               </SidebarMenu>

            </SidebarGroup>



            {/* GROUP: ANALISIS / PROSES AHP */}

            <SidebarGroup>

               <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">

                  Analisis

               </SidebarGroupLabel>

               <SidebarMenu>

                  <Collapsible className="group/collapsible" defaultOpen={isAnalisisActive}>

                     <SidebarMenuItem>

                        <CollapsibleTrigger asChild>

                           <SidebarMenuButton tooltip="Proses AHP" className={`hover:bg-primary/10 dark:hover:bg-primary/20 ${isAnalisisActive ? 'text-primary font-semibold' : 'dark:text-slate-300'}`}>

                              <ClipboardList />

                              <span>Proses AHP</span>

                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />

                           </SidebarMenuButton>

                        </CollapsibleTrigger>

                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">

                           <SidebarMenuSub>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/ahp/hierarki"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/ahp/hierarki' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Struktur Hierarki

                                 </a>

                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/ahp/perbandingan-kriteria"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/ahp/perbandingan-kriteria' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Perbandingan Kriteria

                                 </a>

                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/ahp/perbandingan-subkriteria"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/ahp/perbandingan-subkriteria' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Perbandingan Sub-Kriteria

                                 </a>

                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/ahp/penilaian"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/ahp/penilaian' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Penilaian Siswa

                                 </a>

                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>

                                 <a

                                    href="/dashboard/ahp/hasil"

                                    className={`text-sm py-2 block transition-colors hover:text-primary ${pathname === '/dashboard/ahp/hasil' ? 'text-primary font-bold' : 'text-slate-600 dark:text-slate-400'}`}

                                 >

                                    Hasil Perhitungan

                                 </a>

                              </SidebarMenuSubItem>

                           </SidebarMenuSub>

                        </CollapsibleContent>

                     </SidebarMenuItem>

                  </Collapsible>

               </SidebarMenu>

            </SidebarGroup>



            {/* GROUP: ADMIN */}

            <SidebarGroup>

               <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-wider font-bold">

                  Admin

               </SidebarGroupLabel>

               <SidebarMenu>

                  <SidebarMenuItem>

                     <SidebarMenuButton

                        asChild

                        tooltip="Master User"

                        className={`hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20 ${pathname === '/dashboard/admin' ? 'bg-primary/10 dark:bg-primary/20 text-primary font-bold' : 'dark:text-slate-300'}`}

                     >

                        <a href="/dashboard/admin">

                           <UserCog />

                           <span>Master User</span>

                        </a>

                     </SidebarMenuButton>

                  </SidebarMenuItem>

               </SidebarMenu>

            </SidebarGroup>

         </SidebarContent>



         {/* FOOTER SIDEBAR: Kini hanya berisi tombol Logout */}

         <SidebarFooter className="p-4 border-t border-slate-100 dark:border-slate-800 group-data-[collapsible=icon]:p-2 flex flex-col gap-2">

            <SidebarMenuButton

               tooltip="Keluar Sistem"

               onClick={() => {

                  localStorage.clear();

                  window.location.href = "/login";

               }}

               className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 font-semibold w-full mt-1"

            >

               <LogOut />

               <span>Keluar Sistem</span>

            </SidebarMenuButton>

         </SidebarFooter>



         <SidebarRail />

      </Sidebar>

   );

}
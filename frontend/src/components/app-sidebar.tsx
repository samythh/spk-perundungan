// File: frontend/src/components/app-sidebar.tsx
"use client";

import * as React from "react";
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

export function AppSidebar() {
   return (
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-slate-200">

         <SidebarHeader className="p-4 group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:items-center transition-all">
            <div className="flex items-center gap-2">
               <SidebarTrigger className="text-slate-500 hover:text-slate-900" />
               <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden overflow-hidden transition-all">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-md">
                     <Calculator size={18} />
                  </div>
                  <div className="flex flex-col whitespace-nowrap">
                     <span className="font-bold text-slate-900 leading-none text-sm">SPK-AHP</span>
                     <span className="text-[10px] text-slate-500 mt-1">SMAN 2 Padang</span>
                  </div>
               </div>
            </div>
         </SidebarHeader>

         <SidebarContent className="px-2">
            <SidebarGroup>
               <SidebarMenu>
                  <SidebarMenuItem>
                     <SidebarMenuButton asChild tooltip="Dashboard" className="hover:bg-primary/10 hover:text-primary">
                        <a href="/dashboard">
                           <LayoutDashboard />
                           <span>Dashboard</span>
                        </a>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
               <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  Master Data
               </SidebarGroupLabel>
               <SidebarMenu>
                  <Collapsible className="group/collapsible">
                     <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                           <SidebarMenuButton tooltip="Master Data" className="hover:bg-primary/10">
                              <Database />
                              <span>Data Utama</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                           </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">
                           <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                 <a href="/dashboard/master/kriteria" className="text-sm py-2 block hover:text-primary transition-colors">Data Kriteria</a>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                 <a href="/dashboard/master/alternatif" className="text-sm py-2 block hover:text-primary transition-colors">Data Alternatif</a>
                              </SidebarMenuSubItem>
                           </SidebarMenuSub>
                        </CollapsibleContent>
                     </SidebarMenuItem>
                  </Collapsible>
               </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
               <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  Analisis
               </SidebarGroupLabel>
               <SidebarMenu>
                  <Collapsible className="group/collapsible">
                     <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                           <SidebarMenuButton tooltip="Proses AHP" className="hover:bg-primary/10">
                              <ClipboardList />
                              <span>Proses AHP</span>
                              <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                           </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-2">
                           <SidebarMenuSub>
                              <SidebarMenuSubItem>
                                 <a href="/dashboard/ahp/perbandingan" className="text-sm py-2 block hover:text-primary transition-colors">Perbandingan Kriteria</a>
                              </SidebarMenuSubItem>
                              <SidebarMenuSubItem>
                                 <a href="/dashboard/ahp/hasil" className="text-sm py-2 block hover:text-primary transition-colors">Hasil Perhitungan</a>
                              </SidebarMenuSubItem>
                           </SidebarMenuSub>
                        </CollapsibleContent>
                     </SidebarMenuItem>
                  </Collapsible>
               </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup>
               <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden text-slate-400 text-[10px] uppercase tracking-wider font-bold">
                  Admin
               </SidebarGroupLabel>
               <SidebarMenu>
                  <SidebarMenuItem>
                     {/* PERBAIKAN: Menambahkan atribut asChild dan membungkus isinya dengan tag <a> yang mengarah ke rute /dashboard/admin */}
                     <SidebarMenuButton asChild tooltip="Master User" className="hover:bg-primary/10 hover:text-primary">
                        <a href="/dashboard/admin">
                           <UserCog />
                           <span>Master User</span>
                        </a>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               </SidebarMenu>
            </SidebarGroup>
         </SidebarContent>

         <SidebarFooter className="p-4 border-t border-slate-100 group-data-[collapsible=icon]:p-2">
            <SidebarMenuButton
               tooltip="Keluar Sistem"
               onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
               }}
               className="text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold"
            >
               <LogOut />
               <span>Keluar Sistem</span>
            </SidebarMenuButton>
         </SidebarFooter>

         <SidebarRail />
      </Sidebar>
   );
}
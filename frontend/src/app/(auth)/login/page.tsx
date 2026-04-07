// File: frontend/src/app/(auth)/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// PERBAIKAN: Mengimpor ikon Eye dan EyeOff untuk tombol hide/unhide
import { Sun, Moon, ShieldCheck, Loader2, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
   const router = useRouter();

   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [errorMsg, setErrorMsg] = useState("");
   const [isLoading, setIsLoading] = useState(false);

   const [isDarkMode, setIsDarkMode] = useState(false);

   // STATE BARU: Mengontrol apakah password ditampilkan teksnya atau disembunyikan
   const [showPassword, setShowPassword] = useState(false);

   useEffect(() => {
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
         document.documentElement.classList.add('dark');
         setIsDarkMode(true);
      } else {
         document.documentElement.classList.remove('dark');
         setIsDarkMode(false);
      }
   }, []);

   const toggleTheme = () => {
      if (isDarkMode) {
         document.documentElement.classList.remove('dark');
         localStorage.theme = 'light';
         setIsDarkMode(false);
      } else {
         document.documentElement.classList.add('dark');
         localStorage.theme = 'dark';
         setIsDarkMode(true);
      }
   };

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMsg("");

      try {
         const response = await fetch("http://localhost:8000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
         });

         const data = await response.json();

         if (response.ok && data.success) {
            localStorage.setItem("token", data.data.token);
            localStorage.setItem("nama_user", data.data.nama);
            router.push("/dashboard");
         } else {
            setErrorMsg(data.message);
         }
      } catch (error) {
         console.error("Login Connection Error:", error);
         setErrorMsg("Gagal terhubung ke server. Pastikan server backend menyala.");
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="flex min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">

         <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative">

            <button
               onClick={toggleTheme}
               className="absolute top-6 right-6 lg:left-8 lg:right-auto p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm"
               title="Ganti Tema Layar"
            >
               {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="max-w-sm w-full mx-auto">

               <div className="mb-10">
                  <div className="flex items-center gap-2 mb-8">
                     <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                        <ShieldCheck className="text-primary w-6 h-6" />
                     </div>
                     <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">SPK Perundungan</span>
                  </div>

                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 tracking-tight">
                     Welcome back! 👋
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                     Silakan masukkan detail kredensial untuk masuk ke sistem SMAN 2 Padang.
                  </p>
               </div>

               <form onSubmit={handleLogin} className="space-y-5">
                  {errorMsg && (
                     <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20 text-center animate-in fade-in zoom-in duration-300">
                        {errorMsg}
                     </div>
                  )}

                  <div className="space-y-2">
                     <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                        Nama Pengguna
                     </Label>
                     <Input
                        id="username"
                        type="text"
                        placeholder="Ketik username..."
                        className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary dark:text-white rounded-xl"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider flex justify-between">
                        Kata Sandi
                     </Label>

                     {/* PERBAIKAN: Membungkus input password dengan div relative agar icon mata bisa diposisikan di dalamnya */}
                     <div className="relative">
                        <Input
                           id="password"
                           // Tipe input berubah dinamis berdasarkan state showPassword
                           type={showPassword ? "text" : "password"}
                           placeholder="••••••••"
                           // Menambahkan padding kanan (pr-10) agar teks yang diketik tidak menabrak ikon mata
                           className="h-12 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus-visible:ring-primary dark:text-white rounded-xl pr-10"
                           value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required
                        />
                        {/* Tombol toggle (mata) ditempatkan melayang (absolute) di sisi kanan input */}
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                           title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                        >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>

                  <Button
                     type="submit"
                     className="w-full text-md h-12 font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
                     disabled={isLoading}
                  >
                     {isLoading ? (
                        <>
                           <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                           Memverifikasi...
                        </>
                     ) : (
                        "Masuk ke Dashboard"
                     )}
                  </Button>
               </form>

               <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
                  <p>&copy; {new Date().getFullYear()} Sistem Pendukung Keputusan AHP.</p>
               </div>
            </div>
         </div>

         <div className="hidden lg:block lg:w-1/2 relative bg-slate-900 overflow-hidden">
            <Image
               src="/bg-login.jpeg"
               alt="Ilustrasi Lingkungan Sekolah"
               fill
               className="object-cover opacity-90 transition-transform duration-1000 hover:scale-105"
               priority
            />

            <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-900/40 to-transparent"></div>

            <div className="absolute bottom-0 left-0 p-16 w-full text-white">
               <div className="max-w-xl animate-in slide-in-from-bottom-8 duration-1000 delay-300">
                  <h2 className="text-4xl font-bold mb-4 leading-tight tracking-tight">
                     Menciptakan Ruang <br />
                     <span className="text-primary">Edukasi yang Aman.</span>
                  </h2>
                  <p className="text-slate-300 text-lg leading-relaxed">
                     Aplikasi pemetaan tingkat kerentanan siswa berbasis komputasi cerdas guna mendukung tindakan pencegahan perundungan di lingkungan sekolah.
                  </p>
               </div>
            </div>
         </div>

      </div>
   );
}
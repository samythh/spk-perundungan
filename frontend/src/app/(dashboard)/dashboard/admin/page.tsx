// File: frontend/src/app/(dashboard)/dashboard/admin/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
// PERBAIKAN: Menambahkan ikon Edit, Eye, dan EyeOff
import { Shield, UserPlus, Trash2, RefreshCw, KeyRound, AlertCircle, Edit, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface User {
   id: number;
   username: string;
   nama: string;
   role: string;
}

export default function MasterAdminPage() {
   const [users, setUsers] = useState<User[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [formData, setFormData] = useState({ username: '', password: '', nama: '', role: 'GURU_BK' });
   const [isSubmitting, setIsSubmitting] = useState(false);

   // STATE BARU: Untuk melacak mode Edit dan status Hide/Unhide Password
   const [editId, setEditId] = useState<number | null>(null);
   const [showPassword, setShowPassword] = useState(false);

   const fetchUsers = useCallback(async () => {
      setIsLoading(true);
      try {
         const res = await fetch("http://localhost:8000/api/users");
         const json = await res.json();
         if (json.success) {
            setUsers(json.data);
         }
      } catch (error) {
         console.error("Gagal menarik data pengguna:", error);
      } finally {
         setIsLoading(false);
      }
   }, []);

   useEffect(() => {
      fetchUsers();
   }, [fetchUsers]);

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // LOGIKA CERDAS: Menentukan URL dan Method berdasarkan mode (Tambah atau Edit)
      const url = editId ? `http://localhost:8000/api/users/${editId}` : "http://localhost:8000/api/users";
      const method = editId ? "PUT" : "POST";

      try {
         const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
         });
         const json = await res.json();
         if (json.success) {
            setIsAddModalOpen(false);
            setFormData({ username: '', password: '', nama: '', role: 'GURU_BK' });
            setEditId(null);
            fetchUsers();
         } else {
            alert(json.message);
         }
      } catch (error) {
         console.error("Error saat submit data pengguna:", error);
         alert("Terjadi kesalahan jaringan.");
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleDelete = async (id: number, nama: string) => {
      const isConfirmed = window.confirm(`Peringatan: Apakah akun atas nama "${nama}" ini benar-benar ingin dihapus?`);
      if (!isConfirmed) return;

      try {
         const res = await fetch(`http://localhost:8000/api/users/${id}`, { method: "DELETE" });
         const json = await res.json();
         if (json.success) {
            fetchUsers();
         } else {
            alert(json.message);
         }
      } catch (error) {
         console.error("Error saat menghapus pengguna:", error);
         alert("Gagal menghapus pengguna.");
      }
   };

   // FUNGSI BARU: Untuk memicu form modal dalam mode Edit
   const openEditModal = (user: User) => {
      setEditId(user.id);
      setFormData({
         username: user.username,
         password: '', // Kosongkan password agar admin tidak melihat hash, dan tidak wajib diisi
         nama: user.nama,
         role: user.role
      });
      setShowPassword(false);
      setIsAddModalOpen(true);
   };

   return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
            <div>
               <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="text-indigo-600" size={28} />
                  Manajemen Pengguna (Master Admin)
               </h1>
               <p className="text-slate-500 text-sm mt-1">Kelola hak akses, tambahkan staf baru, atau cabut otorisasi akun dari sistem.</p>
            </div>
            <Button
               onClick={() => {
                  setEditId(null);
                  setFormData({ username: '', password: '', nama: '', role: 'GURU_BK' });
                  setShowPassword(false);
                  setIsAddModalOpen(true);
               }}
               className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 shadow-md"
            >
               <UserPlus size={16} /> Terbitkan Akun Baru
            </Button>
         </div>

         <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100 flex gap-3 text-sm text-indigo-800 shadow-sm">
            <AlertCircle className="shrink-0 mt-0.5 text-indigo-600" size={18} />
            <div>
               <p className="font-bold mb-1">Pusat Kendali Keamanan</p>
               <p className="text-indigo-700/80 leading-relaxed">
                  Halaman ini terisolasi dan hanya dapat dioperasikan oleh akun dengan level <strong>ADMIN</strong>. Password yang didaftarkan akan secara otomatis dienkripsi ke dalam bentuk <em>Hash</em> untuk memastikan kerahasiaan data sesuai standar operasional sistem.
               </p>
            </div>
         </div>

         <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
               <KeyRound className="text-slate-500" size={18} />
               <h2 className="text-base font-bold text-slate-800">Daftar Akun Terdaftar</h2>
            </div>

            {isLoading ? (
               <div className="flex justify-center items-center py-16 text-slate-500">
                  <RefreshCw className="animate-spin mr-2" size={24} /> Memuat data pengguna...
               </div>
            ) : (
               <div className="overflow-x-auto p-2">
                  <table className="w-full text-sm text-left">
                     <thead>
                        <tr className="border-b border-slate-200 text-slate-500">
                           <th className="py-3 px-4 font-bold w-12 text-center text-xs">ID</th>
                           <th className="py-3 px-4 font-bold text-xs">Nama Lengkap</th>
                           <th className="py-3 px-4 font-bold text-xs">Username</th>
                           <th className="py-3 px-4 font-bold text-center text-xs">Level Otorisasi</th>
                           <th className="py-3 px-4 font-bold text-center text-xs w-32">Tindakan</th>
                        </tr>
                     </thead>
                     <tbody>
                        {users.length === 0 ? (
                           <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-xs">Belum ada pengguna.</td></tr>
                        ) : users.map((u) => (
                           <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0 transition-colors">
                              <td className="py-3 px-4 text-center font-mono text-slate-400 text-xs">{u.id}</td>
                              <td className="py-3 px-4 font-bold text-slate-800 text-[13px]">{u.nama}</td>
                              <td className="py-3 px-4 text-slate-600 text-[13px] font-mono">{u.username}</td>
                              <td className="py-3 px-4 text-center">
                                 <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-extrabold tracking-wider ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    }`}>
                                    {u.role.replace('_', ' ')}
                                 </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                 {/* Tombol Edit dan Hapus disejajarkan menggunakan flex */}
                                 <div className="flex justify-center gap-2">
                                    <button
                                       onClick={() => openEditModal(u)}
                                       className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                                       title="Edit Akun"
                                    >
                                       <Edit size={16} />
                                    </button>
                                    {u.role !== 'ADMIN' && (
                                       <button
                                          onClick={() => handleDelete(u.id, u.nama)}
                                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                          title="Hapus Akun"
                                       >
                                          <Trash2 size={16} />
                                       </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}
         </div>

         <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                     {editId ? <Edit className="text-indigo-600" size={24} /> : <UserPlus className="text-indigo-600" size={24} />}
                     {editId ? "Edit Akun Pengguna" : "Terbitkan Akun Baru"}
                  </DialogTitle>
                  <DialogDescription>
                     {editId ? "Perbarui informasi staf di bawah ini." : "Lengkapi formulir di bawah untuk memberikan akses sistem kepada staf baru."}
                  </DialogDescription>
               </DialogHeader>

               <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap Pemilik Akun</label>
                     <input
                        type="text"
                        name="nama"
                        required
                        className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm"
                        placeholder="Misal: Budi Santoso, S.Pd"
                        value={formData.nama}
                        onChange={handleInputChange}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1">Username (Untuk Login)</label>
                     <input
                        type="text"
                        name="username"
                        required
                        className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm font-mono"
                        placeholder="Misal: budibk"
                        value={formData.username}
                        onChange={handleInputChange}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1 flex justify-between">
                        <span>Password Akses</span>
                        {editId && <span className="text-[10px] text-slate-400 font-normal">*Kosongkan jika tidak diubah</span>}
                     </label>
                     {/* INPUT PASSWORD DENGAN FITUR HIDE/UNHIDE */}
                     <div className="relative">
                        <input
                           type={showPassword ? "text" : "password"}
                           name="password"
                           // Hanya wajib diisi jika membuat akun baru (editId = null)
                           required={!editId}
                           className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm font-mono pr-10"
                           placeholder={editId ? "Ketik sandi baru untuk mereset..." : "Minimal 6 karakter"}
                           value={formData.password}
                           onChange={handleInputChange}
                        />
                        <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                           title={showPassword ? "Sembunyikan Sandi" : "Tampilkan Sandi"}
                        >
                           {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-700 mb-1">Level Otorisasi</label>
                     <select
                        name="role"
                        className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none text-sm bg-white"
                        value={formData.role}
                        onChange={handleInputChange}
                     >
                        <option value="GURU_BK">GURU BK (Akses Standar)</option>
                        <option value="KEPALA_SEKOLAH">KEPALA SEKOLAH (Akses Pemantauan)</option>
                        <option value="ADMIN">MASTER ADMIN (Akses Penuh)</option>
                     </select>
                  </div>

                  <div className="pt-4 flex justify-end gap-2 border-t mt-6">
                     <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                     <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={isSubmitting}>
                        {isSubmitting ? "Menyimpan..." : (editId ? "Simpan Perubahan" : "Simpan & Terbitkan")}
                     </Button>
                  </div>
               </form>
            </DialogContent>
         </Dialog>

      </div>
   );
}
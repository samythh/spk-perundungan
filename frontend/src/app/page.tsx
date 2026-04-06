// File: frontend/src/app/page.tsx

import { Button } from "@/components/ui/button";

// MENGATASI ERROR: Membuat 'interface' TypeScript
// Ini memberi tahu sistem bentuk persis dari data kriteria dari MySQL
interface KriteriaItem {
  id: number;
  kode: string;
  nama: string;
  keterangan: string;
  sifat: string;
}

async function getKriteria() {
  const res = await fetch('http://localhost:8000/api/kriteria', { cache: 'no-store' });
  
  if (!res.ok) {
    throw new Error('Gagal mengambil data kriteria dari backend');
  }
  
  return res.json();
}

export default async function Home() {
  const response = await getKriteria();
  
  // Mengarahkan response.data ke array dari interface KriteriaItem
  const kriteriaList: KriteriaItem[] = response.data;

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-10 font-sans">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-zinc-200">
        
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">
          Sistem Pendukung Keputusan AHP
        </h1>
        <p className="text-zinc-500 mb-8">
          Identifikasi Tingkat Risiko Perundungan Siswa
        </p>

        <div className="flex flex-wrap gap-4 mb-10 pb-10 border-b border-zinc-100">
          <Button variant="default">Mulai Penilaian AHP</Button>
          <Button variant="outline">Kelola Data Siswa</Button>
          <Button variant="secondary">Pengaturan Kriteria</Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-zinc-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Status Koneksi: Terhubung ke Database MySQL
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MENGATASI ERROR: Mengganti 'any' dengan tipe data KriteriaItem yang sah */}
            {kriteriaList.map((kriteria: KriteriaItem) => (
              <div 
                key={kriteria.kode} 
                className="p-5 border border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-zinc-900">{kriteria.kode}</span>
                  <span className="font-semibold text-zinc-700">{kriteria.nama}</span>
                </div>
                <p className="text-sm text-zinc-500 mb-4">{kriteria.keterangan}</p>
                <span className="text-xs font-medium bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md">
                  Sifat: {kriteria.sifat}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
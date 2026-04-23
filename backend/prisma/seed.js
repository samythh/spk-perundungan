// File: backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
   console.log('Memulai proses seeding (menyuntikkan data)... 🌱');

   // 1. Bersihkan data lama (jika ada) agar tidak terjadi duplikasi
   // Urutan penghapusan harus dari tabel yang memiliki relasi (Penilaian) ke tabel utama
   await prisma.penilaian.deleteMany();
   await prisma.subKriteria.deleteMany();
   await prisma.kriteria.deleteMany();

   // 2. Suntikkan Data KRITERIA UTAMA (Silakan sesuaikan bobot dan nama jika berbeda)
   console.log('Menyuntikkan data Kriteria Utama (C1-C5)...');
   await prisma.kriteria.createMany({
      data: [
         { kode: 'C1', nama: 'Sosiometri', keterangan: 'Hubungan sosial dan pertemanan antar siswa di sekolah', bobot: 0.4162 },
         { kode: 'C2', nama: 'Media Sosial', keterangan: 'Aktivitas dan jejak digital siswa di media sosial', bobot: 0.2618 },
         { kode: 'C3', nama: 'Keaktifan Ekskul', keterangan: 'Partisipasi dalam kegiatan ekstrakurikuler', bobot: 0.1610 },
         { kode: 'C4', nama: 'Laporan Guru', keterangan: 'Catatan perilaku dari wali kelas atau guru BK', bobot: 0.0986 },
         { kode: 'C5', nama: 'Kehadiran', keterangan: 'Tingkat absensi dan kedisiplinan siswa', bobot: 0.0624 },
      ]
   });

   // 3. Suntikkan Data SUB-KRITERIA (Tingkat Risiko T1-T5 berdasarkan AHP Absolut)
   console.log('Menyuntikkan data Sub-Kriteria (T1-T5)...');
   await prisma.subKriteria.createMany({
      data: [
         { kode: 'T1', nama_sub: 'Sangat Parah', bobot_ideal: 1.0000, keterangan: 'Risiko perundungan sangat tinggi / kondisi sangat buruk.' },
         { kode: 'T2', nama_sub: 'Parah', bobot_ideal: 0.6290, keterangan: 'Risiko perundungan tinggi / kondisi memburuk.' },
         { kode: 'T3', nama_sub: 'Sedang', bobot_ideal: 0.3868, keterangan: 'Kondisi rata-rata / risiko menengah.' },
         { kode: 'T4', nama_sub: 'Aman', bobot_ideal: 0.2369, keterangan: 'Risiko rendah / kondisi cenderung aman.' },
         { kode: 'T5', nama_sub: 'Sangat Aman', bobot_ideal: 0.1499, keterangan: 'Tidak ada indikasi risiko sama sekali.' },
      ]
   });

   console.log('✅ Proses Seeding Selesai! Data berhasil masuk ke Supabase.');
}

// Menjalankan fungsi utama dan menutup koneksi database setelah selesai
main()
   .catch((e) => {
      console.error('Terjadi kesalahan saat seeding:', e);
      process.exit(1);
   })
   .finally(async () => {
      await prisma.$disconnect();
   });
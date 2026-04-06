// File: backend/prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
   console.log('Memperbarui kriteria untuk mendeteksi KORBAN perundungan...');

   // PERBAIKAN: Seluruh kriteria kini disesuaikan dengan ciri-ciri KORBAN bullying.
   const kriteriaData = [
      {
         kode: 'C1',
         nama: 'Indikasi Menjadi Korban',
         keterangan: 'Laporan bahwa siswa sering diejek, dikucilkan, atau diganggu oleh teman sebaya.',
         sifat: 'Benefit' // Semakin tinggi skornya = Semakin rentan jadi korban (Benefit)
      },
      {
         kode: 'C2',
         nama: 'Isolasi Sosial & Murung',
         keterangan: 'Tingkat penarikan diri dari pergaulan dan sering terlihat menyendiri saat istirahat.',
         sifat: 'Benefit' // Semakin menyendiri = Semakin rentan jadi korban (Benefit)
      },
      {
         kode: 'C3',
         nama: 'Penurunan Kehadiran',
         keterangan: 'Sering absen membolos, atau beralasan sakit karena takut datang ke sekolah.',
         sifat: 'Benefit' // Semakin sering absen = Semakin rentan jadi korban (Benefit)
      },
      {
         kode: 'C4',
         nama: 'Penurunan Prestasi',
         keterangan: 'Penurunan nilai akademis secara drastis akibat gangguan konsentrasi/psikologis.',
         sifat: 'Benefit' // Semakin turun nilainya = Semakin rentan jadi korban (Benefit)
      },
      {
         // CATATAN MATEMATIS: Diubah menjadi Cost. (Penjelasan ada di bawah)
         kode: 'C5',
         nama: 'Keaktifan Ekstrakurikuler',
         keterangan: 'Keterlibatan dalam kegiatan positif sekolah (OSIS, Rohis, dll).',
         sifat: 'Cost'
      },
   ];

   for (const kriteria of kriteriaData) {
      await prisma.kriteria.upsert({
         where: { kode: kriteria.kode },
         update: {
            nama: kriteria.nama,
            keterangan: kriteria.keterangan,
            sifat: kriteria.sifat
         },
         create: kriteria,
      });
   }

   // Akun Admin Default (Tetap ada agar Anda tidak ter-logout)
   const hashedPassword = await bcrypt.hash('admin123', 10);
   await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
         username: 'admin',
         password: hashedPassword,
         role: 'ADMIN',
         nama: 'Administrator SPK',
      },
   });

   console.log('Update kriteria KORBAN berhasil ditanamkan!');
}

main()
   .catch((e) => { console.error(e); process.exit(1); })
   .finally(() => prisma.$disconnect());
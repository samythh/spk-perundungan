// File: backend/src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Endpoint GET: Mengambil statistik untuk Dashboard
router.get('/stats', async (req, res) => {
   try {
      // 1. Menghitung jumlah kriteria asli yang ada di tabel Kriteria MySQL
      const totalKriteria = await prisma.kriteria.count();

      // 2. Menghitung jumlah admin/user
      const totalUser = await prisma.user.count();

      // (Catatan: Karena kita belum membuat form input Siswa dan Proses AHP,
      // kita set nilainya ke 0 terlebih dahulu agar jujur sesuai isi database saat ini)
      const totalSiswa = 0; // Nanti akan diganti menjadi: await prisma.siswa.count()
      const totalAnalisis = 0;

      // Mengirimkan hasil hitungan ke frontend
      res.status(200).json({
         success: true,
         data: {
            kriteria: totalKriteria,
            siswa: totalSiswa,
            analisis: totalAnalisis,
            user: totalUser
         }
      });
   } catch (error) {
      console.error('Error mengambil statistik dashboard:', error);
      res.status(500).json({ success: false, message: 'Gagal mengambil data statistik' });
   }
});

module.exports = router;
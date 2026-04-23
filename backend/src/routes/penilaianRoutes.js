// File: backend/src/routes/penilaianRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Endpoint 1: Mengambil data Siswa, Kriteria Utama, dan Opsi Tingkat Risiko (T1-T5)
router.get('/data', async (req, res) => {
   try {
      // 1. Ambil semua siswa
      const siswa = await prisma.siswa.findMany();

      // 2. Ambil kriteria utama (C1-C5)
      const kriteria = await prisma.kriteria.findMany({ orderBy: { kode: 'asc' } });

      // 3. AMBIL DATA SUB-KRITERIA (PENTING: Ini untuk dropdown di Frontend)
      const subKriteria = await prisma.subKriteria.findMany({ orderBy: { kode: 'asc' } });

      // 4. Ambil data penilaian yang sudah ada (menggunakan tabel penilaian yang baru)
      const penilaian = await prisma.penilaian.findMany();

      res.json({
         success: true,
         data: { siswa, kriteria, subKriteria, penilaian }
      });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

// Endpoint 2: Menyimpan pilihan Tingkat Risiko (T1-T5) untuk setiap kriteria
router.post('/simpan', async (req, res) => {
   try {
      const { scores } = req.body;
      // Format scores yang diharapkan: [{ siswa_id: 1, kriteria_kode: "C1", subkriteria_kode: "T2" }, ...]

      // Menggunakan Transaction agar data konsisten
      await prisma.$transaction(
         scores.map((n) =>
            prisma.penilaian.upsert({
               where: {
                  // Menggunakan unique constraint yang kita buat di schema.prisma
                  siswa_id_kriteria_kode: {
                     siswa_id: parseInt(n.siswa_id),
                     kriteria_kode: n.kriteria_kode
                  }
               },
               // Jika sudah ada, update pilihannya (misal dari T3 jadi T1)
               update: { subkriteria_kode: n.subkriteria_kode },
               // Jika belum ada, buat record penilaian baru
               create: {
                  siswa_id: parseInt(n.siswa_id),
                  kriteria_kode: n.kriteria_kode,
                  subkriteria_kode: n.subkriteria_kode
               }
            })
         )
      );

      res.json({ success: true, message: "Penilaian tingkat risiko berhasil direkam!" });
   } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Gagal menyimpan: " + error.message });
   }
});

module.exports = router;
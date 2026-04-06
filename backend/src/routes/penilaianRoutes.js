// File: backend/src/routes/penilaianRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Endpoint 1: Mengambil semua data yang dibutuhkan Frontend sekaligus
router.get('/data', async (req, res) => {
   try {
      const siswa = await prisma.siswa.findMany();
      // Mengambil kriteria beserta bobot AHP-nya
      const kriteria = await prisma.kriteria.findMany({ orderBy: { kode: 'asc' } });
      const nilai = await prisma.nilai.findMany();

      res.json({ success: true, data: { siswa, kriteria, nilai } });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

// Endpoint 2: Menyimpan skor yang diinput oleh Guru (Mode Batch/Massal)
router.post('/simpan', async (req, res) => {
   try {
      const { scores } = req.body;

      // Menggunakan Transaction agar jika 1 gagal, batal semua (menjaga integritas data)
      await prisma.$transaction(
         scores.map((n) =>
            prisma.nilai.upsert({
               where: {
                  siswaId_kriteriaId: { siswaId: n.siswaId, kriteriaId: n.kriteriaId }
               },
               update: { skor: n.skor },
               create: { siswaId: n.siswaId, kriteriaId: n.kriteriaId, skor: n.skor }
            })
         )
      );

      res.json({ success: true, message: "Nilai siswa berhasil direkam ke database!" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

module.exports = router;
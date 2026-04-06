// File: backend/src/routes/kriteriaRoutes.js

const express = require('express');
const router = express.Router();
// Mengimpor koneksi database yang sudah kita buat sebelumnya
const prisma = require('../config/database');

// Endpoint GET: Mengambil semua data kriteria dari database
router.get('/', async (req, res) => {
   try {
      // Meminta Prisma mencari seluruh data di tabel kriteria
      const kriteria = await prisma.kriteria.findMany();

      // Mengirimkan respons sukses (status 200) beserta datanya dalam format JSON
      res.status(200).json({
         success: true,
         message: 'Data kriteria berhasil diambil',
         data: kriteria,
      });
   } catch (error) {
      // Menangkap error jika terjadi kegagalan sistem atau database
      console.error('Error fetching kriteria:', error);
      res.status(500).json({
         success: false,
         message: 'Terjadi kesalahan pada server',
      });
   }
});

module.exports = router;
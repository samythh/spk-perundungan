// File: backend/src/routes/subkriteriaRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Endpoint: GET /api/subkriteria
router.get('/', async (req, res) => {
   try {
      // Mengambil seluruh data subkriteria dan diurutkan berdasarkan kode (T1 ke T5)
      const dataSub = await prisma.subKriteria.findMany({ // Sesuaikan dengan nama model Prisma Anda
         orderBy: { kode: 'asc' }
      });

      res.status(200).json({
         success: true,
         message: 'Data Sub-Kriteria berhasil dimuat',
         data: dataSub
      });
   } catch (error) {
      console.error('Error fetching subkriteria:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memuat data.' });
   }
});

module.exports = router;
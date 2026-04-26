// File: backend/src/routes/subkriteriaRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Endpoint: GET /api/subkriteria
router.get('/', async (req, res) => {
   try {
      const dataSub = await prisma.subKriteria.findMany({
         orderBy: { kode: 'asc' }
      });

      // PERBAIKAN: Menerjemahkan (Mapping) nama kolom dari Database ke Frontend
      const formattedData = dataSub.map(item => ({
         kode: item.kode,
         nama: item.nama_sub,         // DB (nama_sub) diterjemahkan menjadi (nama)
         eigen: item.eigen || 0,      // Memanggil kolom eigen baru
         bobot: item.bobot_ideal || 0 // DB (bobot_ideal) diterjemahkan menjadi (bobot)
      }));

      res.status(200).json({
         success: true,
         message: 'Data Sub-Kriteria berhasil dimuat',
         data: formattedData // Mengirimkan data yang sudah diterjemahkan
      });
   } catch (error) {
      console.error('Error fetching subkriteria:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memuat data.' });
   }
});

module.exports = router;
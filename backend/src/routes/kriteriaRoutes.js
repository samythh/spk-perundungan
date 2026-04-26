// File: backend/src/routes/kriteriaRoutes.js

const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// ==========================================
// 1. READ: Mengambil semua data kriteria (GET)
// ==========================================
router.get('/', async (req, res) => {
   try {
      // PERBAIKAN: Mengurutkan berdasarkan 'kode' (bukan 'id')
      const kriteria = await prisma.kriteria.findMany({
         orderBy: { kode: 'asc' }
      });

      res.status(200).json({
         success: true,
         message: 'Data kriteria berhasil diambil',
         data: kriteria,
      });
   } catch (error) {
      console.error('Error fetching kriteria:', error);
      res.status(500).json({
         success: false,
         message: 'Terjadi kesalahan pada server saat mengambil data',
      });
   }
});

// ==========================================
// 2. CREATE: Menambah kriteria baru (POST)
// ==========================================
router.post('/', async (req, res) => {
   try {
      const { kode, nama, keterangan } = req.body;

      const newKriteria = await prisma.kriteria.create({
         data: {
            kode: kode,
            nama: nama,
            keterangan: keterangan,
            bobot: 0
         }
      });

      res.status(201).json({
         success: true,
         message: 'Kriteria baru berhasil ditambahkan',
         data: newKriteria,
      });
   } catch (error) {
      console.error('Error creating kriteria:', error);
      res.status(500).json({
         success: false,
         message: 'Gagal menyimpan data kriteria baru',
      });
   }
});

// ==========================================
// 3. UPDATE: Mengedit data kriteria (PUT)
// ==========================================
// PERBAIKAN: Menggunakan ':kode' sebagai parameter URL, bukan ':id'
router.put('/:kode', async (req, res) => {
   try {
      const kriteriaKode = req.params.kode;
      const { nama, keterangan } = req.body;

      // Memperbarui data berdasarkan 'kode'
      const updatedKriteria = await prisma.kriteria.update({
         where: { kode: kriteriaKode },
         data: {
            nama: nama,
            keterangan: keterangan,
            // Catatan: Biasanya 'kode' (Primary Key) tidak diizinkan untuk diubah
         }
      });

      res.status(200).json({
         success: true,
         message: 'Kriteria berhasil diperbarui',
         data: updatedKriteria,
      });
   } catch (error) {
      console.error('Error updating kriteria:', error);
      res.status(500).json({
         success: false,
         message: 'Gagal memperbarui data kriteria',
      });
   }
});

// ==========================================
// 4. DELETE: Menghapus data kriteria (DELETE)
// ==========================================
// PERBAIKAN: Menggunakan ':kode' sebagai parameter URL
router.delete('/:kode', async (req, res) => {
   try {
      const kriteriaKode = req.params.kode;

      await prisma.kriteria.delete({
         where: { kode: kriteriaKode }
      });

      res.status(200).json({
         success: true,
         message: 'Kriteria berhasil dihapus',
      });
   } catch (error) {
      console.error('Error deleting kriteria:', error);
      res.status(500).json({
         success: false,
         message: 'Gagal menghapus kriteria',
      });
   }
});

module.exports = router;
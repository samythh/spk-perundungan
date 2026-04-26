// File: backend/src/routes/kriteriaRoutes.js

const express = require('express');
const router = express.Router();
// Mengimpor koneksi database (Prisma)
const prisma = require('../config/database');

// ==========================================
// 1. READ: Mengambil semua data kriteria (GET)
// ==========================================
router.get('/', async (req, res) => {
   try {
      const kriteria = await prisma.kriteria.findMany({
         orderBy: { id: 'asc' } // Mengurutkan data berdasarkan ID agar rapi
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
      // Menangkap data yang dikirim dari form frontend
      const { kode, nama, keterangan } = req.body;

      // Memerintahkan Prisma untuk menyimpan data baru ke tabel kriteria
      const newKriteria = await prisma.kriteria.create({
         data: {
            kode: kode,
            nama: nama,
            keterangan: keterangan,
            // Nilai bobot biasanya dikosongkan (0) dulu sampai AHP dihitung ulang
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
router.put('/:id', async (req, res) => {
   try {
      // Menangkap ID dari URL (misal: /api/kriteria/5)
      const kriteriaId = parseInt(req.params.id);
      const { kode, nama, keterangan } = req.body;

      // Memerintahkan Prisma untuk memperbarui data berdasarkan ID
      const updatedKriteria = await prisma.kriteria.update({
         where: { id: kriteriaId },
         data: {
            kode: kode,
            nama: nama,
            keterangan: keterangan,
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
router.delete('/:id', async (req, res) => {
   try {
      const kriteriaId = parseInt(req.params.id);

      // Memerintahkan Prisma untuk menghapus baris data
      await prisma.kriteria.delete({
         where: { id: kriteriaId }
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
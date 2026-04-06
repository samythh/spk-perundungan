// File: backend/src/routes/siswaRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// 1. Ambil Semua Data Siswa
router.get('/', async (req, res) => {
   const data = await prisma.siswa.findMany({ orderBy: { id: 'desc' } });
   res.json({ success: true, data });
});

// 2. Tambah Siswa Baru
router.post('/', async (req, res) => {
   try {
      const newSiswa = await prisma.siswa.create({ data: req.body });
      res.json({ success: true, data: newSiswa });
   } catch (error) {
      res.status(400).json({ success: false, message: "Gagal menambah data. NISN mungkin duplikat." });
   }
});

// 3. Update Data Siswa
router.put('/:id', async (req, res) => {
   const { id } = req.params;
   const updated = await prisma.siswa.update({
      where: { id: parseInt(id) },
      data: req.body
   });
   res.json({ success: true, data: updated });
});

// 4. Hapus Siswa
router.delete('/:id', async (req, res) => {
   await prisma.siswa.delete({ where: { id: parseInt(req.params.id) } });
   res.json({ success: true, message: "Data dihapus" });
});

module.exports = router;
// File: backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

// 1. Mengambil daftar semua pengguna (tanpa menampilkan password)
router.get('/', async (req, res) => {
   try {
      const users = await prisma.user.findMany({
         select: { id: true, username: true, nama: true, role: true }
      });
      res.json({ success: true, data: users });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

// 2. Menambahkan pengguna baru dengan enkripsi password
router.post('/', async (req, res) => {
   const { username, password, nama, role } = req.body;
   try {
      // Mengacak password menggunakan bcrypt sebelum disimpan
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.create({
         data: {
            username,
            password: hashedPassword,
            nama,
            role: role || 'GURU_BK'
         }
      });
      res.json({ success: true, message: 'Akun pengguna berhasil diterbitkan!' });
   } catch (error) {
      // Error biasanya terjadi jika username sudah dipakai (karena @unique di Prisma)
      res.status(500).json({ success: false, message: "Gagal. Username mungkin sudah digunakan." });
   }
});

// 3. Menghapus akun pengguna
router.delete('/:id', async (req, res) => {
   try {
      await prisma.user.delete({
         where: { id: parseInt(req.params.id) }
      });
      res.json({ success: true, message: 'Akun berhasil dihapus secara permanen.' });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

module.exports = router;
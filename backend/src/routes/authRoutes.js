// File: backend/src/routes/authRoutes.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// Endpoint POST: Menerima data login dari frontend
router.post('/login', async (req, res) => {
   try {
      // 1. Mengambil username dan password yang diketik oleh pengguna
      const { username, password } = req.body;

      // 2. Mencari pengguna di database berdasarkan username
      const user = await prisma.user.findUnique({
         where: { username: username },
      });

      // Jika pengguna tidak ditemukan di tabel
      if (!user) {
         return res.status(401).json({ success: false, message: 'Username tidak ditemukan!' });
      }

      // 3. Mencocokkan password yang diketik dengan password acak (hash) di database
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // Jika password salah
      if (!isPasswordValid) {
         return res.status(401).json({ success: false, message: 'Password salah!' });
      }

      // 4. Jika sukses, buat Tiket JWT (berisi id, username, dan hak akses)
      // Tiket ini akan kedaluwarsa dalam 1 hari (24 jam)
      const token = jwt.sign(
         { id: user.id, username: user.username, role: user.role },
         process.env.JWT_SECRET,
         { expiresIn: '1d' }
      );

      // 5. Kirim tiket dan data pengguna ke frontend
      res.status(200).json({
         success: true,
         message: 'Login berhasil!',
         data: {
            id: user.id,
            username: user.username,
            nama: user.nama,
            role: user.role,
            token: token, // Tiket rahasianya
         },
      });

   } catch (error) {
      console.error('Error saat login:', error);
      res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server' });
   }
});

module.exports = router;
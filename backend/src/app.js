// File: backend/src/app.js

const express = require('express');
const cors = require('cors');

const app = express();

// Middleware dasar
app.use(cors());
app.use(express.json());

// ==========================================
// 1. MENGIMPOR SEMUA FILE RUTE (CONTROLLERS)
// ==========================================
const kriteriaRoutes = require('./routes/kriteriaRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const siswaRoutes = require('./routes/siswaRoutes');
const ahpRoutes = require('./routes/ahpRoutes');

// MENGATASI MASALAH: Mengimpor rute penilaian yang baru kita buat
const penilaianRoutes = require('./routes/penilaianRoutes');
const userRoutes = require('./routes/userRoutes');

// ==========================================
// 2. MENDAFTARKAN URL (ENDPOINTS)
// ==========================================
app.use('/api/kriteria', kriteriaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/ahp', ahpRoutes);
app.use('/api/users', userRoutes);

// MENGATASI MASALAH: Membuka pintu akses untuk URL /api/penilaian
app.use('/api/penilaian', penilaianRoutes);

// Rute dasar untuk mengecek apakah server hidup
app.get('/', (req, res) => {
   res.send('Server SPK Perundungan SMAN 2 Padang berjalan dengan baik!');
});

// ==========================================
// 3. MENYALAKAN SERVER
// ==========================================
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
   console.log(`Server berhasil berjalan di http://localhost:${PORT}`);
});
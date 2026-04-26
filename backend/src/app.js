// File: backend/src/app.js

const express = require('express');
const cors = require('cors');

const app = express();

// ==========================================
// PENGATURAN KEAMANAN (CORS) YANG DIPERBARUI
// ==========================================
// Mendaftarkan alamat frontend secara eksplisit agar tidak diblokir peramban
app.use(cors({
   origin: [
      'http://localhost:3000', // Akses saat Anda membangun aplikasi di laptop
      'https://spk-sman2-padang.vercel.app' // Akses saat aplikasi sudah online di Vercel
   ],
   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Mengizinkan semua tindakan CRUD
   credentials: true // Mengizinkan pengiriman token atau data sesi
}));

app.use(express.json());

// ==========================================
// 1. MENGIMPOR SEMUA FILE RUTE (CONTROLLERS)
// ==========================================
const kriteriaRoutes = require('./routes/kriteriaRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const siswaRoutes = require('./routes/siswaRoutes');
const ahpRoutes = require('./routes/ahpRoutes');
const penilaianRoutes = require('./routes/penilaianRoutes');
const userRoutes = require('./routes/userRoutes');
const subkriteriaRoutes = require('./routes/subkriteriaRoutes');

// ==========================================
// 2. MENDAFTARKAN URL (ENDPOINTS)
// ==========================================
app.use('/api/kriteria', kriteriaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/ahp', ahpRoutes);
app.use('/api/users', userRoutes);
app.use('/api/penilaian', penilaianRoutes);
app.use('/api/subkriteria', subkriteriaRoutes);

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
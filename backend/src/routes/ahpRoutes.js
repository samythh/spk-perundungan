// File: backend/src/routes/ahpRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Konstanta Random Index (RI) berdasarkan ketetapan Thomas L. Saaty
// Index ke-5 adalah 1.12 (karena kita punya 5 kriteria)
const RI = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45 };

router.post('/hitung-kriteria', async (req, res) => {
   try {
      const { matrix } = req.body;

      // Mengurutkan kunci kriteria (C1, C2, C3, C4, C5)
      const keys = Object.keys(matrix).sort();
      const n = keys.length;

      if (n === 0) return res.status(400).json({ success: false, message: "Matriks kosong" });

      // 1. Menghitung Jumlah per Kolom
      const colSums = {};
      keys.forEach(k => colSums[k] = 0);
      keys.forEach(baris => {
         keys.forEach(kolom => {
            colSums[kolom] += matrix[baris][kolom];
         });
      });

      // 2. Normalisasi Matriks & Menghitung Bobot Prioritas (Eigen Vector)
      const bobot = {};
      keys.forEach(baris => {
         let rowSum = 0;
         keys.forEach(kolom => {
            // Membagi nilai sel dengan jumlah kolomnya
            const normalizedValue = matrix[baris][kolom] / colSums[kolom];
            rowSum += normalizedValue;
         });
         // Mendapatkan rata-rata baris
         bobot[baris] = rowSum / n;
      });

      // 3. Menghitung Lambda Max (Nilai Eigen Maksimum)
      let lambdaMax = 0;
      keys.forEach(baris => {
         let ax = 0; // Hasil kali matriks awal dengan vektor bobot
         keys.forEach(kolom => {
            ax += matrix[baris][kolom] * bobot[kolom];
         });
         lambdaMax += ax / bobot[baris];
      });
      lambdaMax = lambdaMax / n;

      // 4. Menghitung Consistency Index (CI) dan Consistency Ratio (CR)
      const ci = (lambdaMax - n) / (n - 1);
      const cr = ci / (RI[n] || 1.49);

      // Kriteria dianggap valid jika CR kurang dari atau sama dengan 0.1 (10%)
      const isKonsisten = cr <= 0.1;

      // 5. Jika matriks konsisten, simpan bobot ke MySQL
      if (isKonsisten) {
         for (const kode of keys) {
            await prisma.kriteria.update({
               where: { kode: kode },
               data: { bobot: bobot[kode] }
            });
         }
      }

      res.json({
         success: true,
         data: { bobot, lambdaMax, ci, cr, isKonsisten },
         message: isKonsisten
            ? "Matriks Konsisten. Bobot berhasil disimpan!"
            : "Matriks TIDAK Konsisten. Perbaiki logika perbandingan Anda."
      });

   } catch (error) {
      console.error("Error AHP:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
   }
});

module.exports = router;
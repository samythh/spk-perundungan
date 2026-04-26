// File: backend/src/routes/ahpRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// Konstanta Random Index (RI) berdasarkan ketetapan Thomas L. Saaty
const RI = { 1: 0, 2: 0, 3: 0.58, 4: 0.90, 5: 1.12, 6: 1.24, 7: 1.32, 8: 1.41, 9: 1.45, 10: 1.49 };

// ==============================================================
// 1. ENDPOINT: HITUNG AHP KRITERIA UTAMA (C1-C5)
// ==============================================================
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
            const normalizedValue = matrix[baris][kolom] / colSums[kolom];
            rowSum += normalizedValue;
         });
         bobot[baris] = rowSum / n;
      });

      // 3. Menghitung Lambda Max
      let lambdaMax = 0;
      keys.forEach(baris => {
         let ax = 0;
         keys.forEach(kolom => {
            ax += matrix[baris][kolom] * bobot[kolom];
         });
         lambdaMax += ax / bobot[baris];
      });
      lambdaMax = lambdaMax / n;

      // 4. Hitung CI dan CR
      const ci = (lambdaMax - n) / (n - 1);
      const cr = ci / (RI[n] || 1.49);
      const isKonsisten = cr <= 0.1;

      // 5. Simpan ke database Kriteria
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
      console.error("Error AHP Kriteria:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
   }
});


// ==============================================================
// 2. ENDPOINT BARU: HITUNG AHP SUB-KRITERIA (T1-T5)
// ==============================================================
router.post('/hitung-subkriteria', async (req, res) => {
   try {
      const { matrix } = req.body;

      // Mengurutkan kunci (T1, T2, T3, T4, T5)
      const keys = Object.keys(matrix).sort();
      const n = keys.length;

      if (n === 0) return res.status(400).json({ success: false, message: "Matriks kosong" });

      // Langkah 1: Menghitung Jumlah per Kolom
      const colSums = {};
      keys.forEach(k => colSums[k] = 0);
      keys.forEach(baris => {
         keys.forEach(kolom => {
            colSums[kolom] += matrix[baris][kolom];
         });
      });

      // Langkah 2: Normalisasi & Nilai Eigen
      const bobot = {};
      keys.forEach(baris => {
         let rowSum = 0;
         keys.forEach(kolom => {
            rowSum += matrix[baris][kolom] / colSums[kolom];
         });
         bobot[baris] = rowSum / n;
      });

      // Langkah 3: Lambda Max
      let lambdaMax = 0;
      keys.forEach(baris => {
         let ax = 0;
         keys.forEach(kolom => {
            ax += matrix[baris][kolom] * bobot[kolom];
         });
         lambdaMax += ax / bobot[baris];
      });
      lambdaMax = lambdaMax / n;

      // Langkah 4: Uji Konsistensi (CI & CR)
      const ci = (lambdaMax - n) / (n - 1);
      const cr = n <= 2 ? 0 : ci / (RI[n] || 1.49); // Jika matriks <= 2x2, otomatis konsisten
      const isKonsisten = cr <= 0.1;

      // Langkah 5: Idealisasi AHP Absolut & Simpan ke Database
      if (isKonsisten) {
         // Mencari nilai eigen tertinggi di antara T1-T5
         const maxEigen = Math.max(...Object.values(bobot));

         for (const kode of keys) {
            // Perhatikan ejaan subKriteria, sesuaikan dengan nama model di schema.prisma Anda
            await prisma.subKriteria.update({
               where: { kode: kode },
               data: {
                  eigen: bobot[kode], // Simpan nilai asli Eigen
                  bobot: bobot[kode] / maxEigen // Simpan Bobot Ideal (Maksimal 1.0)
               }
            });
         }
      }

      res.json({
         success: true,
         data: { bobot, lambdaMax, ci, cr, isKonsisten },
         message: isKonsisten
            ? "Matriks Sub-Kriteria Konsisten. Nilai Eigen dan Bobot Ideal berhasil disimpan!"
            : "Matriks TIDAK Konsisten. Perbaiki logika intensitas risiko Anda."
      });

   } catch (error) {
      console.error("Error AHP Sub-Kriteria:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan server saat menghitung sub-kriteria." });
   }
});

module.exports = router;
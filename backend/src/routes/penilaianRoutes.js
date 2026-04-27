// File: backend/src/routes/penilaianRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/database');

// ==============================================================
// ENDPOINT 1: MENGAMBIL DATA (KODE ASLI ANDA)
// ==============================================================
router.get('/data', async (req, res) => {
   try {
      const siswa = await prisma.siswa.findMany();
      const kriteria = await prisma.kriteria.findMany({ orderBy: { kode: 'asc' } });
      const subKriteria = await prisma.subKriteria.findMany({ orderBy: { kode: 'asc' } });
      const penilaian = await prisma.penilaian.findMany();

      res.json({
         success: true,
         data: { siswa, kriteria, subKriteria, penilaian }
      });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
});

// ==============================================================
// ENDPOINT 2: SIMPAN & KALKULASI AHP ABSOLUT (DIROMBAK)
// ==============================================================
router.post('/simpan-evaluasi', async (req, res) => {
   try {
      // Menangkap objek penilaian dari frontend
      // Format: { "1": { "C1": "T1", "C2": "T3" }, "2": { "C1": "T2" } }
      const { penilaian } = req.body;

      if (!penilaian || Object.keys(penilaian).length === 0) {
         return res.status(400).json({ success: false, message: "Data penilaian kosong." });
      }

      // 1. Ambil data master bobot dari database
      const [kriteriaList, subKriteriaList] = await Promise.all([
         prisma.kriteria.findMany(),
         prisma.subKriteria.findMany()
      ]);

      // 2. Buat kamus data (Dictionary) untuk pencarian instan
      const bobotKriteria = {};
      kriteriaList.forEach(k => bobotKriteria[k.kode] = k.bobot);

      const bobotSubKriteria = {};
      subKriteriaList.forEach(s => bobotSubKriteria[s.kode] = s.bobot_ideal); // Memanggil bobot_ideal, BUKAN eigen

      const dataPenilaianBaru = [];
      const updateSiswaPromises = [];
      const siswaIds = Object.keys(penilaian).map(id => parseInt(id));

      // 3. Looping untuk memproses dan mengalkulasi setiap siswa
      for (const siswaIdStr in penilaian) {
         const siswaId = parseInt(siswaIdStr);
         const evaluasiSiswa = penilaian[siswaIdStr];

         let skorAkhir = 0;

         // 3a. Loop setiap kriteria yang dinilai (C1, C2, dst)
         for (const kriteriaKode in evaluasiSiswa) {
            const subKode = evaluasiSiswa[kriteriaKode]; // Mendapatkan kode T (misal: "T1")

            if (subKode) { // Pastikan sel tidak kosong
               // Siapkan raw data untuk tabel Penilaian
               dataPenilaianBaru.push({
                  siswa_id: siswaId,
                  kriteria_kode: kriteriaKode,
                  subkriteria_kode: subKode
               });

               // KALKULASI AHP ABSOLUT: (Bobot Kriteria × Bobot Ideal Sub-Kriteria)
               const bKriteria = bobotKriteria[kriteriaKode] || 0;
               const bSubKriteria = bobotSubKriteria[subKode] || 0;
               skorAkhir += (bKriteria * bSubKriteria);
            }
         }

         // 3b. Tentukan Kategori Berdasarkan Skor Akhir
         const persentase = skorAkhir * 100;
         let kategoriLabel = "Sangat Aman";

         if (persentase >= 80) kategoriLabel = "Sangat Parah (Risiko Tinggi)";
         else if (persentase >= 60) kategoriLabel = "Parah";
         else if (persentase >= 40) kategoriLabel = "Sedang";
         else if (persentase >= 20) kategoriLabel = "Rentan";

         // 3c. Siapkan tumpukan perintah update untuk tabel Siswa
         updateSiswaPromises.push(
            prisma.siswa.update({
               where: { id: siswaId },
               data: {
                  nilai_akhir: skorAkhir,
                  kategori: kategoriLabel
               }
            })
         );
      }

      // 4. EKSEKUSI DATABASE DENGAN TRANSAKSI (Melanjutkan gaya kode aman Anda)
      await prisma.$transaction([
         // Hapus riwayat penilaian lama khusus untuk siswa-siswa yang sedang dinilai ini
         prisma.penilaian.deleteMany({
            where: { siswa_id: { in: siswaIds } }
         }),
         // Masukkan kumpulan penilaian baru secara massal
         prisma.penilaian.createMany({
            data: dataPenilaianBaru
         }),
         // Eksekusi pembaruan nilai akhir dan kategori pada tabel Siswa
         ...updateSiswaPromises
      ]);

      res.status(200).json({ success: true, message: "Evaluasi AHP Absolut berhasil disimpan dan dikalkulasi." });

   } catch (error) {
      console.error("Kesalahan Kalkulasi Penilaian:", error);
      res.status(500).json({ success: false, message: "Terjadi kesalahan internal server saat memproses penilaian." });
   }
});

module.exports = router;
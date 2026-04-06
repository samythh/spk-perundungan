// File: backend/src/utils/ahp.js

/**
 * Kelas utilitas untuk memproses perhitungan algoritma AHP.
 * Dirancang menggunakan pendekatan berorientasi objek (OOP) agar mudah digunakan ulang.
 */
class AHPProcessor {
   /**
    * Menghitung Bobot Prioritas (Eigen Vector) dari sebuah matriks perbandingan berpasangan.
    * @param {Array<Array<number>>} matrix - Matriks perbandingan (contoh: matriks 4x4 untuk 4 kriteria)
    * @returns {Array<number>} Array berisi nilai bobot (persentase) masing-masing kriteria
    */
   static calculateWeights(matrix) {
      const size = matrix.length;
      let columnSums = new Array(size).fill(0);

      // Langkah 1: Menjumlahkan nilai setiap kolom
      for (let i = 0; i < size; i++) {
         for (let j = 0; j < size; j++) {
            columnSums[j] += matrix[i][j];
         }
      }

      // Langkah 2: Membagi setiap elemen matriks dengan jumlah kolomnya (Normalisasi)
      // Langkah 3: Menghitung rata-rata dari setiap baris untuk mendapatkan bobot akhir
      let weights = new Array(size).fill(0);
      for (let i = 0; i < size; i++) {
         let rowSum = 0;
         for (let j = 0; j < size; j++) {
            // Normalisasi dan tambahkan ke total baris
            rowSum += matrix[i][j] / columnSums[j];
         }
         // Rata-rata baris = Bobot kriteria ke-i
         weights[i] = rowSum / size;
      }

      return weights;
   }

   /**
    * Menghitung Rasio Konsistensi (Consistency Ratio / CR) untuk memvalidasi logika penilaian.
    * Syarat AHP: Jika CR < 0.1, maka penilaian dianggap konsisten dan valid.
    * @param {Array<Array<number>>} matrix - Matriks perbandingan awal
    * @param {Array<number>} weights - Bobot prioritas yang sudah dihitung sebelumnya
    * @returns {Object} Mengembalikan nilai CR dan status kelayakannya
    */
   static checkConsistency(matrix, weights) {
      const size = matrix.length;
      let weightedSumVector = new Array(size).fill(0);

      // Langkah 1: Mengalikan matriks awal dengan bobot prioritas
      for (let i = 0; i < size; i++) {
         for (let j = 0; j < size; j++) {
            weightedSumVector[i] += matrix[i][j] * weights[j];
         }
      }

      // Langkah 2: Membagi hasil langkah 1 dengan bobot masing-masing untuk mencari Lambda
      let lambdaMax = 0;
      for (let i = 0; i < size; i++) {
         lambdaMax += weightedSumVector[i] / weights[i];
      }
      lambdaMax = lambdaMax / size; // Rata-rata dari pembagian tersebut

      // Langkah 3: Menghitung Consistency Index (CI)
      const CI = (lambdaMax - size) / (size - 1);

      // Langkah 4: Menentukan Random Index (RI) berdasarkan ukuran matriks (ketetapan tabel Saaty)
      // Indeks untuk matriks ukuran 1 hingga 10
      const RI_TABLE = [0.0, 0.0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
      const RI = RI_TABLE[size - 1];

      // Langkah 5: Menghitung Consistency Ratio (CR)
      // Jika ukuran matriks 1 atau 2, CR otomatis 0 (selalu konsisten)
      const CR = size <= 2 ? 0 : CI / RI;

      return {
         consistencyRatio: CR,
         isConsistent: CR <= 0.1, // True jika <= 10%
      };
   }
}

module.exports = AHPProcessor;
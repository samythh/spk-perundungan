// File: backend/src/utils/ahp.js

class AHPProcessor {
   static calculateWeights(matrix) {
      const size = matrix.length;
      let columnSums = new Array(size).fill(0);

      // Langkah 1: Menjumlahkan nilai setiap kolom
      for (let i = 0; i < size; i++) {
         for (let j = 0; j < size; j++) {
            columnSums[j] += matrix[i][j];
         }
      }

      // Langkah 2 & 3: Normalisasi dan rata-rata baris
      let weights = new Array(size).fill(0);
      for (let i = 0; i < size; i++) {
         let rowSum = 0;
         for (let j = 0; j < size; j++) {
            rowSum += matrix[i][j] / columnSums[j];
         }
         weights[i] = rowSum / size;
      }

      return weights;
   }

   static checkConsistency(matrix, weights) {
      const size = matrix.length;
      let weightedSumVector = new Array(size).fill(0);

      for (let i = 0; i < size; i++) {
         for (let j = 0; j < size; j++) {
            weightedSumVector[i] += matrix[i][j] * weights[j];
         }
      }

      let lambdaMax = 0;
      for (let i = 0; i < size; i++) {
         lambdaMax += weightedSumVector[i] / weights[i];
      }
      lambdaMax = lambdaMax / size;

      const CI = (lambdaMax - size) / (size - 1);
      const RI_TABLE = [0.0, 0.0, 0.58, 0.9, 1.12, 1.24, 1.32, 1.41, 1.45, 1.49];
      const RI = RI_TABLE[size - 1];
      const CR = size <= 2 ? 0 : CI / RI;

      // PERBAIKAN: Mengembalikan objek yang nama kuncinya (keys) sama dengan harapan Frontend
      return {
         lambdaMax: lambdaMax,
         ci: CI,
         cr: CR,
         isKonsisten: CR <= 0.1,
      };
   }
}

module.exports = AHPProcessor;
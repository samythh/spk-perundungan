/*
  Warnings:

  - You are about to drop the column `createdAt` on the `kriteria` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `kriteria` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `kriteria` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `keterangan` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE `Nilai` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswaId` INTEGER NOT NULL,
    `kriteriaId` INTEGER NOT NULL,
    `skor` DOUBLE NOT NULL,

    UNIQUE INDEX `Nilai_siswaId_kriteriaId_key`(`siswaId`, `kriteriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Nilai` ADD CONSTRAINT `Nilai_siswaId_fkey` FOREIGN KEY (`siswaId`) REFERENCES `Siswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nilai` ADD CONSTRAINT `Nilai_kriteriaId_fkey` FOREIGN KEY (`kriteriaId`) REFERENCES `Kriteria`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

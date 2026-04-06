// File: backend/src/config/database.js

const { PrismaClient } = require('@prisma/client');

// Menginisialisasi Prisma Client untuk berinteraksi dengan MySQL
// Kita menjadikan ini sebagai instance terpusat agar tidak membuka terlalu banyak koneksi
const prisma = new PrismaClient();

module.exports = prisma;
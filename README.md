# Sistem Pendukung Keputusan (SPK) - Deteksi Kerentanan Perundungan

Aplikasi berbasis web ini dirancang untuk membantu Guru Bimbingan Konseling (BK) di SMAN 2 Padang dalam mendeteksi dan mengevaluasi tingkat kerentanan siswa terhadap risiko perundungan (*bullying*). Sistem ini dibangun menggunakan metode **Analytic Hierarchy Process (AHP) Absolut**.

---

## 🛠️ Persyaratan Sistem

Sebelum menjalankan aplikasi, pastikan perangkat komputer sudah terpasang perangkat lunak berikut:
1. **Node.js** (Versi 18.x atau lebih baru)
2. **XAMPP** atau **MySQL Server** (Untuk pengelolaan *database*)
3. **Git** (Untuk menarik repositori)

---

## 📂 Struktur Direktori

Proyek ini terbagi menjadi dua bagian utama:
* `/backend` : Memuat logika API (*Express.js*) dan konfigurasi *database* (*Prisma ORM*).
* `/frontend` : Memuat antarmuka pengguna (*Next.js*, *Tailwind CSS*, *Shadcn UI*).

---

## 🚀 Langkah Instalasi & Menjalankan Aplikasi

Ikuti panduan di bawah ini secara berurutan untuk menjalankan aplikasi di lingkungan lokal (*localhost*).

### Tahap 1: Konfigurasi Database (MySQL)
1. Buka aplikasi **XAMPP Control Panel**.
2. Nyalakan modul **Apache** dan **MySQL**.
3. Buka *browser* dan akses `http://localhost/phpmyadmin`.
4. Buat sebuah *database* baru dengan nama: `spk_perundungan`.

### Tahap 2: Menjalankan Backend (Server API)
Buka terminal (Command Prompt / VS Code Terminal), lalu jalankan perintah berikut:

```bash
# 1. Masuk ke folder backend
cd backend

# 2. Instal semua dependensi pustaka
npm install

# 3. Buat file konfigurasi environment
# Salin file .env.example menjadi .env, lalu sesuaikan URL database-nya:
# DATABASE_URL="mysql://root:@localhost:3306/spk_perundungan"

# 4. Lakukan migrasi tabel ke database MySQL
npx prisma migrate dev --name init

# 5. Tanamkan data awal (Kriteria dan Akun Admin Default) ke database
npx prisma db seed

# 6. Nyalakan server backend
npm run dev
```
*Pastikan terminal backend tetap terbuka dan berjalan di port `8000`.*

### Tahap 3: Menjalankan Frontend (Antarmuka Pengguna)
Buka tab terminal baru (biarkan terminal *backend* tetap menyala), lalu jalankan perintah berikut:

```bash
# 1. Masuk ke folder frontend (dari folder root proyek)
cd frontend

# 2. Instal semua dependensi antarmuka
npm install

# 3. Nyalakan server frontend
npm run dev
```
*Aplikasi kini dapat diakses melalui browser pada alamat: `http://localhost:3000`*

---

## 🔐 Akun Default Sistem

Setelah aplikasi berhasil berjalan, silakan masuk melalui halaman login menggunakan kredensial bawaan berikut:

* **Username:** `admin`
* **Password:** `admin123`
* **Level Akses:** MASTER ADMIN

Akun ini dapat digunakan untuk masuk ke *Dashboard*, mengatur Master Data, menjalankan perhitungan AHP, serta membuatkan akun baru untuk pengguna lain (seperti Guru BK atau Kepala Sekolah) melalui menu Manajemen Pengguna.

---

## 👥 Tim Pengembang
Proyek ini dikembangkan untuk memenuhi tugas mata kuliah Komputer dan Masyarakat.

* **Mikail Samyth Habibillah**
* **Sheva Ramadhan**
* **Ihsan Auliya H**
* **Duha Alul Bariq**

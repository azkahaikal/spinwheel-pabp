# 🎡 Spin Decide

Aplikasi pemilihan acak interaktif berbasis web yang dibangun dengan **React**, **Vite**, dan **Supabase**. Aplikasi ini dirancang untuk membantu pengguna membuat keputusan dengan cara yang menyenangkan melalui berbagai mode roda putar (spin wheel).

## 🚀 Fitur Utama

Aplikasi ini mencakup berbagai modul interaktif yang dapat digunakan setelah pengguna melakukan autentikasi:

* **Autentikasi Pengguna**: Sistem Login dan Daftar menggunakan Supabase Auth.
* **Spin Normal**: Roda putar klasik untuk pilihan acak sederhana.
* **Weighted Spin**: Memberikan bobot probabilitas yang berbeda pada setiap pilihan.
* **Double Spin**: Dua roda putar sekaligus untuk kombinasi keputusan yang lebih kompleks.
* **Truth or Dare**: Permainan populer dengan daftar pertanyaan dan tantangan yang bisa dikustomisasi.
* **Rooms (Real-time)**: Fitur kolaborasi untuk memutar roda bersama teman secara real-time.
* **Riwayat Putaran**: Menyimpan dan menampilkan jejak semua hasil putaran yang pernah dilakukan oleh pengguna.

## 🛠️ Teknologi yang Digunakan

* **Frontend**: React.js & Vite
* **Styling**: Tailwind CSS & Lucide React (Icons)
* **Animation**: Framer Motion
* **Backend & Database**: Supabase (PostgreSQL)
* **Authentication**: Supabase Auth
* **State Management**: React Context API & TanStack Query

## 📥 Instalasi Lokal

1. **Clone Repositori**
```bash
git clone [https://github.com/username/spin-decide.git](https://github.com/username/spinwheel-pabp.git)
cd spin-decide

2. Instal Dependensi
```bash
npm install

3. Konfigurasi Environment Variables
Buat file .env di direktori akar dan tambahkan kredensial Supabase Anda:

Cuplikan kode
VITE_SUPABASE_URL=your_supabase_project_url VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

4. Jalankan Aplikasi
```bash
npm run dev

🗄️ Konfigurasi Database (Supabase)
Jalankan skrip SQL berikut di SQL Editor pada Dashboard Supabase untuk menyiapkan tabel yang diperlukan:

-- 1. Tabel spin_sessions (Riwayat)
create table public.spin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  type text not null,
  title text,
  options jsonb,
  result text,
  result_secondary text,
  created_at timestamptz default now()
);

-- 2. Tabel rooms (Real-time)
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  status text not null default 'waiting',
  options jsonb default '[]',
  participants jsonb default '[]',
  host_email text,
  result text,
  created_at timestamptz default now()
);

-- Aktifkan Realtime untuk tabel rooms
alter publication supabase_realtime add table public.rooms;



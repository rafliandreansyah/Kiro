# Requirements Document

## Introduction

Aplikasi Todo-List Front-End adalah aplikasi web berbasis browser yang memungkinkan pengguna untuk mengelola daftar tugas (todo) secara efisien. Aplikasi ini menyediakan antarmuka yang intuitif untuk membuat, membaca, memperbarui, dan menghapus tugas, serta mendukung fitur kategorisasi, prioritas, dan filter tugas. Data tugas disimpan secara lokal di browser menggunakan Local Storage sehingga tetap tersedia setelah halaman di-refresh.

## Glossary

- **App**: Aplikasi Todo-List Front-End secara keseluruhan
- **Todo**: Sebuah item tugas yang memiliki judul, status, prioritas, dan tanggal jatuh tempo
- **Todo_List**: Kumpulan semua Todo yang dimiliki pengguna
- **Input_Field**: Elemen antarmuka tempat pengguna mengetikkan judul Todo baru
- **Filter**: Mekanisme untuk menampilkan subset Todo berdasarkan kriteria tertentu (status, prioritas, atau kategori)
- **Storage**: Mekanisme penyimpanan data berbasis Local Storage di browser
- **Category**: Label yang dapat ditetapkan pada Todo untuk pengelompokan
- **Priority**: Tingkat kepentingan Todo, bernilai "Rendah", "Sedang", atau "Tinggi"
- **Due_Date**: Tanggal jatuh tempo penyelesaian sebuah Todo
- **Validator**: Komponen yang memvalidasi input pengguna sebelum data disimpan

---

## Requirements

### Requirement 1: Membuat Todo Baru

**User Story:** Sebagai pengguna, saya ingin menambahkan tugas baru ke dalam daftar, sehingga saya dapat mencatat hal-hal yang perlu saya kerjakan.

#### Acceptance Criteria

1. THE App SHALL menampilkan Input_Field untuk memasukkan judul Todo pada halaman utama.
2. WHEN pengguna memasukkan judul Todo dan menekan tombol "Tambah" atau menekan tombol Enter, THE App SHALL menambahkan Todo baru ke dalam Todo_List dengan status "Belum Selesai".
3. WHEN pengguna berhasil menambahkan Todo, THE Input_Field SHALL dikosongkan secara otomatis.
4. IF pengguna menekan tombol "Tambah" dengan Input_Field kosong, THEN THE Validator SHALL menampilkan pesan kesalahan "Judul tugas tidak boleh kosong".
5. IF pengguna memasukkan judul Todo yang melebihi 200 karakter, THEN THE Validator SHALL menampilkan pesan kesalahan "Judul tugas maksimal 200 karakter".
6. WHEN pengguna membuat Todo baru, THE App SHALL memungkinkan pengguna untuk menetapkan Priority dengan nilai default "Sedang".
7. WHEN pengguna membuat Todo baru, THE App SHALL memungkinkan pengguna untuk menetapkan Due_Date opsional.
8. WHEN pengguna membuat Todo baru, THE App SHALL memungkinkan pengguna untuk menetapkan Category opsional.

---

### Requirement 2: Menampilkan Daftar Todo

**User Story:** Sebagai pengguna, saya ingin melihat semua tugas saya dalam satu tampilan, sehingga saya dapat memantau seluruh pekerjaan yang ada.

#### Acceptance Criteria

1. THE App SHALL menampilkan seluruh Todo dalam Todo_List pada halaman utama.
2. THE App SHALL menampilkan judul, status, Priority, Category, dan Due_Date untuk setiap Todo.
3. WHEN Todo_List kosong, THE App SHALL menampilkan pesan "Belum ada tugas. Tambahkan tugas pertama Anda!".
4. THE App SHALL menampilkan jumlah total Todo, jumlah Todo "Belum Selesai", dan jumlah Todo "Selesai" di bagian ringkasan.
5. WHEN Due_Date sebuah Todo telah melewati tanggal hari ini dan statusnya masih "Belum Selesai", THE App SHALL menampilkan indikator visual "Terlambat" pada Todo tersebut.

---

### Requirement 3: Menandai Todo sebagai Selesai

**User Story:** Sebagai pengguna, saya ingin menandai tugas sebagai selesai, sehingga saya dapat melacak kemajuan pekerjaan saya.

#### Acceptance Criteria

1. THE App SHALL menampilkan checkbox pada setiap Todo di Todo_List.
2. WHEN pengguna mencentang checkbox sebuah Todo, THE App SHALL mengubah status Todo tersebut menjadi "Selesai" dan menampilkan efek visual coretan pada judul Todo.
3. WHEN pengguna menghapus centang checkbox sebuah Todo berstatus "Selesai", THE App SHALL mengubah status Todo tersebut kembali menjadi "Belum Selesai".
4. WHEN status Todo berubah, THE Storage SHALL menyimpan perubahan status secara otomatis.

---

### Requirement 4: Mengedit Todo

**User Story:** Sebagai pengguna, saya ingin mengubah detail tugas yang sudah ada, sehingga saya dapat memperbarui informasi tugas sesuai kebutuhan.

#### Acceptance Criteria

1. THE App SHALL menampilkan tombol "Edit" pada setiap Todo di Todo_List.
2. WHEN pengguna menekan tombol "Edit" pada sebuah Todo, THE App SHALL menampilkan form edit yang berisi judul, Priority, Category, dan Due_Date Todo tersebut.
3. WHEN pengguna menyimpan perubahan pada form edit, THE App SHALL memperbarui data Todo dengan nilai yang baru.
4. IF pengguna menyimpan form edit dengan judul kosong, THEN THE Validator SHALL menampilkan pesan kesalahan "Judul tugas tidak boleh kosong".
5. WHEN pengguna menekan tombol "Batal" pada form edit, THE App SHALL menutup form edit tanpa menyimpan perubahan.
6. WHEN perubahan Todo berhasil disimpan, THE Storage SHALL memperbarui data Todo di Local Storage.

---

### Requirement 5: Menghapus Todo

**User Story:** Sebagai pengguna, saya ingin menghapus tugas yang tidak relevan, sehingga daftar tugas saya tetap bersih dan terorganisir.

#### Acceptance Criteria

1. THE App SHALL menampilkan tombol "Hapus" pada setiap Todo di Todo_List.
2. WHEN pengguna menekan tombol "Hapus" pada sebuah Todo, THE App SHALL menampilkan dialog konfirmasi "Apakah Anda yakin ingin menghapus tugas ini?".
3. WHEN pengguna mengonfirmasi penghapusan, THE App SHALL menghapus Todo dari Todo_List dan memperbarui Storage.
4. WHEN pengguna membatalkan dialog konfirmasi, THE App SHALL menutup dialog tanpa menghapus Todo.
5. THE App SHALL menampilkan tombol "Hapus Semua Tugas Selesai" untuk menghapus seluruh Todo berstatus "Selesai" sekaligus.
6. WHEN pengguna menekan "Hapus Semua Tugas Selesai", THE App SHALL menampilkan dialog konfirmasi sebelum melakukan penghapusan massal.

---

### Requirement 6: Filter dan Pencarian Todo

**User Story:** Sebagai pengguna, saya ingin memfilter dan mencari tugas berdasarkan kriteria tertentu, sehingga saya dapat menemukan tugas yang relevan dengan cepat.

#### Acceptance Criteria

1. THE App SHALL menyediakan Filter berdasarkan status dengan pilihan: "Semua", "Belum Selesai", dan "Selesai".
2. THE App SHALL menyediakan Filter berdasarkan Priority dengan pilihan: "Semua", "Tinggi", "Sedang", dan "Rendah".
3. THE App SHALL menyediakan Filter berdasarkan Category dari daftar Category yang telah dibuat pengguna.
4. WHEN pengguna memilih sebuah Filter, THE App SHALL menampilkan hanya Todo yang sesuai dengan kriteria Filter tersebut.
5. THE App SHALL menyediakan kolom pencarian teks bebas.
6. WHEN pengguna mengetikkan teks pada kolom pencarian, THE App SHALL menampilkan hanya Todo yang judulnya mengandung teks tersebut (pencarian tidak membedakan huruf besar/kecil).
7. WHEN beberapa Filter aktif secara bersamaan, THE App SHALL menampilkan Todo yang memenuhi semua kriteria Filter yang aktif.
8. THE App SHALL menampilkan tombol "Reset Filter" untuk mengembalikan semua Filter ke kondisi default.

---

### Requirement 7: Pengurutan Todo

**User Story:** Sebagai pengguna, saya ingin mengurutkan daftar tugas berdasarkan kriteria tertentu, sehingga saya dapat memprioritaskan pekerjaan dengan lebih mudah.

#### Acceptance Criteria

1. THE App SHALL menyediakan opsi pengurutan berdasarkan: tanggal pembuatan (terbaru/terlama), Due_Date (terdekat/terjauh), dan Priority (tertinggi/terendah).
2. WHEN pengguna memilih opsi pengurutan, THE App SHALL menampilkan ulang Todo_List sesuai urutan yang dipilih.
3. THE App SHALL mempertahankan opsi pengurutan yang dipilih pengguna selama sesi berlangsung.

---

### Requirement 8: Manajemen Kategori

**User Story:** Sebagai pengguna, saya ingin membuat dan mengelola kategori tugas, sehingga saya dapat mengelompokkan tugas berdasarkan konteks atau proyek.

#### Acceptance Criteria

1. THE App SHALL memungkinkan pengguna untuk membuat Category baru dengan nama unik.
2. IF pengguna mencoba membuat Category dengan nama yang sudah ada, THEN THE Validator SHALL menampilkan pesan kesalahan "Kategori dengan nama ini sudah ada".
3. THE App SHALL memungkinkan pengguna untuk menghapus Category yang tidak memiliki Todo terkait.
4. IF pengguna mencoba menghapus Category yang masih memiliki Todo terkait, THEN THE App SHALL menampilkan pesan "Kategori tidak dapat dihapus karena masih memiliki tugas terkait".
5. THE App SHALL menampilkan daftar semua Category yang tersedia pada form pembuatan dan pengeditan Todo.

---

### Requirement 9: Persistensi Data

**User Story:** Sebagai pengguna, saya ingin data tugas saya tersimpan secara otomatis, sehingga saya tidak kehilangan data ketika menutup atau me-refresh browser.

#### Acceptance Criteria

1. WHEN pengguna menambahkan, mengedit, atau menghapus Todo, THE Storage SHALL menyimpan perubahan ke Local Storage secara otomatis tanpa tindakan eksplisit dari pengguna.
2. WHEN App dimuat ulang di browser, THE App SHALL memuat seluruh data Todo dari Local Storage dan menampilkannya di Todo_List.
3. IF Local Storage tidak tersedia di browser, THEN THE App SHALL menampilkan pesan peringatan "Penyimpanan lokal tidak tersedia. Data tidak akan tersimpan setelah halaman ditutup.".
4. THE Storage SHALL menyimpan data Todo dalam format JSON yang valid.
5. FOR ALL data Todo yang disimpan ke Storage, membaca kembali data tersebut dari Storage SHALL menghasilkan data yang identik dengan data yang disimpan (round-trip property).

---

### Requirement 10: Antarmuka dan Aksesibilitas

**User Story:** Sebagai pengguna, saya ingin antarmuka yang responsif dan mudah digunakan, sehingga saya dapat mengakses aplikasi dari berbagai perangkat.

#### Acceptance Criteria

1. THE App SHALL menampilkan antarmuka yang responsif dan dapat digunakan pada lebar layar minimal 320px hingga 1920px.
2. THE App SHALL mendukung navigasi menggunakan keyboard untuk semua fungsi utama (tambah, edit, hapus, filter).
3. THE App SHALL menampilkan label yang deskriptif pada semua elemen interaktif (tombol, input, checkbox).
4. WHEN pengguna melakukan aksi yang berhasil (tambah, edit, hapus Todo), THE App SHALL menampilkan notifikasi konfirmasi singkat selama 3 detik.
5. THE App SHALL mendukung tampilan mode terang (light mode) sebagai default.
6. WHERE pengguna mengaktifkan preferensi dark mode di sistem operasi, THE App SHALL menampilkan antarmuka dalam mode gelap (dark mode).

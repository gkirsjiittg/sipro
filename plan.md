# SIPRO — Lanjutan Development (Repo `tomkolam/sipro`) 

Problem statement: **"saya ingin anda lanjutkan development dari repo ini https://github.com/tomkolam/sipro — sebelumnya development terhenti di sini, saya ingin anda lanjutkan"**

Konteks status terkini (verified): Fase **39b** sudah lulus (testing_agent_v3 iterasi 61, 5/5 PASS), **0 action items**, dan sesi ini sudah **restore repo + env + deps**, backend seed OK, login OK, dan **`run_all_gates.sh` = PASS (22 gates)**.

Fase berikut (owner-approved + user confirmed): **FASE 40 — IA & Design System V2** (acuan: `docs/v2/23_IA_UX_BLUEPRINT.md`, roadmap `docs/v2/34_ROADMAP_EKSEKUSI.md`).

---

## 1) Objectives

1. Terapkan **IA V2** (menu 33→26) tanpa fitur hilang; item yang belum dibangun jadi **"Segera Hadir"** (disabled, **tanpa route** agar lolos `check_nav_map.py`).
2. Migrasikan **SEMUA daftar utama** ke **DataTable pro** (search + filter multi + sort server-side + column picker + export + bulk actions + pagination + aging).
3. Buat **halaman kanonik** untuk entitas besar:
   - `/leads/:id` Profil Lead (pindahkan DocChecklist dari drawer ke halaman ini).
   - `/customers/:id` Profil Customer.
   - Samakan pola tab untuk `/units/:id` dan `/projects/:id` (TabPage + sync `?tab=`).
4. Pastikan **KPI Beranda bisa di-drill-down** (klik KPI → tabel terfilter via URL params).
5. Tambahkan **guardrail baru**: `scripts/verify_ia_v2.py` + perluas `verify_ui_surfaces.py`, dan lakukan **uji-mutasi** (gate harus bisa gagal).

---

## 2) Implementation Steps

### Phase 1 — Core POC (Isolation) — **TIDAK diperlukan**
Core sistem (auth/RBAC, checklist dokumen, file upload, gates 39b) sudah terbukti dan stabil; Fase 40 adalah refactor IA/design-system di atas core yang sudah lolos 22 gates. Fokus langsung ke implementasi incremental + gate.

### Phase 2 — V1 App Development (FASE 40)

#### 40a) Fondasi Design System + Dukungan Query Server-side
User stories:
1) Sebagai user, saya bisa mengurutkan daftar (sort) dan hasilnya konsisten di semua halaman (bukan hanya halaman aktif).
2) Sebagai user, saya bisa memfilter data dengan beberapa kriteria sekaligus (multi-filter) dan URL bisa dibagikan.
3) Sebagai user, saya melihat kolom **aging** yang jujur (umur total & umur tahap) dengan warna sesuai SLA.
4) Sebagai user, saya bisa ekspor hasil tabel (CSV) sesuai filter aktif.
5) Sebagai admin/dev, saya bisa menambah filter baru tanpa mengulang UI per halaman (FilterBar deklaratif).

Langkah:
- Frontend:
  - Tambahkan dependency **`@tanstack/react-table`** dan refactor `components/patterns/DataTable.js` (jaga kontrak prop agar pemakai existing tidak pecah).
  - Buat komponen pola baru minimal: `FilterBar`, `AgingCell`, `TabPage`, `TimelineFeed`, `MoneyText`, `ChartFrame`, `KpiCard` (atau extend `MetricCard` untuk drilldown).
- Backend:
  - Tambah dukungan **sort+direction** dan filter tambahan pada endpoint list: leads, deals/units, customers, tasks, AR/pembayaran, dokumen, komplain.
  - Aging tahap: turunkan dari `stage_history` (read-only) untuk payload list (tanpa mengklaim field Fase 41).
- Pastikan semua opsi/status/label tetap SSOT dari `/api/reference`.
- Jaga compliance (js/py size limits) dengan memecah file bila mendekati batas.

Checkpoint: `bash scripts/run_all_gates.sh` tetap PASS.

#### 40b) Halaman kanonik `/leads/:id` & `/customers/:id` + TabPage `?tab=`
User stories:
1) Sebagai sales, klik baris lead membuka **halaman** profil lead (bukan drawer) dengan tab yang jelas.
2) Sebagai supervisor, saya memverifikasi/menolak dokumen dari halaman lead dan audit aktor+waktu tetap benar.
3) Sebagai user, checklist dokumen tampil di tab Dokumen Lead dan tidak ada badge menipu.
4) Sebagai user, tab bisa di-link (`?tab=`) sehingga saya bisa share link langsung ke tab Dokumen/Timeline.
5) Sebagai customer service/finance, Profil Customer menunjukkan tab future-phase dengan label jujur “belum aktif — Fase 43/44/45”.

Langkah:
- Buat page baru:
  - `frontend/src/pages/LeadProfilePage.js` (route `/leads/:id`).
  - `frontend/src/pages/CustomerProfilePage.js` (route `/customers/:id`).
- Pindahkan `DocChecklist` dari drawer `LeadDetail` ke halaman lead (tab Dokumen).
- Reuse panel yang sudah ada (LeadLifecyclePanel, LeadWaPanel, LeadSlikPanel, dsb) agar tidak hilang fitur.
- Terapkan `TabPage` untuk `/units/:id` dan `/projects/:id` (sync `?tab=`) tanpa merombak domain logic.

Checkpoint: smoke test UI manual 2 role (sales + manager) untuk alur doc verify/reject + check gate.

#### 40c) Restrukturisasi Navigasi 33→26 + Hub Pages + Dokumen Peta Nav
User stories:
1) Sebagai user lama, saya menemukan fitur yang sama di menu baru tanpa hilang (ada peta & link).
2) Sebagai user, menu “Segera Hadir” jelas disabled dan tidak membawa ke halaman kosong.
3) Sebagai user proyek, saya melihat hub “Pembangunan” yang menggabungkan kalender/field/kalibrasi tanpa duplikasi.
4) Sebagai user CRM, saya melihat hub “Customer & Kontrak” sebagai pintu utama (deal+customer).
5) Sebagai user, “Dokumen” jadi daftar global, sedangkan “Perizinan” muncul di konteks unit/proyek.

Langkah:
- Update `frontend/src/config/navigationConfig.js` sesuai blueprint (group CRM, Marketing, Analitik & BI, Konfigurasi).
  - Item belum ada fitur → `comingSoon: true` dan **hapus route** (wajib lolos `check_nav_map.py`).
- Buat/rapikan hub page minimal (tanpa re-implement fitur):
  - CRM hub (Customer & Kontrak) sebagai agregator link/entry.
  - Proyek hub (Pembangunan) sebagai tab wrapper ke halaman yang sudah ada.
  - Dokumen+Perizinan: pastikan menu lama tidak memunculkan dead-route; pindahkan entry points.
- Tulis dokumen peta menu: `docs/v2/40_PETA_NAV_V2.md` (old → new, 1 baris per fitur utama).

Checkpoint: `python3 scripts/check_nav_map.py` PASS + gate suite PASS.

#### 40d) Migrasi SEMUA daftar utama ke DataTable pro + URL-synced filters + KPI drilldown
User stories:
1) Sebagai user, daftar Lead/Deal/Customer/Unit/Tugas/AR/Dokumen/Komplain seragam: search+filter+sort+kolom+export+bulk.
2) Sebagai manager, saya bisa melakukan aksi massal (mis. assign/close) dan jelas berapa baris terpilih.
3) Sebagai user, filter tersimpan di URL sehingga bisa di-bookmark/share.
4) Sebagai user, klik KPI di Beranda membuka daftar terkait dengan filter otomatis.
5) Sebagai user, tidak ada drawer detail panjang; klik baris membuka halaman detail kanonik.

Langkah:
- Refactor pages daftar:
  - `LeadsPage`, `DealsPage`, `CustomersPage`, daftar Unit (Projects/Units tab), `TasksPage`, `FinancePage` (AR list), `DocumentsPage`, `ComplaintsPage`.
- Implement pola query di URL (q, filters, sort, direction, skip, limit) dan parser yang konsisten.
- Update Beranda (`Home.js`) agar KPI/TeamStat memiliki `onClick` → navigate ke list + query params.
- Pastikan regresi 39b tetap: dupe evidence = 400 toast Indonesia; RBAC sales tetap normal.

Checkpoint: 1 round manual drilldown KPI → list terfilter + export.

### Phase 3 — Testing & Guardrails (40e)
User stories:
1) Sebagai dev, saya punya gate yang memastikan setiap halaman daftar punya elemen search/filter/sort ber-`data-testid`.
2) Sebagai dev, saya terproteksi dari halaman yang membengkak >500 baris.
3) Sebagai owner, saya yakin tidak ada fitur hilang karena peta old→new diverifikasi.
4) Sebagai user, UI tidak regress (background/label/kontras) karena `verify_ui_surfaces.py` diperluas.
5) Sebagai QA, saya bisa menjalankan 23 gates dan melihat ringkasan PASS.

Langkah:
- Tambah gate baru `scripts/verify_ia_v2.py` dan masukkan ke `scripts/run_all_gates.sh` (jadi 23).
  - Cek: list routes punya DataTable + FilterBar + search; KPI Beranda punya link drilldown; tidak ada page >500 lines; peta nav doc ada.
- Perluas `verify_ui_surfaces.py` bila ada pola baru (mis. FilterBar overlay, table wrappers baru).
- Buat script uji-mutasi `scripts/mutasi_40_ia.py`:
  - Sengaja hapus `data-testid` search pada 1 list → gate harus FAIL.
  - Sengaja buat 1 nav item comingSoon punya route → `check_nav_map.py` harus FAIL.
  - Pulihkan → PASS.
- Update `test_result.md` sebelum meminta testing_agent.
- Delegasi testing ke testing_agent: US-40-1..US-40-4 + regresi Fase 39b (checklist pindah lokasi, separation of duties, dupe evidence 400, RBAC).

---

## 3) Next Actions (immediate)

1. Tambah `@tanstack/react-table` dan refactor `DataTable` (jaga kompatibilitas pemakai existing).
2. Implement backend sort/filter server-side untuk semua endpoint daftar yang dipakai Fase 40.
3. Buat route + page baru: `/leads/:id` dan `/customers/:id`; pindahkan `DocChecklist` ke halaman lead.
4. Restrukturisasi `navigationConfig.js` (comingSoon tanpa route) + buat `docs/v2/40_PETA_NAV_V2.md`.
5. Migrasikan semua daftar utama ke DataTable pro + URL-synced filters + KPI drilldown.
6. Tambah `verify_ia_v2.py` + `mutasi_40_ia.py`; jalankan `bash scripts/run_all_gates.sh` sampai **23/23 PASS**.
7. Update `test_result.md`, lalu panggil testing_agent untuk E2E & regresi 39b.

---

## 4) Success Criteria

- IA V2 terpasang: menu 33→26, item belum ada = “Segera Hadir” (disabled, tanpa route), `check_nav_map.py` PASS.
- Semua daftar utama memakai DataTable pro dengan **sort/filter server-side**, URL-synced query, export, bulk actions, pagination, dan kolom aging.
- Klik baris membuka halaman kanonik `/leads/:id` & `/customers/:id` (bukan drawer untuk konten panjang).
- KPI Beranda dapat di-drill-down ke tabel terfilter (tanpa ini Fase 40 dianggap belum selesai).
- Gate baru `verify_ia_v2.py` + uji-mutasi berjalan; total gate menjadi **23** dan `run_all_gates.sh` OVERALL PASS.
- Regresi Fase 39b tetap lulus (separation of duties verifikasi dokumen, dupe evidence 400+toast, badge jujur, akses sales normal).
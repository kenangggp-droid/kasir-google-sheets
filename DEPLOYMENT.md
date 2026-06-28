# Deployment

## 1. Backend Google Apps Script

1. Upload/import `Database_Keuangan_Toko_Terintegrasi.xlsx` ke Google Drive sebagai Google Sheets.
2. Buka spreadsheet, lalu pilih `Extensions > Apps Script`.
3. Tempel isi `apps-script/Code.gs` ke file `Code.gs`.
4. Bila memakai `clasp`, sertakan `apps-script/appsscript.json`; bila manual, samakan timezone ke `Asia/Jakarta`.
5. Pilih `Deploy > New deployment > Web app`.
6. Gunakan:
   - Execute as: `Me`
   - Who has access: `Anyone` atau sesuai kebutuhan tim
7. Salin URL Web App yang berakhir dengan `/exec`.

## 2. Frontend

1. Buat file `.env` dari `.env.example`.
2. Isi:

```bash
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

3. Build:

```bash
pnpm install
pnpm build
```

4. Deploy folder `dist/` ke hosting statis seperti GitHub Pages, Netlify, Vercel, atau Cloudflare Pages.

## 3. GitHub Pages

Repository ini sudah memakai `base: "./"` di `vite.config.js`, sehingga asset build aman untuk GitHub Pages meskipun repository dipublish di subpath.

Aktifkan Pages dari GitHub Actions bila ingin memakai workflow bawaan di `.github/workflows/release.yml`.

## 4. Akun Awal

Data contoh workbook menyediakan akun:

- Username: `admin`
- Password: `admin123`

Ganti password langsung di sheet `Users` sebelum dipakai produksi.

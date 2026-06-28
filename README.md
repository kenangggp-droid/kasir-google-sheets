# Website Kasir Google Sheets

Frontend React + Vite + Tailwind CSS untuk workbook `Database_Keuangan_Toko_Terintegrasi.xlsx`.

## Fitur

- Login kasir/admin dari sheet `Users`.
- Dashboard penjualan harian, laba kotor, jumlah transaksi, dan stok menipis.
- Stok Barang untuk tambah, edit, dan nonaktifkan barang.
- Transaksi dengan pencarian nama barang/barcode dan keranjang.
- Checkout dengan diskon, pajak, metode bayar, update stok, detail invoice, dan catatan kas.
- Riwayat transaksi dari sheet `Transaksi`.

## Sheet yang Dipakai

- `Users`: login kasir/admin.
- `Barang`: stok dan harga barang.
- `Transaksi`: header invoice.
- `DetailTransaksi`: item per invoice.
- `Kas`: pencatatan pemasukan dari checkout.
- `Dashboard`: ringkasan harian berbasis formula spreadsheet.

## Menjalankan Frontend

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Isi `VITE_APPS_SCRIPT_URL` dengan URL Web App Google Apps Script.

## Release Check

```bash
pnpm release:check
```

Build output ada di folder `dist/`.

## Deploy Backend

1. Import file Excel ke Google Sheets.
2. Buka `Extensions > Apps Script`.
3. Tempel isi `apps-script/Code.gs`.
4. Deploy sebagai `Web app`.
5. Set access sesuai kebutuhan, misalnya `Anyone with the link`.
6. Salin URL `/exec` ke `.env`.

Default user dari workbook:

- Username: `admin`
- Password: `admin123`

Lihat [DEPLOYMENT.md](DEPLOYMENT.md) untuk langkah publish ke GitHub Pages atau hosting statis lain.

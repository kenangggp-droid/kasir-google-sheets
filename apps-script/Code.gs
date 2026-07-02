const SHEETS = {
  users: "Users",
  products: "Barang",
  transactions: "Transaksi",
  details: "DetailTransaksi",
  cash: "Kas",
  dashboard: "Dashboard",
};

const HEADERS = {
  products: [
    "ID Barang",
    "Barcode",
    "Nama Barang",
    "Kategori",
    "Harga Beli",
    "Harga Jual",
    "Stok",
    "Minimal Stok",
    "Satuan",
    "Status",
  ],
  transactions: [
    "No Invoice",
    "Tanggal",
    "Jam",
    "Kasir",
    "Total Item",
    "Subtotal",
    "Diskon",
    "Pajak",
    "Grand Total",
    "Bayar",
    "Kembalian",
    "Metode Bayar",
  ],
  details: ["No Invoice", "ID Barang", "Nama Barang", "Qty", "Harga", "Total"],
  cash: ["ID", "Tanggal", "Jenis", "Keterangan", "Nominal", "Referensi"],
};

const FIELD_MAP = {
  ID: "id",
  Nama: "nama",
  Username: "username",
  Password: "password",
  Role: "role",
  "ID Barang": "idBarang",
  Barcode: "barcode",
  "Nama Barang": "namaBarang",
  Kategori: "kategori",
  "Harga Beli": "hargaBeli",
  "Harga Jual": "hargaJual",
  Stok: "stok",
  "Minimal Stok": "minimalStok",
  Satuan: "satuan",
  Status: "status",
  "No Invoice": "noInvoice",
  Tanggal: "tanggal",
  Jam: "jam",
  Kasir: "kasir",
  "Total Item": "totalItem",
  Subtotal: "subtotal",
  Diskon: "diskon",
  Pajak: "pajak",
  "Grand Total": "grandTotal",
  Bayar: "bayar",
  Kembalian: "kembalian",
  "Metode Bayar": "metodeBayar",
  Jenis: "jenis",
  Keterangan: "keterangan",
  Nominal: "nominal",
  Referensi: "referensi",
};

function doGet() {
  return jsonResponse(true, { service: "Kasir Google Sheets API", status: "ready" });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const action = body.action;
    const routes = {
      login: () => login(body),
      dashboard: () => dashboard(),
      products: () => products(),
      upsertProduct: () => upsertProduct(body.product),
      deleteProduct: () => deleteProduct(body.idBarang),
      checkout: () => checkout(body.sale),
      history: () => history(),
    };

    if (!routes[action]) {
      throw new Error("Action tidak dikenal: " + action);
    }

    return jsonResponse(true, routes[action]());
  } catch (err) {
    return jsonResponse(false, null, err.message);
  }
}

function jsonResponse(ok, data, message) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: ok, data: data || null, message: message || "" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  const target = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!target) throw new Error("Sheet tidak ditemukan: " + name);
  return target;
}

function testUsers() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log(ss.getName());

  const sh = ss.getSheetByName("Users");

  Logger.log(sh.getLastRow());

  Logger.log(sh.getRange(1, 1, 2, 6).getValues());
}

function rows(name) {
  const ws = sheet(name);
  const values = ws.getDataRange().getValues();
  if (values.length < 1) return { ws: ws, headers: [], records: [] };
  const headers = values[0];
  const records = values.slice(1).filter((row) => row.some((cell) => cell !== "")).map((row, index) => ({
    rowNumber: index + 2,
    raw: row,
    object: objectFromRow(headers, row),
  }));
  return { ws: ws, headers: headers, records: records };
}

function objectFromRow(headers, row) {
  return headers.reduce((acc, header, index) => {
    const key = FIELD_MAP[header] || camel(header);
    acc[key] = row[index];
    return acc;
  }, {});
}

function rowFromObject(headers, object) {
  return headers.map((header) => {
    const key = FIELD_MAP[header] || camel(header);
    return object[key] === undefined ? "" : object[key];
  });
}

function camel(text) {
  return String(text)
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/ ([a-zA-Z0-9])/g, (_, letter) => letter.toUpperCase())
    .replace(/^./, (letter) => letter.toLowerCase());
}

function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd/MM/yyyy");
}

function normalizeDateValue(value) {
  if (!value) return "";
  if (Object.prototype.toString.call(value) === "[object Date]" && !isNaN(value.getTime())) {
    return formatDate(value);
  }

  const text = String(value).trim();
  if (!text) return "";

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  const slashMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    return `${slashMatch[1].padStart(2, "0")}/${slashMatch[2].padStart(2, "0")}/${slashMatch[3]}`;
  }

  return text;
}

function formatTime(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "HH:mm:ss");
}

function login(body) {
  const username = String(body.username || "").trim();
  const password = String(body.password || "").trim();
  const data = rows(SHEETS.users);
  const user = data.records.map((item) => item.object).find((item) =>
    String(item.Username || item.username || "").trim() === username &&
    String(item.Password || item.password || "").trim() === password &&
    String(item.Status || item.status || "").toLowerCase() === "aktif"
  );

  if (!user) throw new Error("Username atau password salah.");

  return {
    id: user.id,
    nama: user.nama,
    username: user.username,
    role: user.role,
  };
}

function products() {
  return rows(SHEETS.products).records.map((record) => normalizeProduct(record.object));
}

function normalizeProduct(item) {
  return {
    idBarang: item.idBarang || "",
    barcode: item.barcode || "",
    namaBarang: item.namaBarang || "",
    kategori: item.kategori || "",
    hargaBeli: Number(item.hargaBeli || 0),
    hargaJual: Number(item.hargaJual || 0),
    stok: Number(item.stok || 0),
    minimalStok: Number(item.minimalStok || 0),
    satuan: item.satuan || "Pcs",
    status: item.status || "Aktif",
  };
}

function upsertProduct(product) {
  if (!product || !product.idBarang || !product.namaBarang) {
    throw new Error("ID Barang dan Nama Barang wajib diisi.");
  }

  const data = rows(SHEETS.products);
  const headers = data.headers.length ? data.headers : HEADERS.products;
  ensureHeaders(data.ws, headers);

  const normalized = normalizeProduct(product);
  const existing = data.records.find((record) => String(record.object.idBarang) === String(normalized.idBarang));
  const values = rowFromObject(headers, normalized);

  if (existing) {
    data.ws.getRange(existing.rowNumber, 1, 1, headers.length).setValues([values]);
  } else {
    data.ws.appendRow(values);
  }

  return normalized;
}

function deleteProduct(idBarang) {
  if (!idBarang) throw new Error("ID Barang wajib diisi.");
  const data = rows(SHEETS.products);
  const target = data.records.find((record) => String(record.object.idBarang) === String(idBarang));
  if (!target) throw new Error("Barang tidak ditemukan.");
  const statusCol = data.headers.indexOf("Status") + 1;
  data.ws.getRange(target.rowNumber, statusCol).setValue("Nonaktif");
  return { idBarang: idBarang };
}

function dashboard() {
  const today = formatDate(new Date());
  const productList = products();
  const lowStock = productList.filter((item) =>
    item.status === "Aktif" && Number(item.stok) <= Number(item.minimalStok)
  );

  const sales = history();
  const todaySales = sales.filter((sale) => normalizeDateValue(sale.tanggal) === today);
  const cashRows = rows(SHEETS.cash).records.map((item) => item.object);
  const todayExpense = cashRows
    .filter((item) => normalizeDateValue(item.tanggal || item.Tanggal) === today && String(item.jenis || item.Jenis) === "Pengeluaran")
    .reduce((sum, item) => sum + Number(item.nominal || item.Nominal || 0), 0);
  const totalPenjualan = todaySales.reduce((sum, sale) => sum + Number(sale.grandTotal || 0), 0);

  return {
    date: today,
    summary: {
      totalPenjualan: totalPenjualan,
      totalPengeluaran: todayExpense,
      labaKotor: totalPenjualan - todayExpense,
      jumlahTransaksi: todaySales.length,
    },
    lowStock: lowStock,
  };
}

function checkout(sale) {
  if (!sale || !sale.items || !sale.items.length) {
    throw new Error("Item transaksi kosong.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const now = new Date();
    const invoice = makeInvoice(now);
    const tanggal = formatDate(now);
    const jam = formatTime(now);
    const items = sale.items.map((item) => ({
      idBarang: item.idBarang,
      namaBarang: item.namaBarang,
      qty: Number(item.qty || 0),
      harga: Number(item.harga || 0),
      total: Number(item.qty || 0) * Number(item.harga || 0),
    }));
    const totalItem = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const diskon = Number(sale.discount || 0);
    const pajak = Number(sale.tax || 0);
    const grandTotal = Math.max(0, subtotal - diskon + pajak);
    const bayar = Number(sale.paid || 0);
    const kembalian = bayar - grandTotal;

    if (kembalian < 0) throw new Error("Nominal bayar belum cukup.");

    reduceStock(items);

    appendWithHeaders(SHEETS.transactions, HEADERS.transactions, {
      noInvoice: invoice,
      tanggal: tanggal,
      jam: jam,
      kasir: sale.cashier || "",
      totalItem: totalItem,
      subtotal: subtotal,
      diskon: diskon,
      pajak: pajak,
      grandTotal: grandTotal,
      bayar: bayar,
      kembalian: kembalian,
      metodeBayar: sale.method || "Tunai",
    });

    items.forEach((item) => {
      appendWithHeaders(SHEETS.details, HEADERS.details, {
        noInvoice: invoice,
        idBarang: item.idBarang,
        namaBarang: item.namaBarang,
        qty: item.qty,
        harga: item.harga,
        total: item.total,
      });
    });

    appendWithHeaders(SHEETS.cash, HEADERS.cash, {
      id: "KAS-" + invoice,
      tanggal: tanggal,
      jenis: "Pemasukan",
      keterangan: "Penjualan " + invoice,
      nominal: grandTotal,
      referensi: invoice,
    });

    return { invoice: invoice, grandTotal: grandTotal, change: kembalian };
  } finally {
    lock.releaseLock();
  }
}

function reduceStock(items) {
  const data = rows(SHEETS.products);
  const idIndex = data.headers.indexOf("ID Barang");
  const stockIndex = data.headers.indexOf("Stok");
  if (idIndex < 0 || stockIndex < 0) throw new Error("Kolom ID Barang atau Stok tidak ditemukan.");

  items.forEach((item) => {
    const target = data.records.find((record) => String(record.raw[idIndex]) === String(item.idBarang));
    if (!target) throw new Error("Barang tidak ditemukan: " + item.idBarang);
    const stock = Number(target.raw[stockIndex] || 0);
    if (stock < item.qty) throw new Error("Stok tidak cukup untuk " + item.namaBarang);
  });

  items.forEach((item) => {
    const target = data.records.find((record) => String(record.raw[idIndex]) === String(item.idBarang));
    const stock = Number(target.raw[stockIndex] || 0);
    data.ws.getRange(target.rowNumber, stockIndex + 1).setValue(stock - item.qty);
  });
}

function history() {
  return rows(SHEETS.transactions).records.map((record) => ({
    noInvoice: record.object.noInvoice,
    tanggal: normalizeDateValue(record.object.tanggal),
    jam: record.object.jam,
    kasir: record.object.kasir,
    totalItem: Number(record.object.totalItem || 0),
    subtotal: Number(record.object.subtotal || 0),
    diskon: Number(record.object.diskon || 0),
    pajak: Number(record.object.pajak || 0),
    grandTotal: Number(record.object.grandTotal || 0),
    bayar: Number(record.object.bayar || 0),
    kembalian: Number(record.object.kembalian || 0),
    metodeBayar: record.object.metodeBayar,
  })).reverse();
}

function appendWithHeaders(sheetName, headers, object) {
  const ws = sheet(sheetName);
  ensureHeaders(ws, headers);
  ws.appendRow(rowFromObject(headers, object));
}

function ensureHeaders(ws, headers) {
  if (ws.getLastRow() === 0) {
    ws.appendRow(headers);
    return;
  }
  const existing = ws.getRange(1, 1, 1, headers.length).getValues()[0];
  const missing = headers.some((header, index) => existing[index] !== header);
  if (missing) {
    ws.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
}

function makeInvoice(date) {
  const stamp = Utilities.formatDate(date, Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");
  return "INV-" + stamp;
}

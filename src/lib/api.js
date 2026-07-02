const DEMO_KEY = "kasir_demo_store";
const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

const demoSeed = {
  users: [
    {
      id: 1,
      nama: "Admin",
      username: "admin",
      password: "admin123",
      role: "ADMIN",
      status: "Aktif",
    },
    {
      id: 2,
      nama: "Kasir",
      username: "kasir",
      password: "kasir123",
      role: "KASIR",
      status: "Aktif",
    },
  ],
  products: [
    {
      idBarang: "BRG001",
      barcode: "899001",
      namaBarang: "Indomie Goreng",
      kategori: "Makanan",
      hargaBeli: 2800,
      hargaJual: 3500,
      stok: 120,
      minimalStok: 20,
      satuan: "Pcs",
      status: "Aktif",
    },
    {
      idBarang: "BRG002",
      barcode: "899002",
      namaBarang: "Aqua 600ml",
      kategori: "Minuman",
      hargaBeli: 2600,
      hargaJual: 4000,
      stok: 12,
      minimalStok: 15,
      satuan: "Botol",
      status: "Aktif",
    },
    {
      idBarang: "BRG003",
      barcode: "899003",
      namaBarang: "Kopi Sachet",
      kategori: "Minuman",
      hargaBeli: 1000,
      hargaJual: 1500,
      stok: 80,
      minimalStok: 25,
      satuan: "Pcs",
      status: "Aktif",
    },
  ],
  transactions: [],
  details: [],
  cash: [],
};

function hasRealApiUrl() {
  return API_URL && !API_URL.includes("YOUR_DEPLOYMENT_ID");
}

async function request(action, payload = {}) {
  if (!hasRealApiUrl()) {
    return demoRequest(action, payload);
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({ action, ...payload }),
    });

    const data = await response.json();
    if (!data.ok) {
      throw new Error(data.message || "Request gagal.");
    }
    return data.data;
  } 
catch (error) {
  console.error("Apps Script Error:", error);
  throw error;
}
}

function getStore() {
  const saved = localStorage.getItem(DEMO_KEY);
  if (saved) {
    const store = mergeDemoSeed(JSON.parse(saved));
    saveStore(store);
    return store;
  }

  const store = structuredClone(demoSeed);
  saveStore(store);
  return store;
}

function saveStore(store) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(store));
}

function mergeDemoSeed(store) {
  const nextStore = {
    users: store.users || [],
    products: store.products || [],
    transactions: store.transactions || [],
    details: store.details || [],
    cash: store.cash || [],
  };

  demoSeed.users.forEach((seedUser) => {
    if (!nextStore.users.some((user) => user.username === seedUser.username)) {
      nextStore.users.push(seedUser);
    }
  });

  demoSeed.products.forEach((seedProduct) => {
    if (!nextStore.products.some((product) => product.idBarang === seedProduct.idBarang)) {
      nextStore.products.push(seedProduct);
    }
  });

  return nextStore;
}

function demoRequest(action, payload) {
  const store = getStore();
  const routes = {
    login: () => demoLogin(store, payload),
    dashboard: () => demoDashboard(store),
    products: () => store.products,
    upsertProduct: () => demoUpsertProduct(store, payload.product),
    deleteProduct: () => demoDeleteProduct(store, payload.idBarang),
    checkout: () => demoCheckout(store, payload.sale),
    history: () => [...store.transactions].reverse(),
  };

  if (!routes[action]) {
    throw new Error(`Action tidak dikenal: ${action}`);
  }

  return Promise.resolve(routes[action]());
}

function demoLogin(store, { username, password }) {
  const user = store.users.find(
    (item) =>
      item.username === username &&
      item.password === password &&
      String(item.status).toLowerCase() === "aktif"
  );

  if (!user) {
    throw new Error("Username atau password salah.");
  }

  return {
    id: user.id,
    nama: user.nama,
    username: user.username,
    role: user.role,
  };
}

function demoDashboard(store) {
  const today = formatDate(new Date());
  const todaySales = store.transactions.filter((sale) => sale.tanggal === today);
  const todayExpense = store.cash
    .filter((item) => item.tanggal === today && item.jenis === "Pengeluaran")
    .reduce((sum, item) => sum + Number(item.nominal || 0), 0);
  const totalPenjualan = todaySales.reduce((sum, sale) => sum + Number(sale.grandTotal || 0), 0);
  const lowStock = store.products.filter(
    (item) => item.status === "Aktif" && Number(item.stok) <= Number(item.minimalStok)
  );

  return {
    date: today,
    summary: {
      totalPenjualan,
      totalPengeluaran: todayExpense,
      labaKotor: totalPenjualan - todayExpense,
      jumlahTransaksi: todaySales.length,
    },
    lowStock,
  };
}

function demoUpsertProduct(store, product) {
  if (!product?.idBarang || !product?.namaBarang) {
    throw new Error("ID Barang dan Nama Barang wajib diisi.");
  }

  const normalized = {
    idBarang: product.idBarang,
    barcode: product.barcode || "",
    namaBarang: product.namaBarang,
    kategori: product.kategori || "",
    hargaBeli: Number(product.hargaBeli || 0),
    hargaJual: Number(product.hargaJual || 0),
    stok: Number(product.stok || 0),
    minimalStok: Number(product.minimalStok || 0),
    satuan: product.satuan || "Pcs",
    status: product.status || "Aktif",
  };
  const index = store.products.findIndex((item) => item.idBarang === normalized.idBarang);

  if (index >= 0) {
    store.products[index] = normalized;
  } else {
    store.products.push(normalized);
  }

  saveStore(store);
  return normalized;
}

function demoDeleteProduct(store, idBarang) {
  const product = store.products.find((item) => item.idBarang === idBarang);
  if (!product) {
    throw new Error("Barang tidak ditemukan.");
  }

  product.status = "Nonaktif";
  saveStore(store);
  return { idBarang };
}

function demoCheckout(store, sale) {
  if (!sale?.items?.length) {
    throw new Error("Item transaksi kosong.");
  }

  sale.items.forEach((item) => {
    const product = store.products.find((target) => target.idBarang === item.idBarang);
    if (!product) throw new Error(`Barang tidak ditemukan: ${item.idBarang}`);
    if (Number(product.stok) < Number(item.qty)) throw new Error(`Stok tidak cukup untuk ${item.namaBarang}`);
  });

  const now = new Date();
  const invoice = makeInvoice(now);
  const tanggal = formatDate(now);
  const jam = formatTime(now);
  const items = sale.items.map((item) => ({
    noInvoice: invoice,
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

  if (kembalian < 0) {
    throw new Error("Nominal bayar belum cukup.");
  }

  items.forEach((item) => {
    const product = store.products.find((target) => target.idBarang === item.idBarang);
    product.stok = Number(product.stok) - item.qty;
  });

  const transaction = {
    noInvoice: invoice,
    tanggal,
    jam,
    kasir: sale.cashier || "Admin",
    totalItem,
    subtotal,
    diskon,
    pajak,
    grandTotal,
    bayar,
    kembalian,
    metodeBayar: sale.method || "Tunai",
  };

  store.transactions.push(transaction);
  store.details.push(...items);
  store.cash.push({
    id: `KAS-${invoice}`,
    tanggal,
    jenis: "Pemasukan",
    keterangan: `Penjualan ${invoice}`,
    nominal: grandTotal,
    referensi: invoice,
  });
  saveStore(store);

  return { invoice, grandTotal, change: kembalian };
}

function formatDate(date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function makeInvoice(date) {
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "-",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
  return `INV-${stamp}`;
}

export const api = {
  login: (username, password) => request("login", { username, password }),
  dashboard: () => request("dashboard"),
  products: () => request("products"),
  upsertProduct: (product) => request("upsertProduct", { product }),
  deleteProduct: (idBarang) => request("deleteProduct", { idBarang }),
  checkout: (sale) => request("checkout", { sale }),
  history: () => request("history"),
};

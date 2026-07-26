export const PAGES = {
  dashboard: "dashboard",
  showcase: "etalase",
  stock: "stok",
  sales: "transaksi",
  checkout: "checkout",
  history: "riwayat",
};

const cashierPages = [PAGES.showcase, PAGES.sales, PAGES.checkout];
const adminPages = [PAGES.dashboard, PAGES.showcase, PAGES.stock, PAGES.sales, PAGES.checkout, PAGES.history];

export function isCashier(user) {
  return String(user?.role || "").toUpperCase() === "KASIR";
}

export function allowedPagesFor(user) {
  return isCashier(user) ? cashierPages : adminPages;
}

export function defaultPageFor(user) {
  return isCashier(user) ? PAGES.sales : PAGES.dashboard;
}

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL;

async function request(action, payload = {}) {
  if (!API_URL || API_URL.includes("YOUR_DEPLOYMENT_ID")) {
    throw new Error("VITE_APPS_SCRIPT_URL belum diisi.");
  }

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

export const api = {
  login: (username, password) => request("login", { username, password }),
  dashboard: () => request("dashboard"),
  products: () => request("products"),
  upsertProduct: (product) => request("upsertProduct", { product }),
  deleteProduct: (idBarang) => request("deleteProduct", { idBarang }),
  checkout: (sale) => request("checkout", { sale }),
  history: () => request("history"),
};

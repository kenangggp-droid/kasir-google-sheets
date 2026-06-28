import { useEffect, useMemo, useState } from "react";
import { Barcode, Search, ShoppingCart } from "lucide-react";
import { Button } from "../components/Button";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { rupiah } from "../lib/format";

export function Sales({ setPage }) {
  const { items, addItem, totalQty, subtotal } = useCart();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.products()
      .then((data) => setProducts(data.filter((item) => item.status === "Aktif")))
      .catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return products.filter((item) =>
      [item.idBarang, item.barcode, item.namaBarang, item.kategori].join(" ").toLowerCase().includes(text)
    );
  }, [products, query]);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <section className="rounded-md border border-line bg-white shadow-panel">
        <div className="flex items-center gap-2 border-b border-line p-4">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Scan barcode atau cari nama barang"
            className="min-h-10 w-full outline-none"
            autoFocus
          />
        </div>
        {error ? <p className="m-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="grid gap-3 p-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.map((item) => (
            <button
              key={item.idBarang}
              onClick={() => addItem(item)}
              disabled={Number(item.stok || 0) <= 0}
              className="rounded-md border border-line bg-white p-4 text-left transition hover:border-teal hover:shadow-panel disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{item.namaBarang}</p>
                  <p className="text-xs text-slate-500">{item.idBarang}</p>
                </div>
                <Barcode size={18} className="text-slate-400" />
              </div>
              <div className="flex items-end justify-between gap-3">
                <p className="text-lg font-bold text-teal">{rupiah.format(item.hargaJual || 0)}</p>
                <p className="text-sm text-slate-500">Stok {item.stok}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <aside className="rounded-md border border-line bg-white p-4 shadow-panel">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart size={20} className="text-teal" />
          <h2 className="text-lg font-bold">Keranjang</h2>
        </div>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.idBarang} className="rounded-md bg-slate-50 p-3">
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{item.namaBarang}</p>
                <p>{item.qty}x</p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{rupiah.format(item.harga * item.qty)}</p>
            </div>
          ))}
          {!items.length ? <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">Keranjang kosong.</p> : null}
        </div>
        <div className="my-4 border-t border-line pt-4">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Total item</span>
            <span>{totalQty}</span>
          </div>
          <div className="mt-2 flex justify-between text-lg font-bold">
            <span>Subtotal</span>
            <span>{rupiah.format(subtotal)}</span>
          </div>
        </div>
        <Button className="w-full" disabled={!items.length} onClick={() => setPage("checkout")}>
          Checkout
        </Button>
      </aside>
    </div>
  );
}

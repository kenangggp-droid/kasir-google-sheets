import { useEffect, useMemo, useState } from "react";
import {
  BatteryCharging,
  Cable,
  Check,
  Fan,
  Lightbulb,
  PackageSearch,
  Plug,
  Search,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "../components/Button";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { rupiah } from "../lib/format";

const electronicsKeywords = [
  "elektronik",
  "listrik",
  "lampu",
  "kabel",
  "charger",
  "baterai",
  "battery",
  "stop kontak",
  "saklar",
  "adaptor",
  "kipas",
  "led",
  "plug",
  "terminal",
];

const categories = [
  { key: "semua", label: "Semua" },
  { key: "lampu", label: "Lampu" },
  { key: "listrik", label: "Listrik" },
  { key: "aksesoris", label: "Aksesoris" },
];

export function Showcase({ setPage }) {
  const { items, addItem, totalQty, subtotal } = useCart();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("semua");
  const [addedId, setAddedId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.products()
      .then((data) => setProducts(data.filter((item) => item.status === "Aktif")))
      .catch((err) => setError(err.message));
  }, []);

  const displayProducts = useMemo(() => {
    const text = query.toLowerCase();
    const activeElectronics = products.filter(isElectronicProduct);
    const source = activeElectronics.length ? activeElectronics : products;

    return source.filter((item) => {
      const haystack = [item.idBarang, item.barcode, item.namaBarang, item.kategori].join(" ").toLowerCase();
      const matchesQuery = haystack.includes(text);
      const matchesCategory = category === "semua" || productGroup(item) === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  function handleAdd(product) {
    addItem(product);
    setAddedId(product.idBarang);
    window.setTimeout(() => setAddedId(""), 900);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_330px]">
      <section className="space-y-5">
        <div className="relative overflow-hidden rounded-md bg-ink p-5 text-white shadow-lift">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(255,183,77,0.38),transparent_38%),radial-gradient(circle_at_bottom,rgba(0,137,123,0.34),transparent_42%)]" />
          <div className="relative grid gap-5 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-mint ring-1 ring-white/15">
                <Sparkles size={16} />
                Etalase Elektronik
              </div>
              <h2 className="max-w-2xl text-2xl font-black sm:text-3xl">
                Pilih produk dari etalase, masuk keranjang, lalu lanjut checkout kasir.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/72">
                Harga dan stok diambil dari database Google Sheets yang sama dengan kasir, jadi katalog tetap sinkron saat transaksi berjalan.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {heroTiles.map((tile) => {
                const Icon = tile.icon;
                return (
                  <div key={tile.label} className="rounded-md bg-white/10 p-3 ring-1 ring-white/15 backdrop-blur">
                    <Icon size={24} className={tile.color} />
                    <p className="mt-3 text-sm font-bold">{tile.label}</p>
                    <p className="text-xs text-white/55">{tile.caption}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-md">
          <div className="flex flex-wrap items-center gap-3 border-b border-line p-4">
            <div className="control-surface flex min-h-10 flex-1 items-center gap-2 rounded-md px-3">
              <Search size={18} className="text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari lampu, kabel, barcode, atau kategori"
                className="w-full outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`min-h-10 shrink-0 rounded-md px-3 text-sm font-bold transition ${
                    category === item.key
                      ? "bg-teal text-white shadow-lift"
                      : "bg-white/82 text-slate-600 ring-1 ring-line hover:text-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {error ? <p className="m-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <div className="grid gap-4 p-4 sm:grid-cols-2 2xl:grid-cols-3">
            {displayProducts.map((item) => (
              <ProductCard
                key={item.idBarang}
                added={addedId === item.idBarang}
                item={item}
                onAdd={() => handleAdd(item)}
              />
            ))}
            {!displayProducts.length ? (
              <div className="col-span-full rounded-md bg-white/72 p-8 text-center ring-1 ring-line">
                <PackageSearch className="mx-auto text-slate-400" size={34} />
                <p className="mt-3 font-bold">Produk belum ditemukan.</p>
                <p className="mt-1 text-sm text-slate-500">Coba kata kunci lain atau pilih filter Semua.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <aside className="glass-panel h-fit rounded-md p-4 xl:sticky xl:top-24">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart size={20} className="text-teal" />
          <h2 className="text-lg font-bold">Keranjang Etalase</h2>
        </div>
        <div className="space-y-3">
          {items.slice(0, 5).map((item) => (
            <div key={item.idBarang} className="rounded-md bg-white/72 p-3 ring-1 ring-line/70">
              <div className="flex justify-between gap-3">
                <p className="font-semibold">{item.namaBarang}</p>
                <p className="shrink-0">{item.qty}x</p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{rupiah.format(item.harga * item.qty)}</p>
            </div>
          ))}
          {!items.length ? (
            <p className="rounded-md bg-white/72 p-4 text-sm text-slate-500 ring-1 ring-line/70">
              Belum ada produk dari etalase.
            </p>
          ) : null}
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
        <div className="grid gap-2">
          <Button className="w-full" disabled={!items.length} onClick={() => setPage("checkout")}>
            Checkout
          </Button>
          <Button type="button" variant="secondary" onClick={() => setPage("transaksi")}>
            Mode Kasir
          </Button>
        </div>
      </aside>
    </div>
  );
}

function ProductCard({ added, item, onAdd }) {
  const Icon = iconForProduct(item);
  const stock = Number(item.stok || 0);
  const isEmpty = stock <= 0;

  return (
    <article className="group overflow-hidden rounded-md bg-white/86 shadow-panel ring-1 ring-line transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#e8f7f3,#fff8ea)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_20%,rgba(0,137,123,0.18),transparent_28%),radial-gradient(circle_at_78%_72%,rgba(255,107,79,0.16),transparent_30%)]" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-md bg-white/84 shadow-lift ring-1 ring-white">
          <Icon size={44} className="text-teal" />
        </div>
        <span className="absolute left-3 top-3 rounded-md bg-white/86 px-2 py-1 text-xs font-bold text-slate-600 ring-1 ring-line">
          {item.kategori || productGroupLabel(item)}
        </span>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black leading-tight">{item.namaBarang}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">{item.idBarang} {item.barcode ? `- ${item.barcode}` : ""}</p>
          </div>
          <span className={`rounded-md px-2 py-1 text-xs font-bold ${isEmpty ? "bg-red-50 text-red-700" : "bg-mint text-teal"}`}>
            {isEmpty ? "Habis" : `Stok ${stock}`}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Harga</p>
            <p className="text-xl font-black text-teal">{rupiah.format(item.hargaJual || 0)}</p>
          </div>
          <Button type="button" onClick={onAdd} disabled={isEmpty}>
            {added ? <Check size={17} /> : <ShoppingCart size={17} />}
            {added ? "Masuk" : "Tambah"}
          </Button>
        </div>
      </div>
    </article>
  );
}

const heroTiles = [
  { label: "Lampu", caption: "LED & bohlam", icon: Lightbulb, color: "text-amber-300" },
  { label: "Daya", caption: "Plug & kabel", icon: Plug, color: "text-mint" },
  { label: "Aksesoris", caption: "Siap jual", icon: Zap, color: "text-coral" },
];

function isElectronicProduct(item) {
  const text = [item.namaBarang, item.kategori].join(" ").toLowerCase();
  return electronicsKeywords.some((keyword) => text.includes(keyword));
}

function productGroup(item) {
  const text = [item.namaBarang, item.kategori].join(" ").toLowerCase();
  if (text.includes("lampu") || text.includes("led")) return "lampu";
  if (text.includes("listrik") || text.includes("kabel") || text.includes("plug") || text.includes("stop kontak") || text.includes("saklar")) {
    return "listrik";
  }
  return "aksesoris";
}

function productGroupLabel(item) {
  const group = productGroup(item);
  return categories.find((category) => category.key === group)?.label || "Produk";
}

function iconForProduct(item) {
  const text = [item.namaBarang, item.kategori].join(" ").toLowerCase();
  if (text.includes("lampu") || text.includes("led")) return Lightbulb;
  if (text.includes("kabel")) return Cable;
  if (text.includes("charger") || text.includes("baterai") || text.includes("battery")) return BatteryCharging;
  if (text.includes("kipas")) return Fan;
  if (text.includes("plug") || text.includes("stop kontak") || text.includes("saklar")) return Plug;
  return Zap;
}

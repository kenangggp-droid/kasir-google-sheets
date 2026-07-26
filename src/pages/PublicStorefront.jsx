import { useEffect, useMemo, useState } from "react";
import {
  BatteryCharging,
  Cable,
  CheckCircle2,
  Fan,
  Lightbulb,
  Minus,
  PackageCheck,
  Plus,
  Plug,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  UserRound,
  Zap,
} from "lucide-react";
import { Button } from "../components/Button";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { rupiah } from "../lib/format";

const categoryCards = [
  { key: "semua", label: "Semua Produk", caption: "Siap checkout", icon: ShoppingBag },
  { key: "lampu", label: "Lampu", caption: "LED, bohlam, gantung", icon: Lightbulb },
  { key: "listrik", label: "Stop Kontak & Kabel", caption: "Daya dan instalasi", icon: Plug },
  { key: "aksesoris", label: "Aksesoris Lainnya", caption: "Pelengkap elektronik", icon: Zap },
];

const featureCards = [
  { label: "Produk Bergaransi", caption: "Barang original dan dicek sebelum dikirim", icon: ShieldCheck },
  { label: "Pengiriman Cepat", caption: "Pesanan diproses langsung oleh toko", icon: Truck },
  { label: "Checkout Terhubung", caption: "Order masuk ke sistem kasir toko", icon: PackageCheck },
];

const electronicKeywords = [
  "elektronik",
  "listrik",
  "lampu",
  "led",
  "kabel",
  "charger",
  "baterai",
  "battery",
  "stop kontak",
  "saklar",
  "adaptor",
  "kipas",
  "plug",
  "terminal",
];

export function PublicStorefront({ onLogin }) {
  const { items, addItem, updateQty, removeItem, clearCart, subtotal, totalQty } = useCart();
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("semua");
  const [addedId, setAddedId] = useState("");
  const [customer, setCustomer] = useState({ nama: "", phone: "", alamat: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.products()
      .then((data) => setProducts(data.filter((item) => item.status === "Aktif")))
      .catch((err) => setError(err.message));
  }, []);

  const storefrontProducts = useMemo(() => {
    const electronics = products.filter(isElectronicProduct);
    const source = electronics.length ? electronics : products;
    const text = query.toLowerCase();

    return source.filter((item) => {
      const haystack = [item.idBarang, item.barcode, item.namaBarang, item.kategori].join(" ").toLowerCase();
      return haystack.includes(text) && (category === "semua" || productGroup(item) === category);
    });
  }, [products, query, category]);

  const heroProducts = storefrontProducts.slice(0, 4);

  function handleAdd(product) {
    addItem(product);
    setAddedId(product.idBarang);
    window.setTimeout(() => setAddedId(""), 900);
  }

  async function submitOrder(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      if (!items.length) throw new Error("Keranjang masih kosong.");
      if (!customer.nama.trim()) throw new Error("Nama pelanggan wajib diisi.");

      setLoading(true);
      const now = new Date();
      const result = await api.checkout({
        cashier: `Pelanggan Online - ${customer.nama.trim()}`,
        items,
        discount: 0,
        tax: 0,
        paid: subtotal,
        method: "COD",
        localDate: formatLocalDate(now),
        localTime: formatLocalTime(now),
        localInvoiceStamp: formatInvoiceStamp(now),
      });

      setMessage(`Pesanan berhasil dibuat. Invoice ${result.invoice} sudah masuk ke kasir.`);
      clearCart();
      setCustomer({ nama: "", phone: "", alamat: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-[#14171a]">
      <div className="mx-auto max-w-[1480px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="sticky top-3 z-30 mb-4 rounded-md bg-[#101418]/94 px-4 py-3 text-white shadow-lift backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-400 text-ink">
                <Lightbulb size={22} />
              </div>
              <div>
                <p className="text-lg font-black leading-none">LUMINA</p>
                <p className="text-[11px] font-medium text-white/55">Lighting & Electronics</p>
              </div>
            </div>
            <nav className="hidden items-center gap-2 lg:flex">
              {categoryCards.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                    category === item.key ? "bg-amber-400 text-ink" : "text-white/74 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label.replace("Stop Kontak & Kabel", "Elektronik")}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a href="#produk" className="hidden rounded-md p-2 text-white/78 transition hover:bg-white/10 hover:text-white sm:inline-flex">
                <Search size={20} />
              </a>
              <a href="#keranjang" className="relative rounded-md p-2 text-white/78 transition hover:bg-white/10 hover:text-white">
                <ShoppingCart size={20} />
                {totalQty ? (
                  <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1.5 text-[11px] font-black text-ink">
                    {totalQty}
                  </span>
                ) : null}
              </a>
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-2 rounded-md border border-white/14 px-3 py-2 text-sm font-bold text-white/82 transition hover:bg-white hover:text-ink"
              >
                <UserRound size={17} />
                Kasir
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[430px] overflow-hidden rounded-md bg-[#e7dfd2] shadow-panel">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_30%,rgba(255,193,58,0.32),transparent_18%),linear-gradient(90deg,rgba(245,238,226,0.96),rgba(245,238,226,0.38)_58%,rgba(22,24,25,0.12))]" />
            <div className="absolute right-[16%] top-0 h-44 w-32 border-x-2 border-[#191b1d]/70">
              <div className="absolute bottom-0 left-1/2 flex h-24 w-44 -translate-x-1/2 items-center justify-center rounded-b-full bg-[#151719] shadow-2xl">
                <div className="h-11 w-24 rounded-b-full bg-amber-200 blur-md" />
              </div>
            </div>
            <div className="absolute bottom-10 right-8 hidden h-48 w-32 rounded-t-full bg-[#d7b16d] shadow-lift sm:block">
              <div className="mx-auto mt-8 h-28 w-24 rounded-full bg-amber-100/80 shadow-[0_0_55px_rgba(255,207,111,0.78)]" />
              <div className="mx-auto h-16 w-2 bg-[#6b4b28]" />
            </div>
            <div className="relative flex min-h-[430px] max-w-xl flex-col justify-center px-6 py-12 sm:px-10">
              <h1 className="text-4xl font-black leading-tight sm:text-5xl">
                Cahaya tepat, hidup lebih nyaman.
              </h1>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-700">
                Temukan lampu dan alat elektronik pilihan. Checkout dari website ini langsung masuk ke sistem kasir toko.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#produk" className="inline-flex min-h-11 items-center gap-2 rounded-md bg-amber-400 px-5 text-sm font-black text-ink shadow-lift transition hover:-translate-y-0.5">
                  Belanja Sekarang
                  <Sparkles size={17} />
                </a>
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex min-h-11 items-center gap-2 rounded-md bg-white/82 px-5 text-sm font-black text-ink ring-1 ring-black/5 transition hover:-translate-y-0.5"
                >
                  Login Kasir
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <section className="rounded-md bg-white p-4 shadow-panel">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-black">Jelajahi Kategori</h2>
                <a href="#produk" className="text-sm font-bold text-slate-500 hover:text-teal">Lihat semua</a>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {categoryCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setCategory(item.key)}
                      className="group relative min-h-28 overflow-hidden rounded-md bg-[#151719] p-4 text-left text-white"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_20%,rgba(255,193,58,0.26),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.12),transparent)] transition group-hover:scale-110" />
                      <Icon className="relative mb-5 text-amber-300" size={28} />
                      <p className="relative font-black">{item.label}</p>
                      <p className="relative text-xs text-white/62">{item.caption}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-md bg-[#111820] p-6 text-white shadow-panel">
              <div className="absolute right-0 top-0 h-full w-2/5 bg-[radial-gradient(circle_at_center,rgba(255,193,58,0.28),transparent_48%)]" />
              <div className="relative max-w-md">
                <p className="text-xs font-black uppercase tracking-wide text-amber-300">Promo Spesial</p>
                <h2 className="mt-3 text-3xl font-black">Diskon hingga 30% untuk lampu pilihan</h2>
                <p className="mt-3 text-sm text-white/62">Promo toko dapat disesuaikan kapan saja dari kode frontend.</p>
              </div>
            </section>
          </div>
        </section>

        <section className="my-4 grid gap-3 rounded-md bg-white p-4 shadow-panel md:grid-cols-3">
          {featureCards.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-50 text-amber-600">
                  <Icon size={21} />
                </div>
                <div>
                  <p className="font-black">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.caption}</p>
                </div>
              </div>
            );
          })}
        </section>

        <section id="produk" className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="rounded-md bg-white p-4 shadow-panel">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="control-surface flex min-h-11 flex-1 items-center gap-2 rounded-md px-3">
                <Search size={18} className="text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari lampu, kabel, stop kontak..."
                  className="w-full outline-none"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categoryCards.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setCategory(item.key)}
                    className={`min-h-10 shrink-0 rounded-md px-3 text-sm font-black transition ${
                      category === item.key
                        ? "bg-[#111820] text-white"
                        : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            {error ? <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {storefrontProducts.map((item) => (
                <ProductCard
                  key={item.idBarang}
                  added={addedId === item.idBarang}
                  item={item}
                  onAdd={() => handleAdd(item)}
                />
              ))}
            </div>
            {!storefrontProducts.length ? (
              <p className="rounded-md bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                Produk belum ditemukan.
              </p>
            ) : null}
          </div>

          <aside id="keranjang" className="h-fit rounded-md bg-white p-4 shadow-panel lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-black">Keranjang Belanja</h2>
                <p className="text-sm text-slate-500">{totalQty} item dipilih</p>
              </div>
              <ShoppingCart className="text-amber-500" size={24} />
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <CartLine
                  item={item}
                  key={item.idBarang}
                  onRemove={() => removeItem(item.idBarang)}
                  onUpdate={(qty) => updateQty(item.idBarang, qty)}
                />
              ))}
              {!items.length ? (
                <p className="rounded-md bg-slate-50 p-4 text-sm text-slate-500">Keranjang masih kosong.</p>
              ) : null}
            </div>

            <form onSubmit={submitOrder} className="mt-5 space-y-3 border-t border-line pt-4">
              <label className="block">
                <span className="mb-1 block text-sm font-bold">Nama Pelanggan</span>
                <input
                  value={customer.nama}
                  onChange={(event) => setCustomer({ ...customer, nama: event.target.value })}
                  className="control-surface min-h-10 w-full rounded-md px-3 outline-none"
                  placeholder="Nama penerima"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-bold">No. HP</span>
                <input
                  value={customer.phone}
                  onChange={(event) => setCustomer({ ...customer, phone: event.target.value })}
                  className="control-surface min-h-10 w-full rounded-md px-3 outline-none"
                  placeholder="Opsional"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-bold">Alamat</span>
                <textarea
                  value={customer.alamat}
                  onChange={(event) => setCustomer({ ...customer, alamat: event.target.value })}
                  className="control-surface min-h-20 w-full resize-none rounded-md px-3 py-2 outline-none"
                  placeholder="Opsional"
                />
              </label>

              <div className="space-y-2 border-y border-line py-4">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{rupiah.format(subtotal)}</span>
                </div>
                <div className="flex justify-between text-lg font-black">
                  <span>Total COD</span>
                  <span className="text-teal">{rupiah.format(subtotal)}</span>
                </div>
              </div>

              {message ? <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
              {error ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

              <Button className="w-full bg-amber-400 text-ink hover:bg-amber-300" disabled={!items.length || loading}>
                {loading ? "Memproses..." : "Checkout COD"}
              </Button>
            </form>
          </aside>
        </section>

        <section className="my-4 grid gap-4 rounded-md bg-[#111820] p-6 text-white shadow-panel md:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-400 text-ink">
                <Lightbulb size={22} />
              </div>
              <div>
                <p className="text-lg font-black">LUMINA</p>
                <p className="text-xs text-white/55">Lighting & Electronics</p>
              </div>
            </div>
            <p className="max-w-lg text-sm leading-6 text-white/62">
              Toko online sederhana yang tersambung langsung dengan kasir Google Sheets POS.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {heroProducts.map((item) => (
              <div key={item.idBarang} className="rounded-md bg-white/8 p-3 ring-1 ring-white/10">
                <p className="font-bold">{item.namaBarang}</p>
                <p className="mt-1 text-sm text-amber-300">{rupiah.format(item.hargaJual || 0)}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ProductCard({ added, item, onAdd }) {
  const Icon = iconForProduct(item);
  const stock = Number(item.stok || 0);
  const isEmpty = stock <= 0;

  return (
    <article className="overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-slate-200 transition duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#ebe5dc,#f8f8f5)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,193,58,0.28),transparent_28%),radial-gradient(circle_at_22%_82%,rgba(0,137,123,0.16),transparent_34%)]" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-md bg-white/84 shadow-lift">
          <Icon size={44} className="text-[#111820]" />
        </div>
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-black leading-tight">{item.namaBarang}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">{item.idBarang}</p>
          </div>
          <span className={`rounded-md px-2 py-1 text-xs font-black ${isEmpty ? "bg-red-50 text-red-700" : "bg-emerald-50 text-teal"}`}>
            {isEmpty ? "Habis" : `Stok ${stock}`}
          </span>
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Harga</p>
            <p className="text-xl font-black">{rupiah.format(item.hargaJual || 0)}</p>
          </div>
          <Button type="button" onClick={onAdd} disabled={isEmpty}>
            {added ? <CheckCircle2 size={17} /> : <ShoppingCart size={17} />}
            {added ? "Masuk" : "Tambah"}
          </Button>
        </div>
      </div>
    </article>
  );
}

function CartLine({ item, onRemove, onUpdate }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-black">{item.namaBarang}</p>
          <p className="text-sm text-slate-500">{rupiah.format(item.harga)}</p>
        </div>
        <button type="button" onClick={onRemove} className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => onUpdate(item.qty - 1)} className="flex h-8 w-8 items-center justify-center rounded-md bg-white ring-1 ring-slate-200">
            <Minus size={14} />
          </button>
          <span className="w-8 text-center font-black">{item.qty}</span>
          <button type="button" onClick={() => onUpdate(item.qty + 1)} className="flex h-8 w-8 items-center justify-center rounded-md bg-white ring-1 ring-slate-200">
            <Plus size={14} />
          </button>
        </div>
        <p className="font-black">{rupiah.format(item.harga * item.qty)}</p>
      </div>
    </div>
  );
}

function isElectronicProduct(item) {
  const text = [item.namaBarang, item.kategori].join(" ").toLowerCase();
  return electronicKeywords.some((keyword) => text.includes(keyword));
}

function productGroup(item) {
  const text = [item.namaBarang, item.kategori].join(" ").toLowerCase();
  if (text.includes("lampu") || text.includes("led") || text.includes("bohlam")) return "lampu";
  if (text.includes("listrik") || text.includes("kabel") || text.includes("plug") || text.includes("stop kontak") || text.includes("saklar")) {
    return "listrik";
  }
  return "aksesoris";
}

function iconForProduct(item) {
  const text = [item.namaBarang, item.kategori].join(" ").toLowerCase();
  if (text.includes("lampu") || text.includes("led") || text.includes("bohlam")) return Lightbulb;
  if (text.includes("kabel")) return Cable;
  if (text.includes("charger") || text.includes("baterai") || text.includes("battery")) return BatteryCharging;
  if (text.includes("kipas")) return Fan;
  if (text.includes("plug") || text.includes("stop kontak") || text.includes("saklar")) return Plug;
  return Zap;
}

function formatLocalDate(date) {
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    date.getFullYear(),
  ].join("/");
}

function formatLocalTime(date) {
  return [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join(":");
}

function formatInvoiceStamp(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    "-",
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join("");
}

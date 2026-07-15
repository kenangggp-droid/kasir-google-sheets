import { useEffect, useMemo, useState } from "react";
import { Pencil, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import { Button } from "../components/Button";
import { api } from "../lib/api";
import { rupiah } from "../lib/format";

const emptyProduct = {
  idBarang: "",
  barcode: "",
  namaBarang: "",
  kategori: "",
  hargaBeli: 0,
  hargaJual: 0,
  stok: 0,
  minimalStok: 0,
  satuan: "Pcs",
  status: "Aktif",
};

export function Stock() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(emptyProduct);
  const [stockCorrections, setStockCorrections] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    try {
      const data = await api.products();
      setProducts(data);
      setStockCorrections(
        data.reduce((acc, item) => {
          acc[item.idBarang] = Number(item.stok || 0);
          return acc;
        }, {})
      );
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return products.filter((item) =>
      [item.idBarang, item.barcode, item.namaBarang, item.kategori].join(" ").toLowerCase().includes(text)
    );
  }, [products, query]);

  async function save(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      const saved = await api.upsertProduct(editing);
      setMessage(`${saved.namaBarang} tersimpan.`);
      setEditing(emptyProduct);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(idBarang) {
    setMessage("");
    setError("");
    try {
      await api.deleteProduct(idBarang);
      setMessage(`${idBarang} dinonaktifkan.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function correctStock(item) {
    setMessage("");
    setError("");
    try {
      const nextStock = Number(stockCorrections[item.idBarang] ?? item.stok ?? 0);
      if (Number.isNaN(nextStock) || nextStock < 0) {
        throw new Error("Stok koreksi harus berupa angka 0 atau lebih.");
      }

      const saved = await api.upsertProduct({ ...item, stok: nextStock });
      setMessage(`Stok ${saved.namaBarang} dikoreksi menjadi ${saved.stok} ${saved.satuan}.`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[390px_1fr]">
      <form onSubmit={save} className="glass-panel rounded-md p-4">
        <h2 className="mb-4 text-lg font-bold">Form Barang</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          {[
            ["idBarang", "ID Barang"],
            ["barcode", "Barcode"],
            ["namaBarang", "Nama Barang"],
            ["kategori", "Kategori"],
            ["satuan", "Satuan"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-semibold">{label}</span>
              <input
                value={editing[key]}
                onChange={(event) => setEditing({ ...editing, [key]: event.target.value })}
                className="control-surface min-h-10 w-full rounded-md px-3 outline-none focus:border-teal"
                required={["idBarang", "namaBarang"].includes(key)}
              />
            </label>
          ))}
          {[
            ["hargaBeli", "Harga Beli"],
            ["hargaJual", "Harga Jual"],
            ["stok", "Stok"],
            ["minimalStok", "Minimal Stok"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-semibold">{label}</span>
              <input
                type="number"
                value={editing[key]}
                onChange={(event) => setEditing({ ...editing, [key]: Number(event.target.value) })}
                className="control-surface min-h-10 w-full rounded-md px-3 outline-none focus:border-teal"
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Status</span>
            <select
              value={editing.status}
              onChange={(event) => setEditing({ ...editing, status: event.target.value })}
              className="control-surface min-h-10 w-full rounded-md px-3 outline-none focus:border-teal"
            >
              <option>Aktif</option>
              <option>Nonaktif</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex gap-2">
          <Button type="submit"><Save size={18} /> Simpan</Button>
          <Button type="button" variant="secondary" onClick={() => setEditing(emptyProduct)}>
            Reset
          </Button>
        </div>
        {message ? <p className="mt-3 rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-3 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      </form>

      <section className="glass-panel rounded-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="control-surface flex min-h-10 flex-1 items-center gap-2 rounded-md px-3">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari barang atau barcode"
              className="w-full outline-none"
            />
          </div>
          <Button variant="secondary" onClick={load}><RefreshCw size={17} /> Refresh</Button>
        </div>
        <div className="max-h-[72vh] overflow-auto scrollbar-soft">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Barang</th>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Harga Jual</th>
                <th className="px-4 py-3 text-right">Stok Sistem</th>
                <th className="px-4 py-3">Koreksi Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.idBarang} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.namaBarang}</p>
                    <p className="text-xs text-slate-500">{item.idBarang}</p>
                  </td>
                  <td className="px-4 py-3">{item.barcode}</td>
                  <td className="px-4 py-3">{item.kategori}</td>
                  <td className="px-4 py-3 text-right">{rupiah.format(item.hargaJual || 0)}</td>
                  <td className="px-4 py-3 text-right">{item.stok} {item.satuan}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={stockCorrections[item.idBarang] ?? item.stok ?? 0}
                        onChange={(event) =>
                          setStockCorrections({
                            ...stockCorrections,
                            [item.idBarang]: event.target.value,
                          })
                        }
                        className="control-surface h-10 w-24 rounded-md px-3 text-right outline-none focus:border-teal"
                        aria-label={`Koreksi stok ${item.namaBarang}`}
                      />
                      <span className="w-12 text-xs text-slate-500">{item.satuan}</span>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => correctStock(item)}
                        disabled={Number(stockCorrections[item.idBarang] ?? item.stok) === Number(item.stok)}
                        title="Simpan koreksi stok"
                      >
                        <Save size={16} />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setEditing(item)} title="Edit">
                        <Pencil size={16} />
                      </Button>
                      <Button type="button" variant="danger" onClick={() => remove(item.idBarang)} title="Nonaktifkan">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

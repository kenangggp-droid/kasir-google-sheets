import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import { rupiah } from "../lib/format";

export function History() {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.history().then(setHistory).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return history.filter((sale) =>
      [sale.noInvoice, sale.tanggal, sale.kasir, sale.metodeBayar].join(" ").toLowerCase().includes(text)
    );
  }, [history, query]);

  return (
    <section className="glass-panel rounded-md">
      <div className="flex items-center gap-2 border-b border-line p-4">
        <Search size={18} className="text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari invoice, tanggal, kasir, atau metode bayar"
          className="min-h-10 w-full outline-none"
        />
      </div>
      {error ? <p className="m-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Jam</th>
              <th className="px-4 py-3">Kasir</th>
              <th className="px-4 py-3 text-right">Item</th>
              <th className="px-4 py-3 text-right">Grand Total</th>
              <th className="px-4 py-3">Metode</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sale) => (
              <tr key={sale.noInvoice} className="border-t border-line">
                <td className="px-4 py-3 font-semibold">{sale.noInvoice}</td>
                <td className="px-4 py-3">{sale.tanggal}</td>
                <td className="px-4 py-3">{sale.jam}</td>
                <td className="px-4 py-3">{sale.kasir}</td>
                <td className="px-4 py-3 text-right">{sale.totalItem}</td>
                <td className="px-4 py-3 text-right font-semibold">{rupiah.format(sale.grandTotal || 0)}</td>
                <td className="px-4 py-3">{sale.metodeBayar}</td>
              </tr>
            ))}
            {!filtered.length ? (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                  Belum ada riwayat transaksi.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

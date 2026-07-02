import { useEffect, useState } from "react";
import { AlertTriangle, Boxes, ClipboardCheck, Coins, PlusCircle, RefreshCw } from "lucide-react";
import { Button } from "../components/Button";
import { StatCard } from "../components/StatCard";
import { api } from "../lib/api";
import { number, rupiah } from "../lib/format";

export function Dashboard({ setPage }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      setData(await api.dashboard());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
    const refreshTimer = window.setInterval(loadDashboard, 30000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  if (error) {
    return <p className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</p>;
  }

  const summary = data?.summary || {};
  const lowStock = data?.lowStock || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">Ringkasan hari ini dari sheet Dashboard</p>
          <h2 className="text-2xl font-bold">{data?.date || "Memuat..."}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={loadDashboard} disabled={loading}>
            <RefreshCw size={18} /> {loading ? "Refresh..." : "Refresh"}
          </Button>
          <Button onClick={() => setPage("transaksi")}>
            <PlusCircle size={18} /> Transaksi Baru
          </Button>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Penjualan" value={rupiah.format(summary.totalPenjualan || 0)} icon={Coins} />
        <StatCard label="Laba Kotor" value={rupiah.format(summary.labaKotor || 0)} tone="mint" icon={ClipboardCheck} />
        <StatCard label="Jumlah Transaksi" value={number.format(summary.jumlahTransaksi || 0)} tone="amber" icon={ClipboardCheck} />
        <StatCard label="Barang Menipis" value={number.format(lowStock.length)} tone="coral" icon={AlertTriangle} />
      </section>

      <section className="rounded-md border border-line bg-white shadow-panel">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Boxes size={19} className="text-teal" />
          <h3 className="font-bold">Stok di Bawah Minimal</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nama Barang</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3 text-right">Stok</th>
                <th className="px-4 py-3 text-right">Minimal</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((item) => (
                <tr key={item.idBarang} className="border-t border-line">
                  <td className="px-4 py-3 font-semibold">{item.idBarang}</td>
                  <td className="px-4 py-3">{item.namaBarang}</td>
                  <td className="px-4 py-3">{item.kategori}</td>
                  <td className="px-4 py-3 text-right">{item.stok}</td>
                  <td className="px-4 py-3 text-right">{item.minimalStok}</td>
                </tr>
              ))}
              {!lowStock.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Semua stok aman.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

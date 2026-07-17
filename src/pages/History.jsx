import { useEffect, useMemo, useState } from "react";
import { Eye, ReceiptText, Search, X } from "lucide-react";
import { Button } from "../components/Button";
import { api } from "../lib/api";
import { rupiah } from "../lib/format";

export function History() {
  const [history, setHistory] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);
  const [detailItems, setDetailItems] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    api.history().then(setHistory).catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return history.filter((sale) =>
      [sale.noInvoice, sale.tanggal, sale.kasir, sale.metodeBayar].join(" ").toLowerCase().includes(text)
    );
  }, [history, query]);

  async function openDetail(sale) {
    setSelectedSale(sale);
    setDetailItems([]);
    setDetailError("");
    setDetailLoading(true);
    try {
      setDetailItems(await api.saleDetails(sale.noInvoice));
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setDetailLoading(false);
    }
  }

  function closeDetail() {
    setSelectedSale(null);
    setDetailItems([]);
    setDetailError("");
  }

  return (
    <>
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
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Jam</th>
                <th className="px-4 py-3">Kasir</th>
                <th className="px-4 py-3 text-right">Item</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3">Metode</th>
                <th className="px-4 py-3 text-right">Aksi</th>
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
                  <td className="px-4 py-3 text-right">
                    <Button type="button" variant="secondary" onClick={() => openDetail(sale)}>
                      <Eye size={16} />
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                    Belum ada riwayat transaksi.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {selectedSale ? (
        <DetailModal
          detailError={detailError}
          detailItems={detailItems}
          detailLoading={detailLoading}
          onClose={closeDetail}
          sale={selectedSale}
        />
      ) : null}
    </>
  );
}

function DetailModal({ detailError, detailItems, detailLoading, onClose, sale }) {
  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-ink/45 px-4 py-8 backdrop-blur-sm sm:py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center">
        <section className="glass-panel relative flex max-h-[calc(100vh-4rem)] w-full max-w-4xl animate-fade-up flex-col overflow-hidden rounded-md">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line bg-white/88 p-4 pr-16 backdrop-blur sm:p-5 sm:pr-20">
            <div className="flex gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-teal text-white shadow-lift">
                <ReceiptText size={22} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Detail Pembelian</h2>
                <p className="text-sm text-slate-500">{sale.noInvoice}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  {sale.tanggal} - {sale.jam} - {sale.kasir}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-slate-700 shadow-panel ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-700"
            title="Tutup"
            aria-label="Tutup detail pembelian"
          >
            <X size={20} />
          </button>

          <div className="min-h-0 flex-1 overflow-auto scrollbar-soft">
            {detailLoading ? (
              <p className="p-5 text-sm text-slate-500">Memuat detail pembelian...</p>
            ) : null}

            {detailError ? (
              <p className="m-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{detailError}</p>
            ) : null}

            {!detailLoading && !detailError ? (
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="sticky top-0 z-[1] bg-slate-50 text-slate-500 shadow-[0_1px_0_rgba(216,228,223,1)]">
                  <tr>
                    <th className="px-4 py-3">Barang</th>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                    <th className="px-4 py-3 text-right">Harga</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detailItems.map((item, index) => (
                    <tr key={`${item.idBarang}-${index}`} className="border-t border-line">
                      <td className="px-4 py-3 font-semibold">{item.namaBarang}</td>
                      <td className="px-4 py-3 text-slate-500">{item.idBarang}</td>
                      <td className="px-4 py-3 text-right">{item.qty}</td>
                      <td className="px-4 py-3 text-right">{rupiah.format(item.harga || 0)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{rupiah.format(item.total || 0)}</td>
                    </tr>
                  ))}
                  {!detailItems.length ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                        Detail item tidak ditemukan untuk invoice ini.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            ) : null}
          </div>

          <div className="grid shrink-0 gap-3 border-t border-line bg-white/72 p-4 sm:grid-cols-2 sm:p-5">
            <SummaryRow label="Subtotal" value={rupiah.format(sale.subtotal || 0)} />
            <SummaryRow label="Diskon" value={rupiah.format(sale.diskon || 0)} />
            <SummaryRow label="Pajak" value={rupiah.format(sale.pajak || 0)} />
            <SummaryRow label="Metode" value={sale.metodeBayar || "-"} />
            <SummaryRow label="Bayar" value={rupiah.format(sale.bayar || 0)} />
            <SummaryRow label="Kembalian" value={rupiah.format(sale.kembalian || 0)} />
            <div className="rounded-md bg-teal px-4 py-3 text-white sm:col-span-2">
              <div className="flex justify-between gap-4 text-lg font-bold">
                <span>Grand Total</span>
                <span>{rupiah.format(sale.grandTotal || 0)}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 rounded-md bg-white/72 px-4 py-3 text-sm ring-1 ring-line/70">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

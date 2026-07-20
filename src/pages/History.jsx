import { useEffect, useMemo, useState } from "react";
import { Eye, Printer, ReceiptText, Search, X } from "lucide-react";
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
      className="fixed inset-x-0 bottom-0 top-16 z-[100] overflow-y-auto bg-ink/45 px-4 py-4 backdrop-blur-sm lg:left-64"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="mx-auto flex min-h-full w-full max-w-4xl items-start">
        <section className="glass-panel relative flex w-full animate-fade-up flex-col overflow-hidden rounded-md">
          <div className="sticky top-0 z-20 flex shrink-0 items-start justify-between gap-4 border-b border-line bg-white/95 p-4 backdrop-blur sm:p-5">
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
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => printReceipt(sale, detailItems)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-slate-700 shadow-panel ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-mint hover:text-teal disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50"
                title="Cetak struk"
                aria-label="Cetak struk"
                disabled={detailLoading || Boolean(detailError)}
              >
                <Printer size={19} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-slate-700 shadow-panel ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-700"
                title="Tutup"
                aria-label="Tutup detail pembelian"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="max-h-[calc(100dvh-12rem)] overflow-auto scrollbar-soft">
            <div className="min-w-0">
              {detailLoading ? (
                <p className="p-5 text-sm text-slate-500">Memuat detail pembelian...</p>
              ) : null}

              {detailError ? (
                <p className="m-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{detailError}</p>
              ) : null}

              {!detailLoading && !detailError ? (
                <div className="overflow-x-auto">
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
                </div>
              ) : null}

              <div className="grid gap-3 border-t border-line bg-white/72 p-4 sm:grid-cols-2 sm:p-5">
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

function printReceipt(sale, detailItems) {
  const receiptWindow = window.open("", "_blank", "width=420,height=720");
  if (!receiptWindow) return;

  const rows = detailItems
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.namaBarang || "-")}</strong><br />
            <span>${escapeHtml(item.idBarang || "")}</span>
          </td>
          <td class="right">${Number(item.qty || 0)}</td>
          <td class="right">${rupiah.format(item.harga || 0)}</td>
          <td class="right">${rupiah.format(item.total || 0)}</td>
        </tr>`
    )
    .join("");

  receiptWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Struk ${escapeHtml(sale.noInvoice || "")}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 18px;
            color: #172126;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 12px;
          }
          h1 { margin: 0 0 4px; font-size: 18px; text-align: center; }
          .center { text-align: center; }
          .muted { color: #64748b; }
          .line { border-top: 1px dashed #94a3b8; margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { padding: 6px 0; vertical-align: top; }
          th { border-bottom: 1px solid #d8e4df; color: #64748b; font-weight: 700; }
          .right { text-align: right; }
          .total {
            margin-top: 10px;
            padding: 10px 0;
            border-top: 1px dashed #94a3b8;
            border-bottom: 1px dashed #94a3b8;
            font-size: 16px;
            font-weight: 800;
          }
          .summary div { display: flex; justify-content: space-between; gap: 12px; padding: 3px 0; }
          @media print {
            body { padding: 0; }
            @page { margin: 10mm; }
          }
        </style>
      </head>
      <body>
        <h1>Kasir Toko</h1>
        <p class="center muted">Google Sheets POS</p>
        <div class="line"></div>
        <div>
          <div><strong>Invoice:</strong> ${escapeHtml(sale.noInvoice || "-")}</div>
          <div><strong>Tanggal:</strong> ${escapeHtml(sale.tanggal || "-")} ${escapeHtml(sale.jam || "")}</div>
          <div><strong>Kasir:</strong> ${escapeHtml(sale.kasir || "-")}</div>
          <div><strong>Metode:</strong> ${escapeHtml(sale.metodeBayar || "-")}</div>
        </div>
        <div class="line"></div>
        <table>
          <thead>
            <tr>
              <th>Barang</th>
              <th class="right">Qty</th>
              <th class="right">Harga</th>
              <th class="right">Total</th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="4" class="center muted">Tidak ada item</td></tr>`}</tbody>
        </table>
        <div class="line"></div>
        <div class="summary">
          <div><span>Subtotal</span><strong>${rupiah.format(sale.subtotal || 0)}</strong></div>
          <div><span>Diskon</span><strong>${rupiah.format(sale.diskon || 0)}</strong></div>
          <div><span>Pajak</span><strong>${rupiah.format(sale.pajak || 0)}</strong></div>
          <div><span>Bayar</span><strong>${rupiah.format(sale.bayar || 0)}</strong></div>
          <div><span>Kembalian</span><strong>${rupiah.format(sale.kembalian || 0)}</strong></div>
        </div>
        <div class="total">
          <div style="display:flex; justify-content:space-between; gap:12px;">
            <span>Grand Total</span>
            <span>${rupiah.format(sale.grandTotal || 0)}</span>
          </div>
        </div>
        <p class="center muted">Terima kasih</p>
        <script>
          window.onload = () => {
            window.print();
            window.onafterprint = () => window.close();
          };
        </script>
      </body>
    </html>
  `);
  receiptWindow.document.close();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

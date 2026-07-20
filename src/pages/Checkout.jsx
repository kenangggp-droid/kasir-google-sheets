import { Minus, Plus, ReceiptText, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { rupiah } from "../lib/format";

export function Checkout({ setPage }) {
  const { user } = useAuth();
  const { items, updateQty, removeItem, clearCart, subtotal, totalQty } = useCart();
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [paid, setPaid] = useState("");
  const [method, setMethod] = useState("Tunai");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const discountValue = toNumber(discount);
  const taxValue = toNumber(tax);
  const paidValue = toNumber(paid);
  const grandTotal = useMemo(() => Math.max(0, subtotal - discountValue + taxValue), [subtotal, discountValue, taxValue]);
  const change = paidValue - grandTotal;

  async function pay() {
    setMessage("");
    setError("");
    try {
      if (!items.length) throw new Error("Keranjang masih kosong.");
      if (change < 0) throw new Error("Nominal bayar belum cukup.");
      const result = await api.checkout({
        cashier: user?.nama || user?.username,
        items,
        discount: discountValue,
        tax: taxValue,
        paid: paidValue,
        method,
      });
      setMessage(`Invoice ${result.invoice} tersimpan.`);
      clearCart();
      setDiscount("");
      setTax("");
      setPaid("");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <section className="glass-panel rounded-md">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <ReceiptText size={20} className="text-teal" />
          <h2 className="font-bold">Item Checkout</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">Barang</th>
                <th className="px-4 py-3 text-right">Harga</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.idBarang} className="border-t border-line">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{item.namaBarang}</p>
                    <p className="text-xs text-slate-500">Stok tersedia {item.stok}</p>
                  </td>
                  <td className="px-4 py-3 text-right">{rupiah.format(item.harga)}</td>
                  <td className="px-4 py-3">
                    <div className="mx-auto flex w-32 items-center justify-center gap-2">
                      <Button variant="secondary" onClick={() => updateQty(item.idBarang, item.qty - 1)}><Minus size={15} /></Button>
                      <input
                        value={item.qty}
                        onChange={(event) => updateQty(item.idBarang, event.target.value)}
                        className="control-surface h-10 w-12 rounded-md text-center outline-none"
                      />
                      <Button variant="secondary" onClick={() => updateQty(item.idBarang, item.qty + 1)}><Plus size={15} /></Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{rupiah.format(item.harga * item.qty)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="danger" onClick={() => removeItem(item.idBarang)} title="Hapus">
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                    Belum ada item. Tambahkan dari halaman Transaksi.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="glass-panel rounded-md p-4">
        <h2 className="mb-4 text-lg font-bold">Pembayaran</h2>
        <div className="space-y-3">
          {[
            ["discount", "Diskon", discount, setDiscount],
            ["tax", "Pajak", tax, setTax],
            ["paid", "Bayar", paid, setPaid],
          ].map(([key, label, value, setter]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-sm font-semibold">{label}</span>
              <input
                type="text"
                value={formatNominalInput(value)}
                inputMode="numeric"
                onChange={(event) => setter(cleanNominal(event.target.value))}
                onFocus={(event) => event.target.select()}
                className="control-surface min-h-10 w-full rounded-md px-3 outline-none focus:border-teal"
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Metode Bayar</span>
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value)}
              className="control-surface min-h-10 w-full rounded-md px-3 outline-none focus:border-teal"
            >
              <option>Tunai</option>
              <option>QRIS</option>
              <option>Debit</option>
              <option>Transfer</option>
            </select>
          </label>
        </div>
        <div className="my-4 space-y-2 border-y border-line py-4">
          <Row label="Total Item" value={totalQty} />
          <Row label="Subtotal" value={rupiah.format(subtotal)} />
          <Row label="Diskon" value={rupiah.format(discountValue)} />
          <Row label="Pajak" value={rupiah.format(taxValue)} />
          <Row label="Grand Total" value={rupiah.format(grandTotal)} strong />
          <Row label="Kembalian" value={rupiah.format(Math.max(0, change))} strong />
        </div>
        {message ? <p className="mb-3 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={pay} disabled={!items.length}>Simpan</Button>
          <Button variant="secondary" onClick={() => setPage("transaksi")}>Tambah</Button>
        </div>
      </aside>
    </div>
  );
}

function cleanNominal(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return String(Number(digits));
}

function formatNominalInput(value) {
  if (value === "") return "";
  return new Intl.NumberFormat("id-ID").format(Number(value || 0));
}

function toNumber(value) {
  return Number(value || 0);
}

function Row({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between gap-4 ${strong ? "text-lg font-bold" : "text-sm text-slate-600"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

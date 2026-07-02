import {
  Boxes,
  ClipboardList,
  History,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { allowedPagesFor } from "../lib/permissions";
import { Button } from "./Button";

const nav = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "stok", label: "Stok Barang", icon: Boxes },
  { key: "transaksi", label: "Transaksi", icon: ClipboardList },
  { key: "checkout", label: "Checkout", icon: ShoppingCart },
  { key: "riwayat", label: "Riwayat", icon: History },
];

export function Layout({ page, setPage, children }) {
  const { user, logout } = useAuth();
  const { totalQty } = useCart();
  const visibleNav = nav.filter((item) => allowedPagesFor(user).includes(item.key));

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 border-r border-line bg-white/88 px-4 py-5 shadow-panel backdrop-blur lg:block">
        <div className="mb-7 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-teal text-white">
            <ReceiptText size={24} />
          </div>
          <div>
            <p className="text-lg font-bold">Kasir Toko</p>
            <p className="text-xs text-slate-500">Google Sheets POS</p>
          </div>
        </div>
        <nav className="space-y-1">
          {visibleNav.map((item) => {
            const Icon = item.icon;
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-semibold transition ${
                  active ? "bg-mint text-teal" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={19} />
                <span className="flex-1">{item.label}</span>
                {item.key === "checkout" && totalQty > 0 ? (
                  <span className="rounded-full bg-coral px-2 py-0.5 text-xs text-white">
                    {totalQty}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-white/82 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-lg font-bold sm:text-xl">
                {visibleNav.find((item) => item.key === page)?.label}
              </h1>
              <p className="text-xs text-slate-500">{user?.nama} - {user?.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 overflow-x-auto lg:hidden">
                {visibleNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setPage(item.key)}
                      title={item.label}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                        page === item.key ? "bg-teal text-white" : "bg-white text-slate-600"
                      }`}
                    >
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
              <Button variant="ghost" onClick={logout} title="Logout">
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

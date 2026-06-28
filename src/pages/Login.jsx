import { useState } from "react";
import { LockKeyhole, ReceiptText, UserRound } from "lucide-react";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ username: "admin", password: "admin123" });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await login(form.username, form.password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-md border border-line bg-white p-6 shadow-panel">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-teal text-white">
            <ReceiptText size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Kasir Toko</h1>
            <p className="text-sm text-slate-500">Masuk dengan akun dari sheet Users</p>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Username</span>
            <div className="flex items-center gap-2 rounded-md border border-line bg-white px-3">
              <UserRound size={18} className="text-slate-400" />
              <input
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                className="min-h-11 w-full outline-none"
                autoComplete="username"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">Password</span>
            <div className="flex items-center gap-2 rounded-md border border-line bg-white px-3">
              <LockKeyhole size={18} className="text-slate-400" />
              <input
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="min-h-11 w-full outline-none"
                type="password"
                autoComplete="current-password"
              />
            </div>
          </label>
          {error ? <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memeriksa..." : "Login"}
          </Button>
        </form>
      </section>
    </main>
  );
}

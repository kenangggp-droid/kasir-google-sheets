import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Stock } from "./pages/Stock";
import { Sales } from "./pages/Sales";
import { Checkout } from "./pages/Checkout";
import { History } from "./pages/History";

function Router() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState("dashboard");

  if (!isAuthenticated) {
    return <Login />;
  }

  const pages = {
    dashboard: <Dashboard setPage={setPage} />,
    stok: <Stock />,
    transaksi: <Sales setPage={setPage} />,
    checkout: <Checkout setPage={setPage} />,
    riwayat: <History />,
  };

  return (
    <Layout page={page} setPage={setPage}>
      {pages[page]}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router />
      </CartProvider>
    </AuthProvider>
  );
}

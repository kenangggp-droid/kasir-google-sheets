import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { Stock } from "./pages/Stock";
import { Sales } from "./pages/Sales";
import { Checkout } from "./pages/Checkout";
import { History } from "./pages/History";
import { allowedPagesFor, defaultPageFor } from "./lib/permissions";

function Router() {
  const { isAuthenticated, user } = useAuth();
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!allowedPagesFor(user).includes(page)) {
      setPage(defaultPageFor(user));
    }
  }, [isAuthenticated, page, user]);

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

  const currentPage = allowedPagesFor(user).includes(page) ? page : defaultPageFor(user);

  return (
    <Layout page={currentPage} setPage={setPage}>
      {pages[currentPage]}
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

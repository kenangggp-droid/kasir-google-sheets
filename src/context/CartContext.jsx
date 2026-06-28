import { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addItem(product) {
    setItems((current) => {
      const existing = current.find((item) => item.idBarang === product.idBarang);
      if (existing) {
        return current.map((item) =>
          item.idBarang === product.idBarang
            ? { ...item, qty: Math.min(item.qty + 1, Number(product.stok || 0)) }
            : item
        );
      }
      return [
        ...current,
        {
          idBarang: product.idBarang,
          namaBarang: product.namaBarang,
          harga: Number(product.hargaJual || 0),
          stok: Number(product.stok || 0),
          qty: 1,
        },
      ];
    });
  }

  function updateQty(idBarang, qty) {
    setItems((current) =>
      current
        .map((item) =>
          item.idBarang === idBarang
            ? { ...item, qty: Math.max(1, Math.min(Number(qty || 1), item.stok)) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  function removeItem(idBarang) {
    setItems((current) => current.filter((item) => item.idBarang !== idBarang));
  }

  function clearCart() {
    setItems([]);
  }

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.harga, 0);
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  const value = useMemo(
    () => ({ items, addItem, updateQty, removeItem, clearCart, subtotal, totalQty }),
    [items, subtotal, totalQty]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}

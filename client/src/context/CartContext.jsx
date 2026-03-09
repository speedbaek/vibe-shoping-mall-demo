import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart as apiClearCart,
} from '../utils/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = useCallback(
    async (productId, quantity = 1) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      const data = await addCartItem(productId, quantity);
      setCart(data);
      return data;
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      const data = await updateCartItem(productId, quantity);
      setCart(data);
      return data;
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (productId) => {
      if (!user) throw new Error('로그인이 필요합니다.');
      const data = await removeCartItem(productId);
      setCart(data);
      return data;
    },
    [user]
  );

  const clearCart = useCallback(async () => {
    if (!user) return;
    await apiClearCart();
    setCart({ items: [] });
  }, [user]);

  const cartCount = cart?.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) ?? 0;

  const value = {
    cart,
    cartCount,
    loading,
    refreshCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

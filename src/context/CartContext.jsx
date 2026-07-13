import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('farm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('farm_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    const cartItemId = product.cartItemId || product.id;
    
    setCartItems(prev => {
      const prevExisting = prev.find(item => item.cartItemId === cartItemId || item.id === cartItemId);
      if (prevExisting) {
        return prev.map(item => (item.cartItemId === cartItemId || item.id === cartItemId) ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, cartItemId, quantity }];
    });
    toast.success(`Added ${product.title} to cart`);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId));
    toast.success('Item removed');
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) return removeFromCart(cartItemId);
    setCartItems(prev => prev.map(item => (item.cartItemId === cartItemId || item.id === cartItemId) ? { ...item, quantity } : item));
  };

  const clearCart = () => setCartItems([]);

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

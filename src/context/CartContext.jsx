import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('farm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('farm_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (user) {
      fetchCartFromDb();
    } else {
      // Load from local storage if logged out
      const saved = localStorage.getItem('farm_cart');
      setCartItems(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  const fetchCartFromDb = async () => {
    if (!user?.id || user?.role === 'admin') return;
    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.product_id,
          cartItemId: item.product_id,
          title: item.product.name,
          price: item.product.price,
          image: item.product.image_url,
          quantity: item.quantity
        }));
        setCartItems(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch cart from DB', err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const cartItemId = product.cartItemId || product.id;
    
    setCartItems(prev => {
      const prevExisting = prev.find(item => item.cartItemId === cartItemId || item.id === cartItemId);
      if (prevExisting) {
        return prev.map(item => (item.cartItemId === cartItemId || item.id === cartItemId) ? { ...item, quantity: item.quantity + quantity } : item);
      }
      return [...prev, { ...product, cartItemId, quantity }];
    });

    if (user) {
      try {
        const { data: existing } = await supabase.from('cart_items').select('*').eq('user_id', user.id).eq('product_id', product.id).single();
        if (existing) {
          await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
        } else {
          await supabase.from('cart_items').insert([{ user_id: user.id, product_id: product.id, quantity }]);
        }
      } catch (err) {
        console.error('Failed to sync add to cart', err);
      }
    }

    toast.success(`Added ${product.title} to cart`);
  };

  const removeFromCart = async (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId && item.id !== cartItemId));
    
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id).eq('product_id', cartItemId);
      } catch (err) {
        console.error('Failed to sync remove from cart', err);
      }
    }

    toast.success('Item removed');
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (quantity <= 0) return removeFromCart(cartItemId);
    setCartItems(prev => prev.map(item => (item.cartItemId === cartItemId || item.id === cartItemId) ? { ...item, quantity } : item));
    
    if (user) {
      try {
        await supabase.from('cart_items').update({ quantity }).eq('user_id', user.id).eq('product_id', cartItemId);
      } catch (err) {
        console.error('Failed to sync update cart', err);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (user) {
      try {
        await supabase.from('cart_items').delete().eq('user_id', user.id);
      } catch (err) {
        console.error('Failed to clear DB cart', err);
      }
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
};

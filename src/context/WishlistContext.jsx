import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('farm_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('farm_wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (user) {
      fetchWishlistFromDb();
    } else {
      const saved = localStorage.getItem('farm_wishlist');
      setWishlistItems(saved ? JSON.parse(saved) : []);
    }
  }, [user]);

  const fetchWishlistFromDb = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*, product:products(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;

      if (data && data.length > 0) {
        const formatted = data.map(item => ({
          id: item.product_id,
          title: item.product.name,
          price: item.product.price,
          image: item.product.image_url,
        }));
        setWishlistItems(formatted);
      }
    } catch (err) {
      console.error('Failed to fetch wishlist from DB', err);
    }
  };

  const toggleWishlist = async (product) => {
    const isExisting = wishlistItems.find(item => item.id === product.id);
    
    if (isExisting) {
      setWishlistItems(prev => prev.filter(item => item.id !== product.id));
      if (user) {
        try {
          await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', product.id);
        } catch (err) {
          console.error(err);
        }
      }
      toast.success(`${product.title} removed from wishlist`);
    } else {
      setWishlistItems(prev => [...prev, product]);
      if (user) {
        try {
          await supabase.from('wishlist_items').insert([{ user_id: user.id, product_id: product.id }]);
        } catch (err) {
          console.error(err);
        }
      }
      toast.success(`${product.title} added to wishlist`);
    }
  };

  const removeFromWishlist = async (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
    if (user) {
      try {
        await supabase.from('wishlist_items').delete().eq('user_id', user.id).eq('product_id', id);
      } catch (err) {
        console.error(err);
      }
    }
    toast.success('Item removed from wishlist');
  };

  const isInWishlist = (id) => {
    return wishlistItems.some(item => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Truck, CreditCard, CheckCircle, ShieldCheck, MapPin, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useSEO from '../hooks/useSEO';
import { initializeRazorpayPayment } from '../lib/razorpay';
import { supabase } from '../lib/supabase';
import './Checkout.css';

const Checkout = () => {
  useSEO({ title: 'Checkout', description: 'Complete your order securely.' });
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  const [formData, setFormData] = useState({
    firstName: user?.user_metadata?.full_name?.split(' ')[0] || '',
    lastName: user?.user_metadata?.full_name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCouponId, setAppliedCouponId] = useState(null);
  
  const [shippingSettings, setShippingSettings] = useState({ base: 100, threshold: 3000 });

  useEffect(() => {
    const fetchShipping = async () => {
      const { data } = await supabase.from('store_settings').select('flat_shipping_rate, free_shipping_threshold').eq('id', 1).single();
      if (data) {
        setShippingSettings({ base: data.flat_shipping_rate, threshold: data.free_shipping_threshold });
      }
    };
    fetchShipping();
  }, []);

  const allFreeShipping = cartItems.length > 0 && cartItems.every(item => item.isFreeShipping);
  const total = totalAmount;
  const shippingCost = (allFreeShipping || total > shippingSettings.threshold) ? 0 : shippingSettings.base;
  const finalAmount = total + shippingCost - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data, error } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single();
      
      if (error || !data) {
        setDiscount(0);
        setAppliedCouponId(null);
        toast.error('Invalid coupon code.');
        return;
      }
      
      if (data.status !== 'Active') {
        setDiscount(0);
        setAppliedCouponId(null);
        toast.error('This coupon is no longer active.');
        return;
      }
      
      if (new Date(data.expiry) < new Date()) {
        setDiscount(0);
        setAppliedCouponId(null);
        toast.error('This coupon has expired.');
        return;
      }
      
      if (total < data.min_spend) {
        setDiscount(0);
        setAppliedCouponId(null);
        toast.error(`Minimum spend of ₹${data.min_spend} required.`);
        return;
      }
      
      if (data.usage_count >= data.max_usage) {
        setDiscount(0);
        setAppliedCouponId(null);
        toast.error('This coupon has reached its maximum usage limit.');
        return;
      }

      let discountAmount = 0;
      if (data.type === 'Percentage') {
        discountAmount = Math.floor(total * (data.value / 100));
      } else if (data.type === 'Fixed Amount') {
        discountAmount = data.value;
      } else if (data.type === 'Free Shipping') {
        discountAmount = shippingCost;
      }

      // Ensure discount doesn't exceed total minus shipping if not free shipping
      if (data.type !== 'Free Shipping' && discountAmount > total) {
        discountAmount = total;
      }

      setDiscount(discountAmount);
      setAppliedCouponId(data.id);
      
      const offText = data.type === 'Percentage' ? `${data.value}%` : data.type === 'Fixed Amount' ? `₹${data.value}` : 'Free Shipping';
      toast.success(`Coupon applied! ${offText} off.`);

    } catch (err) {
      setDiscount(0);
      setAppliedCouponId(null);
      toast.error('Failed to validate coupon.');
    }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Pincode Autofill Effect
  useEffect(() => {
    if (formData.pincode.length === 6) {
      const fetchLocation = async () => {
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await res.json();
          if (data && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
            toast.success(`Location auto-filled for ${formData.pincode}`);
          }
        } catch (error) {
          console.error("Error fetching pincode data", error);
        }
      };
      fetchLocation();
    }
  }, [formData.pincode]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          
          if (data && data.address) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name,
              city: data.address.city || data.address.state_district || '',
              state: data.address.state || '',
              pincode: data.address.postcode || ''
            }));
            toast.success('Exact location tracked successfully!');
          }
        } catch (error) {
          toast.error('Failed to fetch address from coordinates');
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        toast.error('Location access denied. Please enter manually.');
      }
    );
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const saveOrderToDatabase = async (orderId, paymentMethodStr, paymentIdStr = null, paymentStatusStr) => {
    try {
      const { data: orderData, error: orderError } = await supabase.from('orders').insert([{
        user_id: user.id,
        display_id: orderId,
        status: 'Pending',
        payment_method: paymentMethodStr,
        payment_id: paymentIdStr,
        payment_status: paymentStatusStr,
        total_amount: finalAmount,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_email: formData.email,
        customer_phone: formData.phone
      }]).select();

      if (orderError) throw orderError;
      
      const realOrderId = orderData[0].id;

      const itemsToInsert = cartItems.map(item => ({
        order_id: realOrderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        product_title: item.title,
        product_image: item.image
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;
      
      if (appliedCouponId) {
        const { data: couponData } = await supabase.from('coupons').select('usage_count').eq('id', appliedCouponId).single();
        if (couponData) {
          await supabase.from('coupons').update({ usage_count: couponData.usage_count + 1 }).eq('id', appliedCouponId);
        }
      }

      // Deduct inventory stock
      for (const item of cartItems) {
        const { data: productData } = await supabase.from('products').select('stock_quantity').eq('id', item.id).single();
        if (productData && productData.stock_quantity !== null && productData.stock_quantity !== undefined) {
          const newStock = Math.max(0, productData.stock_quantity - item.quantity);
          await supabase.from('products').update({ stock_quantity: newStock }).eq('id', item.id);
        }
      }

      return true;
    } catch (err) {
      console.error('Failed to save order:', err);
      toast.error('Order processed but failed to save to database. Please contact support.');
      return false;
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must log in to place an order.');
      navigate('/login?redirect=/checkout');
      return;
    }

    setLoading(true);
    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const shippingAddress = `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`;

    if (paymentMethod === 'card') {
      try {
        const orderRes = await fetch('/api/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: finalAmount, receipt: orderId })
        });
        const orderData = await orderRes.json();
        if (!orderRes.ok) {
          throw new Error(orderData.error || 'Failed to create Razorpay Order');
        }

        await initializeRazorpayPayment(
          {
            amount: finalAmount,
            email: formData.email,
            phone: formData.phone,
            name: `${formData.firstName} ${formData.lastName}`,
            description: `Order ${orderId}`,
            address: shippingAddress,
            orderId: orderData.id,
          },
          async (response) => {
            await saveOrderToDatabase(orderId, 'Razorpay UPI/Card', response.razorpay_payment_id, 'Paid');
            toast.success('Payment successful!');
            clearCart();
            setLoading(false);
            navigate('/order-success', { 
              state: { 
                orderId, 
                total: finalAmount,
                address: shippingAddress,
                paymentMethod: 'Razorpay UPI/Card',
                paymentId: response.razorpay_payment_id
              } 
            });
          },
          () => {
            toast.error('Payment cancelled.');
            setLoading(false);
          }
        );
      } catch (err) {
        toast.error(err.message || 'Payment initialization failed.');
        setLoading(false);
      }
    } else {
      // Cash on Delivery
      await saveOrderToDatabase(orderId, 'Cash on Delivery', null, 'COD');
      clearCart();
      setLoading(false);
      navigate('/order-success', { 
        state: { 
          orderId, 
          total: finalAmount,
          address: shippingAddress,
          paymentMethod: 'Cash on Delivery'
        } 
      });
    }
  };

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-container">
        
        <div className="checkout-header">
          <button 
            onClick={() => navigate(-1)} 
            className="checkout-back-btn"
          >
            <ArrowLeft size={16} /> <span className="back-text">Back</span>
          </button>
          <h1>Secure Checkout</h1>
        </div>
        
        <div className="checkout-grid">
          {/* Left Side: Form Elements */}
          <motion.div 
            className="checkout-form-section"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <form onSubmit={handlePlaceOrder}>
              
              <h3 className="checkout-section-title">Contact Information</h3>
              {!user && (
                <div className="checkout-guest-warning">
                  You are checking out as a <strong>Guest</strong>. Consider logging in to track your order!
                </div>
              )}
              
              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <input type="text" name="firstName" id="firstName" className="checkout-input" placeholder=" " required value={formData.firstName} onChange={handleChange} />
                  <label htmlFor="firstName" className="checkout-label">First Name</label>
                </div>
                <div className="checkout-form-group">
                  <input type="text" name="lastName" id="lastName" className="checkout-input" placeholder=" " required value={formData.lastName} onChange={handleChange} />
                  <label htmlFor="lastName" className="checkout-label">Last Name</label>
                </div>
              </div>

              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <input type="email" name="email" id="email" className="checkout-input" placeholder=" " required value={formData.email} onChange={handleChange} />
                  <label htmlFor="email" className="checkout-label">Email Address</label>
                </div>
                <div className="checkout-form-group">
                  <input type="tel" name="phone" id="phone" className="checkout-input" placeholder=" " required value={formData.phone} onChange={handleChange} />
                  <label htmlFor="phone" className="checkout-label">Phone Number</label>
                </div>
              </div>

              <div className="shipping-title-wrapper">
                <h3 className="checkout-section-title">Shipping Address</h3>
                <button 
                  type="button" 
                  onClick={handleGetLocation} 
                  disabled={locationLoading}
                  className="location-track-btn"
                >
                  {locationLoading ? <Loader2 size={16} className="spin" /> : <MapPin size={16} />}
                  Track Exact Location
                </button>
              </div>
              
              <div className="checkout-form-group">
                <input type="text" name="address" id="address" className="checkout-input" placeholder=" " required value={formData.address} onChange={handleChange} />
                <label htmlFor="address" className="checkout-label">Street Address</label>
              </div>

              <div className="checkout-form-row">
                <div className="checkout-form-group">
                  <input type="text" name="city" id="city" className="checkout-input" placeholder=" " required value={formData.city} onChange={handleChange} />
                  <label htmlFor="city" className="checkout-label">City</label>
                </div>
                <div className="checkout-form-group" style={{ flex: 0.7 }}>
                  <input type="text" name="state" id="state" className="checkout-input" placeholder=" " required value={formData.state} onChange={handleChange} />
                  <label htmlFor="state" className="checkout-label">State</label>
                </div>
                <div className="checkout-form-group" style={{ flex: 0.5 }}>
                  <input type="text" name="pincode" id="pincode" className="checkout-input" placeholder=" " required value={formData.pincode} onChange={handleChange} />
                  <label htmlFor="pincode" className="checkout-label">PIN Code</label>
                </div>
              </div>

              <h3 className="checkout-section-title" style={{ marginTop: '40px' }}>Payment Method</h3>
              
              <div className="payment-methods">
                <div 
                  className={`payment-method-card ${paymentMethod === 'cod' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="payment-radio"></div>
                  <div className="payment-info">
                    <h4>Cash on Delivery (COD)</h4>
                    <p>Pay with cash upon delivery.</p>
                  </div>
                  <Truck size={24} className="payment-icon" />
                </div>

                <div 
                  className={`payment-method-card ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="payment-radio"></div>
                  <div className="payment-info">
                    <h4>Credit Card / UPI</h4>
                    <p>Secure online payment.</p>
                  </div>
                  <CreditCard size={24} className="payment-icon" />
                </div>
              </div>

              <button type="submit" className="btn-place-order" disabled={loading}>
                {loading ? <div className="loader-spinner"></div> : (
                  <>
                    <CheckCircle size={20} /> Place Order - ₹{finalAmount}
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Right Side: Order Summary */}
          <motion.div 
            className="checkout-summary-section"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3>Order Summary</h3>
            
            <div className="summary-items">
              {cartItems.map(item => (
                <div key={item.id} className="summary-item-row">
                  <img src={item.image} alt={item.title} className="summary-item-img" />
                  <div className="summary-item-details">
                    <h4>{item.title}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="summary-item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            <div className="checkout-totals">
              <div className="coupon-code-wrapper">
                <div className="coupon-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input-box"
                  />
                  <button 
                    type="button"
                    onClick={handleApplyCoupon}
                    className="coupon-apply-btn"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="total-row">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="total-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span>
              </div>
              {discount > 0 && (
                <div className="total-row discount-row">
                  <span>Discount ({couponCode})</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="final-total">
                <span>Total</span>
                <span>₹{finalAmount}</span>
              </div>
            </div>
            
            <div className="secure-badge-container">
              <ShieldCheck size={18} /> Encrypted and Secure Checkout
            </div>
          </motion.div>
          
        </div>
      </div>
    </div>
  );
};

export default Checkout;


import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, ArrowLeft, Mail } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import useSEO from '../hooks/useSEO';
import './Auth.css';

const Auth = () => {
  useSEO({ title: 'Login / Sign Up', description: 'Sign in to your Nuzvid Agri Farms account.' });
  const location = useLocation();
  const navigate = useNavigate();
  const { setMockUser } = useAuth();

  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [systemOtp, setSystemOtp] = useState(''); // Store the generated OTP
  
  // Register State
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Sync state with URL if user uses back/forward buttons
  useEffect(() => {
    setIsLogin(location.pathname === '/login');
  }, [location.pathname]);

  const toggleMode = (mode) => {
    setIsLogin(mode === 'login');
    // Update URL without reloading page
    window.history.pushState(null, '', mode === 'login' ? '/login' : '/register');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    // ADMIN OTP FLOW FOR assist.naf@gmail.com
    if (loginEmail === 'assist.naf@gmail.com') {
      if (!otpSent) {
        // Generate OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setSystemOtp(newOtp);

        try {
          // Call our new Nodemailer API
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: loginEmail, otp: newOtp })
          });

          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.message || 'Failed to send OTP');
          }
          
          toast.success('OTP sent to your email via Nodemailer!');
          setOtpSent(true);
        } catch (err) {
          console.error('API OTP error:', err);
          // Fallback for demo if backend is not running or env vars missing
          toast.success(`Demo Mode: Email API failed. Use OTP ${newOtp} to login.`, { duration: 6000 });
          setOtpSent(true);
        } finally {
          setLoading(false);
        }
        return;
      } else {
        // Verify OTP (compare user input with generated OTP)
        if (otp === systemOtp) {
          setTimeout(() => {
            const mockAdmin = {
              email: loginEmail,
              user_metadata: { full_name: 'Farm Admin', role: 'admin' }
            };
            setMockUser(mockAdmin);
            toast.success('Admin logged in successfully!');
            const params = new URLSearchParams(location.search);
            navigate(params.get('redirect') || '/admin');
            setLoading(false);
          }, 1000);
        } else {
          toast.error('Invalid OTP. Please try again.');
          setLoading(false);
        }
        return;
      }
    }

    // MOCK LOGIN BYPASS for Legacy Admin
    if (loginEmail === 'admin@nuzvidagrifarms.com' && loginPassword === 'admin123') {
      setTimeout(() => {
        const mockAdmin = {
          email: loginEmail,
          user_metadata: { full_name: 'Farm Admin', role: 'admin' }
        };
        setMockUser(mockAdmin);
        toast.success('Logged in successfully!');
        
        const params = new URLSearchParams(location.search);
        const redirectUrl = params.get('redirect');
        navigate(redirectUrl || '/admin');
        setLoading(false);
      }, 1000);
      return;
    }

    // REGULAR USER OTP FLOW (Supabase Built-in OTP)
    if (!otpSent) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: loginEmail,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('OTP sent to your email via Supabase!');
          setOtpSent(true);
        }
      } catch (err) {
        toast.error('Failed to send OTP.');
        console.error('Supabase error:', err);
      } finally {
        setLoading(false);
      }
    } else {
      // Verify Supabase OTP
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: loginEmail,
          token: otp,
          type: 'email'
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Logged in successfully!');
          const params = new URLSearchParams(location.search);
          const redirectUrl = params.get('redirect');
          navigate(redirectUrl || '/');
        }
      } catch (err) {
        toast.error('Invalid OTP.');
        console.error('Supabase error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email: registerEmail,
      password: registerPassword,
      options: {
        data: {
          full_name: registerName,
          role: 'user'
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration successful! Please login.');
      toggleMode('login');
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className={`auth-container sliding-auth ${isLogin ? 'is-login' : 'is-register'}`}>
        
        {/* Registration Form (Left Side) */}
        <div className="auth-form-side form-register">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#666', textDecoration: 'none', marginBottom: '20px', fontSize: '14px', fontWeight: '500', width: 'fit-content' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <div className="text-center mobile-logo" style={{ marginBottom: '20px', display: 'none' }}>
            <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" alt="Nuzvid Agri Farms" style={{ height: '80px', objectFit: 'contain' }} />
          </div>
          
          <h2>Create Account</h2>
          <p className="auth-subtitle">Register to shop faster, track orders, and save favorites.</p>
          
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="you@example.com"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={20} /> {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-footer mobile-only">
            Already have an account? <span style={{color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => toggleMode('login')}>Sign In</span>
          </div>
        </div>

        {/* Login Form (Right Side) */}
        <div className="auth-form-side form-login">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#666', textDecoration: 'none', marginBottom: '20px', fontSize: '14px', fontWeight: '500', width: 'fit-content' }}>
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <div className="text-center mobile-logo" style={{ marginBottom: '20px', display: 'none' }}>
            <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" alt="Nuzvid Agri Farms" style={{ height: '80px', objectFit: 'contain' }} />
          </div>
          
          <h2>Sign In</h2>
          <p className="auth-subtitle">Log in to your Nuzvid Agri Farms account.</p>
          
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                placeholder="you@example.com"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setOtpSent(false); // Reset OTP state if email changes
                }}
                disabled={otpSent}
                style={otpSent ? { backgroundColor: '#f5f5f5', color: '#888' } : {}}
              />
            </div>
            
            {otpSent ? (
              <div className="form-group">
                <label>Enter OTP</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <small style={{ color: '#666' }}>Check your email for the OTP.</small>
                  <small 
                    style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }} 
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                  >
                    Change Email
                  </small>
                </div>
              </div>
            ) : null}
            
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              {!otpSent ? <Mail size={20} /> : <LogIn size={20} />}
              {loading 
                ? 'Processing...' 
                : (otpSent ? 'Verify OTP & Login' : 'Send OTP to Email')
              }
            </button>
          </form>
          
          <div className="auth-divider">or</div>
          
          <button type="button" className="btn-google" onClick={() => toast.error('Google login requires OAuth setup in Supabase')}>
            <FaGoogle color="#DB4437" size={18} /> Continue with Google
          </button>

          <div className="auth-footer mobile-only">
            Don't have an account? <span style={{color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => toggleMode('register')}>Create Account</span>
          </div>
        </div>

        {/* Sliding Overlay Panel */}
        <motion.div 
          className="auth-overlay-panel"
          initial={false}
          animate={{
            x: isLogin ? '0%' : '-100%',
            borderTopLeftRadius: isLogin ? '0px' : '20px',
            borderBottomLeftRadius: isLogin ? '0px' : '20px',
            borderTopRightRadius: isLogin ? '20px' : '0px',
            borderBottomRightRadius: isLogin ? '20px' : '0px',
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div 
                key="login-overlay"
                className="auth-overlay-content"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundImage: "url('https://www.nuzvidagrifarms.com/cdn/shop/files/new_1920x.jpg?v=1759635977')" }}
              >
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text text-center">
                  <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" alt="Logo" style={{ height: '80px', marginBottom: '20px', filter: 'brightness(0) invert(1)' }} />
                  <h3>Welcome Back</h3>
                  <p style={{marginBottom: '30px'}}>Sign in to your account to track orders, manage your wishlist, and checkout faster.</p>
                  <p>Don't have an account?</p>
                  <button className="btn-outline-white" onClick={() => toggleMode('register')}>Create Account</button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="register-overlay"
                className="auth-overlay-content"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                style={{ backgroundImage: "url('https://www.nuzvidagrifarms.com/cdn/shop/articles/NAF-FL-Oils_370x.jpg?v=1759150787')" }}
              >
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text text-center">
                  <img src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" alt="Logo" style={{ height: '80px', marginBottom: '20px', filter: 'brightness(0) invert(1)' }} />
                  <h3>Join Our Family</h3>
                  <p style={{marginBottom: '30px'}}>Experience the pure delight of farm-fresh, organic products delivered straight to your door.</p>
                  <p>Already have an account?</p>
                  <button className="btn-outline-white" onClick={() => toggleMode('login')}>Sign In</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </div>
  );
};

export default Auth;



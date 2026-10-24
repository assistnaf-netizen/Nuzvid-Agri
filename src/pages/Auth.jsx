import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, UserPlus, ArrowLeft, Mail } from 'lucide-react';
import { FaGoogle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import './Auth.css';

const Auth = () => {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { setMockUser, setMockAdmin } = useAuth();

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

    const isAdmin = loginEmail === 'assist.naf@gmail.com' || loginEmail === 'admin@nuzvidagrifarms.com';

    // REGULAR USER OTP FLOW (Supabase Built-in OTP)
    if (!otpSent) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email: loginEmail,
        });

        if (error) {
          toast.error(error.message);
        } else {
          toast.success('OTP sent to your email!');
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
          
          // Mock setting user context for frontend UI
          if (isAdmin) {
             const mockAdmin = {
               email: loginEmail,
               user_metadata: { full_name: 'Farm Admin', role: 'admin' }
             };
             setMockAdmin(mockAdmin);
          } else {
             const mockUser = {
               email: loginEmail,
               user_metadata: { full_name: data?.user?.user_metadata?.full_name || 'User', role: 'user' }
             };
             setMockUser(mockUser);
          }

          const params = new URLSearchParams(location.search);
          const redirectUrl = params.get('redirect');
          navigate(redirectUrl || (isAdmin ? '/admin' : '/'));
        }
      } catch (err) {
        toast.error('Invalid OTP.');
        console.error('Supabase error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (err) {
      console.error('Error logging in with Google', err);
      toast.error('An error occurred during Google Login');
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
      <SEO title="Login / Sign Up" description="Sign in to your Nuzvid Agri Farms account." />
      <div className={`auth-container sliding-auth ${isLogin ? 'is-login' : 'is-register'}`}>
        
        {/* Registration Form (Left Side) */}
        <div className="auth-form-side form-register">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <div className="text-center mobile-logo">
            <img src="/Nuzvid Agri Farms Logo.png" alt="Nuzvid Agri Farms" />
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
            <button type="submit" className="btn-primary" disabled={loading}>
              <UserPlus size={19} /> {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          
          <div className="auth-footer mobile-only">
            Already have an account? <span style={{color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold'}} onClick={() => toggleMode('login')}>Sign In</span>
          </div>
        </div>

        {/* Login Form (Right Side) */}
        <div className="auth-form-side form-login">
          <Link to="/" className="auth-back-link">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          
          <div className="text-center mobile-logo">
            <img src="/Nuzvid Agri Farms Logo.png" alt="Nuzvid Agri Farms" />
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
            
            <button type="submit" className="btn-primary" disabled={loading}>
              {!otpSent ? <Mail size={19} /> : <LogIn size={19} />}
              {loading 
                ? 'Processing...' 
                : (otpSent ? 'Verify OTP & Login' : 'Send OTP to Email')
              }
            </button>
          </form>
          
          <div className="auth-divider">or</div>
          
          <button type="button" className="btn-google" onClick={handleGoogleLogin}>
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
            x: isLogin ? '-100%' : '0%',
            borderTopLeftRadius: isLogin ? '28px' : '0px',
            borderBottomLeftRadius: isLogin ? '28px' : '0px',
            borderTopRightRadius: isLogin ? '0px' : '28px',
            borderBottomRightRadius: isLogin ? '0px' : '28px',
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
                style={{ backgroundImage: "url('/hero-banner.webp')" }}
              >
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text text-center">
                  <div className="auth-side-logo-container">
                    <img 
                      src="/Nuzvid Agri Farms Logo.png" 
                      alt="Nuzvid Agri Farms Logo" 
                      className="auth-side-logo" 
                    />
                  </div>
                  <h3>Welcome Back</h3>
                  <p style={{marginBottom: '28px'}}>Sign in to your account to track orders, manage your wishlist, and checkout faster.</p>
                  <p style={{fontSize: '14px', opacity: 0.85, marginBottom: '6px'}}>Don't have an account?</p>
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
                style={{ backgroundImage: "url('/farm-video-thumbnail.webp')" }}
              >
                <div className="auth-image-overlay"></div>
                <div className="auth-image-text text-center">
                  <div className="auth-side-logo-container">
                    <img 
                      src="/Nuzvid Agri Farms Logo.png" 
                      alt="Nuzvid Agri Farms Logo" 
                      className="auth-side-logo" 
                    />
                  </div>
                  <h3>Join Our Family</h3>
                  <p style={{marginBottom: '28px'}}>Experience the pure delight of farm-fresh, organic products delivered straight to your door.</p>
                  <p style={{fontSize: '14px', opacity: 0.85, marginBottom: '6px'}}>Already have an account?</p>
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



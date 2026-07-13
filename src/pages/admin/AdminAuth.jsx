import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Lock, Mail, ArrowLeft, ShieldCheck, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setMockUser } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      if (email === 'admin@nuzvidagrifarms.com' && password === 'admin123') {
        const mockAdmin = {
          email: email,
          user_metadata: {
            full_name: 'Farm Admin',
            role: 'admin'
          }
        };
        setMockUser(mockAdmin);
        toast.success('Admin access granted!');
        navigate('/admin');
      } else {
        toast.error('Invalid admin credentials.');
      }
      setLoading(false);
    }, 1500);
  };

  const quotes = [
    "To plant a garden is to believe in tomorrow.",
    "Agriculture is our wisest pursuit, because it will in the end contribute most to real wealth, good morals, and happiness.",
    "The ultimate goal of farming is not the growing of crops, but the cultivation and perfection of human beings."
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="admin-auth-container">
      {/* Left Panel - Branding & Greetings */}
      <div className="admin-auth-left">
        <div className="admin-auth-overlay"></div>
        <div className="admin-auth-left-content">
          <div className="admin-auth-logo">
            <img 
              src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" 
              alt="Nuzvid Agri Farms" 
              style={{ width: '220px', objectFit: 'contain', filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))' }}
            />
          </div>
          
          <div className="admin-auth-greeting">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Welcome back, Admin.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Securely manage your inventory, process orders, and oversee your agricultural operations from your dashboard.
            </motion.p>
          </div>

          <motion.div 
            className="admin-auth-quote"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <Quote size={24} color="#facc15" style={{ marginBottom: '10px' }}/>
            <p>"{randomQuote}"</p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="admin-auth-right">
        <motion.div 
          className="admin-auth-form-wrapper"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Store
          </button>

          <div className="admin-auth-header">
            <div className="admin-auth-icon">
              <ShieldCheck size={32} color="#ef4444" />
            </div>
            <h2>Admin Portal</h2>
            <p>Please authenticate to continue</p>
          </div>

          <form onSubmit={handleAdminLogin} className="admin-auth-form">
            <div className="input-group">
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                placeholder="Admin Email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                placeholder="Passkey" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <motion.button 
              type="submit" 
              className="admin-submit-btn"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <div className="spinner"></div> : 'Secure Login'}
            </motion.button>
          </form>

          <div className="admin-auth-footer">
            <Lock size={12} /> Protected by SSL Encryption
          </div>
        </motion.div>
      </div>

      <style>{`
        .admin-auth-container {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #121212;
        }

        .admin-auth-left {
          flex: 1;
          display: none;
          position: relative;
          background-image: url('https://images.unsplash.com/photo-1592982537447-6f296b02a632?q=80&w=2938&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }

        @media (min-width: 900px) {
          .admin-auth-left {
            display: flex;
            max-width: 60%;
          }
        }

        .admin-auth-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.85) 0%, rgba(234, 179, 8, 0.7) 100%);
          backdrop-filter: blur(3px);
        }

        .admin-auth-left-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 60px;
          color: white;
          width: 100%;
        }

        .admin-auth-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .admin-auth-greeting {
          margin-top: -80px;
        }

        .admin-auth-greeting h1 {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 16px 0;
          line-height: 1.1;
          letter-spacing: -1px;
          color: #ffffff;
        }

        .admin-auth-greeting p {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
          max-width: 400px;
          line-height: 1.6;
          margin: 0;
        }

        .admin-auth-quote {
          background: rgba(0, 0, 0, 0.3);
          padding: 24px;
          border-radius: 16px;
          border-left: 4px solid #facc15;
          max-width: 450px;
          backdrop-filter: blur(10px);
        }

        .admin-auth-quote p {
          margin: 0;
          font-size: 15px;
          line-height: 1.6;
          font-style: italic;
          color: rgba(255, 255, 255, 0.95);
        }

        .admin-auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #18181b;
        }

        .admin-auth-form-wrapper {
          width: 100%;
          max-width: 400px;
          background: #27272a;
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid #3f3f46;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: #a1a1aa;
          font-weight: 500;
          font-size: 14px;
          cursor: pointer;
          margin-bottom: 30px;
          padding: 0;
          transition: color 0.2s;
        }

        .back-btn:hover {
          color: #f4f4f5;
        }

        .admin-auth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .admin-auth-icon {
          width: 64px;
          height: 64px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .admin-auth-header h2 {
          font-size: 28px;
          font-weight: 700;
          color: #f4f4f5;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .admin-auth-header p {
          color: #a1a1aa;
          margin: 0;
          font-size: 15px;
        }

        .admin-auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          position: relative;
        }

        .input-icon {
          position: absolute;
          top: 50%;
          left: 16px;
          transform: translateY(-50%);
          color: #71717a;
        }

        .input-group input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: 1px solid #3f3f46;
          border-radius: 12px;
          font-size: 15px;
          color: #f4f4f5;
          background: #18181b;
          transition: all 0.2s ease;
          outline: none;
        }

        .input-group input:focus {
          border-color: #ef4444;
          background: #18181b;
          box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.15);
        }
        
        .input-group input::placeholder {
          color: #71717a;
        }

        .admin-submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(90deg, #ef4444, #facc15);
          color: #000;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 10px;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .admin-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .admin-auth-footer {
          margin-top: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 12px;
          color: #71717a;
        }

        .spinner {
          width: 22px;
          height: 22px;
          border: 3px solid rgba(0,0,0,0.2);
          border-top-color: #000;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminAuth;

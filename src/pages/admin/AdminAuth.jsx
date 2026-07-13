import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

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

  return (
    <div className="admin-auth-wrapper">
      <div className="admin-auth-card">
        
        {/* Left Side: Form */}
        <div className="admin-form-side">
          <div className="brand-logo">
            <img 
              src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png" 
              alt="Nuzvid Agri Farms" 
            />
          </div>

          <div className="auth-headings">
            <h1>Welcome Back!</h1>
            <p>Please Log in to your admin account.</p>
          </div>

          <form onSubmit={handleAdminLogin} className="auth-form">
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="admin@nuzvidagrifarms.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember me
              </label>
              <span className="forgot-password">Forgot password?</span>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? <div className="spinner"></div> : 'Login'}
              </button>
              <button type="button" className="btn-create" onClick={() => navigate('/')}>
                Back to Store
              </button>
            </div>
          </form>

          <p className="terms-text">
            By logging in you agree to our term and that you have read our data policy.
          </p>
        </div>

        {/* Right Side: Image */}
        <div className="admin-image-side">
          <img 
            src="/about-family.png" 
            alt="Agriculture Farm" 
            className="side-image"
          />
        </div>

      </div>

      <style>{`
        .admin-auth-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FDF9F3; /* Very light warm background */
          padding: 20px;
          font-family: 'Inter', sans-serif;
        }

        .admin-auth-card {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1000px;
          background: #FFFFFF;
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          overflow: hidden;
          border: 2px solid #064E3B; /* Dark green outer border */
        }

        @media (min-width: 768px) {
          .admin-auth-card {
            flex-direction: row;
            height: 650px;
          }
        }

        /* Form Side */
        .admin-form-side {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .admin-form-side {
            padding: 60px 80px;
          }
        }

        .brand-logo {
          margin-bottom: 40px;
        }

        .brand-logo img {
          height: 50px;
          object-fit: contain;
        }

        .auth-headings {
          margin-bottom: 30px;
        }

        .auth-headings h1 {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 8px 0;
        }

        .auth-headings p {
          color: #6B7280;
          font-size: 15px;
          margin: 0;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .input-group input {
          padding: 12px 16px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
          font-size: 15px;
          color: #111827;
          outline: none;
          transition: border-color 0.2s;
        }

        .input-group input:focus {
          border-color: #059669; /* Green focus */
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #4B5563;
          cursor: pointer;
        }

        .checkbox-container input {
          accent-color: #059669;
          width: 16px;
          height: 16px;
        }

        .forgot-password {
          font-size: 13px;
          color: #EF4444; /* Red color for forgot password */
          cursor: pointer;
          font-weight: 500;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .form-actions {
          display: flex;
          gap: 16px;
          margin-top: 10px;
        }

        .btn-login {
          flex: 1;
          background: #0F766E; /* Teal/Green color matching reference */
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-login:hover:not(:disabled) {
          background: #0F5A55;
        }

        .btn-login:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-create {
          flex: 1;
          background: transparent;
          color: #374151;
          border: 1px solid #D1D5DB;
          padding: 14px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-create:hover {
          background: #F3F4F6;
        }

        .terms-text {
          margin-top: 40px;
          font-size: 12px;
          color: #9CA3AF;
          line-height: 1.5;
        }

        /* Image Side */
        .admin-image-side {
          flex: 1;
          display: none;
        }

        @media (min-width: 768px) {
          .admin-image-side {
            display: block;
          }
        }

        .side-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminAuth;

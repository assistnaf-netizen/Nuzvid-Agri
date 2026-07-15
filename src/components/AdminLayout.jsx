import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, LayoutDashboard, Package, Image, ShoppingCart, Users, Tag, Settings, ChevronRight, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { to: '/admin',           label: 'Dashboard',   icon: <LayoutDashboard size={18}/>, exact: true },
  { to: '/admin/orders',   label: 'Orders',      icon: <ShoppingCart size={18}/> },
  { to: '/admin/customers',label: 'Customers',   icon: <Users size={18}/> },
  { to: '/admin/products', label: 'Products',    icon: <Package size={18}/> },
  { to: '/admin/inventory',label: 'Inventory',   icon: <ClipboardList size={18}/> },
  { to: '/admin/banners',  label: 'Banners',     icon: <Image size={18}/> },
  { to: '/admin/coupons',  label: 'Coupons',     icon: <Tag size={18}/> },
  { to: '/admin/settings', label: 'Settings',    icon: <Settings size={18}/> },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, logoutMock } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #e5e7eb', borderTopColor: '#d68d3c', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}></div>
        <div style={{ color: '#6b7280', fontWeight: 600 }}>Loading Admin...</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const handleLogout = useCallback(async () => {
    logoutMock();
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  }, [logoutMock]);

  // Auto-logout after 5 minutes of inactivity
  useEffect(() => {
    if (!user || !isAdmin) return;

    let timeoutId;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // Set timeout for 5 minutes (300,000 ms)
      timeoutId = setTimeout(() => {
        handleLogout();
        toast('Logged out due to inactivity', { icon: '🔒' });
      }, 5 * 60 * 1000);
    };

    // Listen to user activity events
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    // Initialize timer
    resetTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [user, isAdmin, handleLogout]);

  const isActive = (item) => item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="admin-layout" style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f4f6f9', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Sidebar */}
      <aside className="admin-sidebar" style={{ width: '240px', backgroundColor: '#1a1d2e', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>

        {/* Logo Area */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #d68d3c, #f5a623)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🌿</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px', color: 'white', lineHeight: 1.2 }}>NAF Admin</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>Management Console</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '10px', textDecoration: 'none',
                  color: active ? '#d68d3c' : 'rgba(255,255,255,0.55)',
                  background: active ? 'rgba(214,141,60,0.1)' : 'transparent',
                  border: active ? '1px solid rgba(214,141,60,0.15)' : '1px solid transparent',
                  fontWeight: active ? 700 : 500, fontSize: '14px',
                  transition: 'all 0.2s', gap: '10px'
                }}
                onMouseOver={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.85)'; }}}
                onMouseOut={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.icon}
                  {item.label}
                </div>
                {active && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile + Logout */}
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', marginBottom: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #d68d3c, #f5a623)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: 'white' }}>FA</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>Farm Admin</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Super Admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'transparent', border: 'none', borderRadius: '10px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '14px', fontWeight: 600, transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
          >
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {/* Top Header Bar */}
        <header className="admin-header" style={{ background: 'white', borderBottom: '1px solid #e8eaf0', padding: '0 32px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0 }}>
          
          {/* Company Branding */}
          <div className="admin-header-branding" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img
              src="https://www.nuzvidagrifarms.com/cdn/shop/files/Nuzvid_logo_463bcf9e-fbf0-4e1b-9f12-2734584a22df.png"
              alt="Nuzvid Agri Farms"
              style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
            />
            <div className="admin-header-divider" style={{ width: '1px', height: '36px', background: '#e8eaf0' }}></div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#1a1d2e', letterSpacing: '-0.3px', lineHeight: 1.2 }}>Nuzvid Agri Farms</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>Admin Management Console</div>
            </div>
          </div>

          {/* Right Side Info */}
          <div className="admin-header-info" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="admin-header-date" style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="admin-header-divider" style={{ width: '1px', height: '24px', background: '#e8eaf0' }}></div>
            <div className="admin-header-status" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }}></div>
              <span style={{ fontSize: '13px', color: '#059669', fontWeight: 700 }}>Store Live</span>
            </div>
            <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #d68d3c, #f5a623)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: 'white' }}>FA</div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-main-content" style={{ flex: 1, padding: '32px' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;

import React from 'react';
import { Link, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleColors: Record<string, string> = {
    doctor: '#28a745',
    nurse: '#17a2b8',
    admin: '#6f42c1'
  };

  const navLinkStyle: React.CSSProperties = {
    marginRight: '20px',
    textDecoration: 'none',
    color: '#495057',
    padding: '8px 16px',
    borderRadius: '6px',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f6fa' }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '15px 30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>
          Nactive Health EHR
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ 
            backgroundColor: roleColors[user.role],
            color: 'white',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.85rem',
            textTransform: 'uppercase'
          }}>
            {user.role}
          </span>
          <span style={{ color: '#666' }}>
            <strong>{user.username}</strong>
          </span>
          <button 
            onClick={handleLogout} 
            style={{ 
              padding: '8px 16px', 
              cursor: 'pointer',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            Logout
          </button>
        </div>
      </header>
      
      <nav style={{ 
        backgroundColor: 'white', 
        padding: '10px 30px',
        marginBottom: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Link to="/" style={navLinkStyle}>📊 Dashboard</Link>
        {(user.role === 'doctor' || user.role === 'nurse') && (
          <Link to="/register-patient" style={navLinkStyle}>📝 Register Patient</Link>
        )}
        {user.role === 'admin' && (
          <Link to="/audit-logs" style={{ ...navLinkStyle, backgroundColor: '#f3e5f5', color: '#6f42c1' }}>
            📋 Audit Logs
          </Link>
        )}
      </nav>

      <main style={{ padding: '0 30px 30px' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

interface AuditLog {
  id: number;
  user_role: string;
  action: string;
  entity_type: string;
  entity_id: number | null;
  timestamp: string;
}

const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get<AuditLog[]>('/audit-logs');
      setLogs(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  // Only admin can view this page
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    padding: '20px'
  };

  const actionColors: Record<string, string> = {
    CREATE: '#28a745',
    READ: '#17a2b8',
    UPDATE: '#ffc107',
    DELETE: '#dc3545'
  };

  const roleColors: Record<string, string> = {
    doctor: '#28a745',
    nurse: '#17a2b8',
    admin: '#6f42c1'
  };

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>📋 Audit Logs</h1>
        <p style={{ margin: 0, color: '#666' }}>
          View all system activity. Only administrators can access this page.
        </p>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#495057' }}>Recent Activity</h2>
          <button
            onClick={fetchLogs}
            style={{
              padding: '8px 16px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading audit logs...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#dc3545' }}>{error}</div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No audit logs found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Timestamp</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>User Role</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Action</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Entity Type</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr 
                  key={log.id} 
                  style={{ borderBottom: '1px solid #e9ecef' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ padding: '12px', color: '#6c757d', fontSize: '0.9rem' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: roleColors[log.user_role] || '#6c757d',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      textTransform: 'uppercase'
                    }}>
                      {log.user_role}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      backgroundColor: actionColors[log.action] || '#6c757d',
                      color: 'white',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>
                    {log.entity_type.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '12px', color: '#6c757d' }}>
                    {log.entity_id ? `#${log.entity_id}` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;

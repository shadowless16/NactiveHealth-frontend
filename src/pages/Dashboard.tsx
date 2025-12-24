import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Patient } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async (search?: string) => {
    try {
      setLoading(true);
      const url = search ? `/patients?search=${encodeURIComponent(search)}` : '/patients';
      const response = await api.get<Patient[]>(url);
      setPatients(response.data);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients(searchTerm);
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '2px solid #e9ecef'
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    padding: '20px',
    marginBottom: '20px'
  };

  const roleColors: Record<string, string> = {
    doctor: '#28a745',
    nurse: '#17a2b8',
    admin: '#6f42c1'
  };

  const roleColor = roleColors[user?.role || 'doctor'];

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
          {user?.role === 'admin' ? 'Admin Dashboard' :
           user?.role === 'nurse' ? 'Nurse Dashboard' : ' Doctor Dashboard'}
        </h1>
        <p style={{ margin: 0, color: '#666' }}>
          Welcome, <strong style={{ color: roleColor }}>{user?.username}</strong> 
          <span style={{ 
            backgroundColor: roleColor, 
            color: 'white', 
            padding: '2px 10px', 
            borderRadius: '12px', 
            marginLeft: '10px',
            fontSize: '0.85rem',
            textTransform: 'uppercase'
          }}>
            {user?.role}
          </span>
        </p>
      </div>

      {/* Quick Actions - Role Specific */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        {/* All roles can register patients */}
        {(user?.role === 'doctor' || user?.role === 'nurse') && (
          <Link to="/register-patient" style={{ textDecoration: 'none' }}>
            <div style={{ ...cardStyle, backgroundColor: '#e3f2fd', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem' }}>📝</div>
              <div style={{ fontWeight: 600, color: '#1976d2' }}>Register Patient</div>
            </div>
          </Link>
        )}
        
        {/* Admin only */}
        {user?.role === 'admin' && (
          <Link to="/audit-logs" style={{ textDecoration: 'none' }}>
            <div style={{ ...cardStyle, backgroundColor: '#f3e5f5', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: '2rem' }}>📊</div>
              <div style={{ fontWeight: 600, color: '#7b1fa2' }}>View Audit Logs</div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                {patients.length} patients in system
              </div>
            </div>
          </Link>
        )}

        {/* Doctor only */}
        {user?.role === 'doctor' && (
          <div style={{ ...cardStyle, backgroundColor: '#e8f5e9', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>💊</div>
            <div style={{ fontWeight: 600, color: '#388e3c' }}>Prescribe Medications</div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              Select a patient below
            </div>
          </div>
        )}

        {/* Nurse */}
        {user?.role === 'nurse' && (
          <div style={{ ...cardStyle, backgroundColor: '#e0f7fa', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem' }}>📋</div>
            <div style={{ fontWeight: 600, color: '#00838f' }}>View Records</div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
              Read-only access
            </div>
          </div>
        )}
      </div>

      {/* Search and Patient List */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#495057' }}>🔍 Patient Search</h2>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '10px 15px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                fontSize: '1rem',
                width: '250px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); fetchPatients(); }}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        {/* Patient Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading patients...</div>
        ) : patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Gender</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#495057' }}>DOB</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#495057' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr 
                  key={patient.id} 
                  style={{ borderBottom: '1px solid #e9ecef' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <td style={{ padding: '12px', color: '#6c757d' }}>#{patient.id}</td>
                  <td style={{ padding: '12px', fontWeight: 500 }}>{patient.full_name}</td>
                  <td style={{ padding: '12px', textTransform: 'capitalize' }}>{patient.gender}</td>
                  <td style={{ padding: '12px' }}>{patient.phone || '-'}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      style={{
                        padding: '6px 16px',
                        backgroundColor: roleColor,
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      {user?.role === 'doctor' ? 'View / Prescribe' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Role Info */}
      <div style={{ ...cardStyle, backgroundColor: '#fff8e1', marginTop: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#f9a825' }}>ℹ️ Your Permissions</h3>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#6d4c41' }}>
          {user?.role === 'doctor' && (
            <>
              <li>Create patients and encounters</li>
              <li><strong>Create prescriptions</strong></li>
              <li>View all patient records</li>
            </>
          )}
          {user?.role === 'nurse' && (
            <>
              <li>Create patients and encounters</li>
              <li>Cannot create prescriptions</li>
              <li>View patient records (read-only)</li>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <li>View all patients</li>
              <li>Cannot create encounters or prescriptions</li>
              <li>Access audit logs</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;

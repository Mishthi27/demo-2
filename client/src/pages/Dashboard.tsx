import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Dashboard.css';

interface DashboardData {
  students: number;
  teachers: number;
  attendance: number;
  alerts: number;
  growth: number;
}

const Dashboard: React.FC = () => {
  const { user, token, logout } = useUser();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/dashboard/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'field_worker': return 'Field Worker';
      case 'admin': return 'Administrator';
      case 'analyst': return 'Data Analyst';
      default: return role;
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <h2>Reaching Roots Foundation</h2>
        </div>
        <div className="nav-menu">
          <button onClick={() => navigate('/dashboard')} className="nav-link active">
            Dashboard
          </button>
          <button onClick={() => navigate('/form')} className="nav-link">
            Submit Form
          </button>
          {user?.role === 'admin' && (
            <>
              <button onClick={() => navigate('/upload')} className="nav-link">
                Upload PDF
              </button>
              <button onClick={() => navigate('/chatbot')} className="nav-link">
                AI Chatbot
              </button>
            </>
          )}
          <button onClick={() => navigate('/reports')} className="nav-link">
            Reports
          </button>
        </div>
        <div className="nav-user">
          <span className="user-info">
            {user?.email} ({getRoleDisplayName(user?.role || '')})
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1>Welcome, {user?.email}</h1>
          <p>Role: {getRoleDisplayName(user?.role || '')}</p>
        </div>

        {loading ? (
          <div className="loading">Loading dashboard data...</div>
        ) : (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>Total Students</h3>
              <div className="card-value">{dashboardData?.students || 0}</div>
            </div>
            <div className="dashboard-card">
              <h3>Total Teachers</h3>
              <div className="card-value">{dashboardData?.teachers || 0}</div>
            </div>
            <div className="dashboard-card">
              <h3>Attendance Rate</h3>
              <div className="card-value">{dashboardData?.attendance || 0}%</div>
            </div>
            <div className="dashboard-card">
              <h3>Active Alerts</h3>
              <div className="card-value">{dashboardData?.alerts || 0}</div>
            </div>
            <div className="dashboard-card">
              <h3>Growth Rate</h3>
              <div className="card-value">{dashboardData?.growth || 0}%</div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/form')} className="action-button">
              📝 Submit Field Data
            </button>
            {user?.role === 'admin' && (
              <>
                <button onClick={() => navigate('/upload')} className="action-button">
                  📄 Upload PDF
                </button>
                <button onClick={() => navigate('/chatbot')} className="action-button">
                  🤖 AI Assistant
                </button>
              </>
            )}
            <button onClick={() => navigate('/reports')} className="action-button">
              📊 Generate Report
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 
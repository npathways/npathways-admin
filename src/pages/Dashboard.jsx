import React from 'react';
import { 
  Users, 
  MousePointerClick, 
  Send, 
  TrendingUp 
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { label: 'Total Users', value: '1,284', icon: <Users />, change: '+12%' },
    { label: 'Website Visits', value: '42.5k', icon: <MousePointerClick />, change: '+18%' },
    { label: 'New Leads', value: '156', icon: <Send />, change: '+5%' },
    { label: 'Conversion Rate', value: '3.2%', icon: <TrendingUp />, change: '+2%' },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, here's what's happening with Npathways today.</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="card stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <h2 className="stat-value">{stat.value}</h2>
              <span className="stat-change">{stat.change} vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card recent-activity">
          <h3>Recent Activity</h3>
          <div className="placeholder-list">
            {[1,2,3,4].map(i => (
              <div key={i} className="list-item">
                <div className="item-dot"></div>
                <div className="item-text">
                  <p><strong>New Lead:</strong> Sarah Connor applied for Bootcamp 2024</p>
                  <span>2 hours ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="btn-secondary">Add New User</button>
            <button className="btn-secondary">Create Bootcamp</button>
            <button className="btn-secondary">Export Leads</button>
            <button className="btn-secondary">View Reports</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

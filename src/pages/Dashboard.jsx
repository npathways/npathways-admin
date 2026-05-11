import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { FiTrendingUp, FiPieChart, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import './Pages.css';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/leads');
      const data = await response.json();
      setLeads(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // Process data for Timeline (Leads over last 7 days)
  const processTimelineData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      count: leads.filter(l => l.createdAt.split('T')[0] === date).length
    }));
  };

  // Process data for Category Pie Chart
  const processCategoryData = () => {
    const categories = ['Student', 'Parent', 'Working Professional'];
    return categories.map(cat => ({
      name: cat,
      value: leads.filter(l => l.category === cat).length
    }));
  };

  // Process data for Pipeline Bar Chart
  const processPipelineData = () => {
    const stages = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
    return stages.map(stage => ({
      stage,
      count: leads.filter(l => l.pipelineStage === stage).length
    }));
  };

  const COLORS = ['#000000', '#4F46E5', '#7C3AED', '#10B981', '#EF4444'];

  if (loading) return (
    <div className="loading-state">
      <FiRefreshCw className="spin" />
      <p>Building analytics...</p>
    </div>
  );

  return (
    <div className="dashboard-page premium-layout">
      <div className="page-header-premium">
        <div className="header-text">
          <h1>Analytics Overview</h1>
          <p>Visualizing your inquiry pipeline and conversion performance.</p>
        </div>
        <button onClick={fetchLeads} className="refresh-btn">
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      <div className="charts-grid-premium">
        {/* Timeline Chart */}
        <div className="chart-card-premium full-width">
          <div className="chart-header">
            <FiTrendingUp /> <h3>Inquiry Velocity (Last 7 Days)</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#000" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#000', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline Bar Chart */}
        <div className="chart-card-premium">
          <div className="chart-header">
            <FiBarChart2 /> <h3>Conversion Pipeline</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processPipelineData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {processPipelineData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="chart-card-premium">
          <div className="chart-header">
            <FiPieChart /> <h3>Audience Split</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={processCategoryData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {processCategoryData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login - in a real app, this would call an API
    localStorage.setItem('isAuthenticated', 'true');
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-visual">
        <div className="visual-content">
          <h1>NPATHWAYS</h1>
          <p>The Institute of Global Pathways <br /> Admin Portal</p>
          <div className="security-badge">
            <ShieldCheck size={16} />
            <span>Secure Connection Active</span>
          </div>
        </div>
      </div>
      
      <div className="login-form-side">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please enter your credentials to access the admin panel.</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  placeholder="admin@npathways.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-row">
                <label>Password</label>
                <a href="#" className="forgot-link">Forgot?</a>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <button 
                  type="button" 
                  className="toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-container">
                <input type="checkbox" />
                <span className="checkmark"></span>
                Remember this device
              </label>
            </div>

            <button type="submit" className="btn-primary login-btn">
              Sign In
            </button>
          </form>

          <div className="login-footer">
            <p>&copy; 2024 Skillinum Falcon LLP. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

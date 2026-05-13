import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import './Login.css';
import { useToast } from '../Components/Common/Toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role
        }));
        localStorage.setItem('isAuthenticated', 'true');
        addToast('Login successful', 'success');
        navigate('/');
      } else {
        addToast(data.message || 'Invalid credentials', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      addToast('Connection failed. Is the backend running?', 'error');
    } finally {
      setIsLoading(false);
    }
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

            <button 
              type="submit" 
              className="btn-primary login-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} />
                  Signing In...
                </>
              ) : 'Sign In'}
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

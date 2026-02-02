import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, User, Phone, MapPin, BarChart3, Users, Target, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    address: '',
    phone: ''
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData);
      }

      if (result.success) {
        // Redirect based on role
        if (result.user.role === 'seller') {
          navigate('/seller');
        } else {
          navigate(from === '/login' ? '/' : from);
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Login/Register error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="login-branding-content">
            <div className="login-logo">
              <img
                src="/logo.jpeg"
                alt="SalesEdge Logo"
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '12px',
                  objectFit: 'cover'
                }}
              />
              <div className="login-logo-text">
                <h1>SalesEdge</h1>
                <span>Avani Enterprises CRM</span>
              </div>
            </div>

            <div className="login-tagline">
              <h2>Manage Your Sales Team with Confidence</h2>
              <p>Track performance, commissions, and analytics across all your cities and sellers.</p>
            </div>

            <div className="login-features">
              <div className="login-feature">
                <div className="login-feature-icon">
                  <BarChart3 size={24} color="white" />
                </div>
                <div>
                  <h4>Real-time Analytics</h4>
                  <p>Track revenue, commissions, and performance</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <Users size={24} color="white" />
                </div>
                <div>
                  <h4>Team Management</h4>
                  <p>Manage sellers across multiple cities</p>
                </div>
              </div>
              <div className="login-feature">
                <div className="login-feature-icon">
                  <Target size={24} color="white" />
                </div>
                <div>
                  <h4>Target Tracking</h4>
                  <p>Set and monitor monthly sales targets</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-container">
          <div className="login-form-wrapper">
            <div className="login-form-header">
              <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p>{isLogin ? 'Sign in to continue to your dashboard' : 'Register to get started'}</p>
            </div>

            {error && (
              <div className="login-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              {!isLogin && (
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" size={18} />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <>
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={18} />
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <div className="input-wrapper">
                      <MapPin className="input-icon" size={18} />
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your full address"
                        rows={2}
                        style={{ 
                          paddingLeft: '48px',
                          resize: 'vertical',
                          minHeight: '44px'
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <div className="input-wrapper">
                      <Phone className="input-icon" size={18} />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span>
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="login-switch">
              <p>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                >
                  {isLogin ? 'Register here' : 'Sign in'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: var(--bg-main);
        }

        .login-container {
          display: flex;
          min-height: 100vh;
        }

        .login-branding {
          flex: 1;
          background: linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-dark) 100%);
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .login-branding-content {
          max-width: 480px;
          color: var(--text-white);
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 48px;
        }

        .login-logo-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .login-logo-text h1 {
          font-size: 1.75rem;
          color: var(--text-white);
          margin: 0;
        }

        .login-logo-text span {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .login-tagline {
          margin-bottom: 48px;
        }

        .login-tagline h2 {
          font-size: 2.5rem;
          line-height: 1.2;
          margin-bottom: 16px;
          color: var(--text-white);
        }

        .login-tagline p {
          font-size: 1.125rem;
          opacity: 0.9;
          line-height: 1.6;
        }

        .login-features {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .login-feature {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }

        .login-feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .login-feature h4 {
          font-size: 1rem;
          color: var(--text-white);
          margin-bottom: 4px;
        }

        .login-feature p {
          font-size: 0.875rem;
          opacity: 0.8;
          margin: 0;
        }

        .login-form-container {
          flex: 1;
          padding: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-white);
        }

        .login-form-wrapper {
          width: 100%;
          max-width: 420px;
        }

        .login-form-header {
          margin-bottom: 32px;
          text-align: center;
        }

        .login-form-header h2 {
          font-size: 1.75rem;
          color: var(--primary-brand);
          margin-bottom: 8px;
        }

        .login-form-header p {
          color: var(--text-muted);
          margin: 0;
        }

        .login-error {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
          font-size: 0.9rem;
          border: 1px solid rgba(220, 53, 69, 0.2);
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: var(--text-muted);
        }

        .input-wrapper input {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 1px solid var(--accent-beige);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: var(--text-primary);
          background: var(--bg-main);
          transition: all var(--transition-fast);
        }

        .input-wrapper textarea {
          width: 100%;
          padding: 14px 16px 14px 48px;
          border: 1px solid var(--accent-beige);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          color: var(--text-primary);
          background: var(--bg-main);
          transition: all var(--transition-fast);
          font-family: inherit;
        }

        .input-wrapper input:focus,
        .input-wrapper textarea:focus {
          outline: none;
          border-color: var(--primary-brand);
          background: var(--bg-white);
          box-shadow: 0 0 0 3px rgba(122, 74, 46, 0.1);
        }

        .input-wrapper input::placeholder,
        .input-wrapper textarea::placeholder {
          color: var(--text-muted);
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }

        .password-toggle:hover {
          color: var(--primary-brand);
        }

        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .w-full {
          width: 100%;
        }

        .login-switch {
          margin-top: 24px;
          text-align: center;
        }

        .login-switch p {
          color: var(--text-muted);
          margin: 0;
        }

        .login-switch button {
          background: none;
          border: none;
          color: var(--primary-brand);
          font-weight: 600;
          cursor: pointer;
        }

        .login-switch button:hover {
          text-decoration: underline;
        }

        .login-demo {
          margin-top: 32px;
          padding: 16px;
          background: var(--bg-main);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .login-demo p {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .demo-creds {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .demo-creds span {
          font-size: 0.8rem;
          color: var(--text-primary);
          font-family: monospace;
        }

        @media (max-width: 1024px) {
          .login-branding {
            display: none;
          }

          .login-form-container {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;

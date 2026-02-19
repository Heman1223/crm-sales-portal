import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Mail, Lock, MapPin, Phone, ShieldCheck, Clock, BarChart4, ChevronLeft, AlertCircle } from 'lucide-react';
import LandingHeader from '../components/layout/LandingHeader';
import Footer from '../components/layout/Footer';
import { LOCATIONS, STATES } from '../utils/locations';

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const errorTimeoutRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    state: '',
    city: '',
    address: '',
    phone: ''
  });

  const { isAuthenticated, user, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'seller') {
        navigate('/seller');
      } else {
        navigate('/admin-dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData({ ...formData, state: value, city: '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (showError) {
      setShowError(false);
      setError('');
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    }
  };

  const displayError = (errorMessage) => {
    setError(errorMessage);
    setShowError(true);
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      setShowError(false);
      setError('');
    }, 10000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');
    setShowError(false);

    try {
      const result = await register(formData);
      if (result && result.success) {
        if (result.user.role === 'seller') {
          navigate('/seller');
        } else {
          navigate('/admin-dashboard');
        }
      } else {
        setLoading(false);
        displayError(result?.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      displayError('Connection error. Please try again later.');
    }
  };

  return (
    <div className="login-wrapper">
      <LandingHeader />

      <main className="login-main">
        <div className="login-visual-container">
          {/* Left Side - Branding */}
          <div className="login-branding-v2">
            <div className="branding-glass-card">
              <div className="branding-logo-v2">
                <img src="/logo.jpeg" alt="HR Portal Logo" />
              </div>
              <h1 className="branding-title">SALES CRM</h1>
              <p className="branding-subtitle">Join the High-Performance Sales Team</p>
              <p className="branding-desc">
                Create your account to access the Avani Sales CRM.
                Manage your leads, track your commissions, and exceed your targets.
              </p>

              <div className="branding-features-v2">
                <div className="b-feature">
                  <ShieldCheck size={20} />
                  <span>Global Sales</span>
                </div>
                <div className="b-feature">
                  <BarChart4 size={20} />
                  <span>Performance Analytics</span>
                </div>
                <div className="b-feature">
                  <Clock size={20} />
                  <span>Target Achievement</span>
                </div>
              </div>
            </div>

            <div className="branding-arrow-separator">
              <div className="arrow-circle" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                <ChevronLeft size={32} />
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="login-form-container-v2">
            <div className="form-content-v2">
              <div className="form-header-v2">
                <h2>Create Account</h2>
                <p>Register to get started</p>
              </div>

              {showError && error && (
                <div className="login-error-v2">
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form-v2">
                <div className="form-group-v2">
                  <label><User size={16} style={{ marginRight: '8px' }} />Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="form-group-v2">
                  <label><Mail size={16} style={{ marginRight: '8px' }} />Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="form-group-v2">
                  <label><Lock size={16} style={{ marginRight: '8px' }} />Password</label>
                  <div className="password-input-v2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="toggle-visibility"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="form-row-v2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group-v2">
                    <label><MapPin size={16} style={{ marginRight: '8px' }} />State</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="form-input-v2"
                      required
                    >
                      <option value="">Select State</option>
                      {STATES.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group-v2">
                    <label><MapPin size={16} style={{ marginRight: '8px' }} />City</label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-input-v2"
                      disabled={!formData.state}
                      required
                    >
                      <option value="">Select City</option>
                      {formData.state && LOCATIONS[formData.state].map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-group-v2">
                  <label><Phone size={16} style={{ marginRight: '8px' }} />Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                  />
                </div>

                <div className="form-group-v2">
                  <label><MapPin size={16} style={{ marginRight: '8px' }} />Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Full Address"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-login-v2"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Register'}
                </button>
              </form>

              <div className="login-footer-links-v2">
                <p>Already have an account? <button onClick={() => navigate('/login')}>Login here</button></p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background-color: #FDF5E6;
          padding-top: 110px; /* Space for fixed header */
          padding-bottom: 40px;
        }

        .login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .login-visual-container {
          display: flex;
          width: 100%;
          max-width: 1100px;
          min-height: 750px;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(122, 74, 46, 0.15);
        }

        .login-branding-v2 {
          flex: 1.1;
          background: #7A4A2E;
          position: relative;
          padding: 60px;
          display: flex;
          align-items: center;
          color: white;
        }

        .branding-glass-card {
          width: 100%;
          z-index: 2;
        }

        .branding-logo-v2 {
          width: 80px;
          height: 80px;
          margin: 0 auto 30px;
          background: white;
          padding: 5px;
          border-radius: 12px;
        }

        .branding-logo-v2 img {
          width: 100%;
          height: 100%;
          border-radius: 8px;
          object-fit: cover;
        }

        .branding-title {
          font-size: 3rem;
          color: white;
          text-align: center;
          margin: 0 0 10px;
          font-weight: 700;
          letter-spacing: 2px;
        }

        .branding-subtitle {
          font-size: 1.1rem;
          text-align: center;
          font-weight: 600;
          margin-bottom: 30px;
          color: #E6C9A8;
        }

        .branding-desc {
          text-align: center;
          font-size: 0.95rem;
          line-height: 1.6;
          opacity: 0.9;
          margin-bottom: 40px;
        }

        .branding-features-v2 {
          display: flex;
          flex-direction: column;
          gap: 20px;
          max-width: 300px;
          margin: 0 auto;
        }

        .b-feature {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .login-branding-v2::after {
          content: '';
          position: absolute;
          right: -40px;
          top: 0;
          height: 100%;
          width: 80px;
          background: #7A4A2E;
          clip-path: polygon(0% 0%, 50% 0%, 100% 50%, 50% 100%, 0% 100%);
        }

        .branding-arrow-separator {
          position: absolute;
          right: -30px;
          top: 0;
          height: 100%;
          width: 60px;
          z-index: 5;
          display: flex;
          align-items: center;
        }

        .arrow-circle {
          width: 60px;
          height: 60px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #7A4A2E;
          box-shadow: 10px 0 20px rgba(0,0,0,0.1);
          border: 1px solid #E6C9A8;
          z-index: 10;
          margin-left: -30px;
        }

        .login-form-container-v2 {
          flex: 1;
          background: white;
          padding: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-content-v2 {
          width: 100%;
          max-width: 400px;
        }

        .form-header-v2 {
          text-align: center;
          margin-bottom: 30px;
        }

        .form-header-v2 h2 {
          font-size: 2.2rem;
          color: #2D1A12;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .form-header-v2 p {
          color: #7A6A5A;
        }

        .login-error-v2 {
          background: #FFF0F0;
          color: #D32F2F;
          padding: 12px 15px;
          border-radius: 8px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          border-left: 4px solid #D32F2F;
        }

        .form-group-v2 {
          margin-bottom: 15px;
        }

        .form-group-v2 label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: #3B2A1A;
          margin-bottom: 5px;
        }

        .form-group-v2 input, .form-group-v2 select {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #E6C9A8;
          border-radius: 8px;
          font-size: 0.95rem;
          background-color: white;
        }

        .form-group-v2 input:focus {
          outline: none;
          border-color: #7A4A2E;
          box-shadow: 0 0 0 4px rgba(122, 74, 46, 0.1);
        }

        .password-input-v2 {
          position: relative;
        }

        .toggle-visibility {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #7A6A5A;
          cursor: pointer;
        }

        .btn-login-v2 {
          width: 100%;
          background: #7A4A2E;
          color: white;
          border: none;
          padding: 14px;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .btn-login-v2:hover {
          background: #613B25;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(122, 74, 46, 0.3);
        }

        .btn-login-v2:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-footer-links-v2 {
          margin-top: 25px;
          text-align: center;
        }

        .login-footer-links-v2 p {
          color: #7A6A5A;
          font-size: 0.9rem;
        }

        .login-footer-links-v2 button {
          background: none;
          border: none;
          color: #7A4A2E;
          font-weight: 700;
          cursor: pointer;
        }

        .login-footer-links-v2 button:hover {
          text-decoration: underline;
        }

        @media (max-width: 1024px) {
          .login-branding-v2 { display: none; }
          .login-visual-container { max-width: 500px; }
        }

        @media (max-width: 600px) {
          .login-wrapper { padding-top: 90px; }
          .login-form-container-v2 { padding: 40px 20px; }
          .form-header-v2 h2 { font-size: 1.8rem; }
          .form-row-v2 { grid-template-columns: 1fr !important; gap: 0 !important; }
          .login-visual-container { border-radius: 0; min-height: auto; }
          .login-main { padding: 0; }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LandingHeader = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDashboardClick = () => {
    if (user?.role === 'seller') {
      navigate('/seller');
    } else {
      navigate('/admin-dashboard');
    }
  };

  return (
    <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="landing-header-container">
        <div className="landing-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.jpeg" alt="Avani Sales CRM Logo" />
          <h1>AVANI SALES CRM</h1>
        </div>
        <div className="landing-nav">
          {isAuthenticated ? (
            <button className="btn-landing-nav dashboard" onClick={handleDashboardClick}>Dashboard</button>
          ) : (
            <>
              <button className="btn-landing-nav" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-landing-nav register" onClick={() => navigate('/register')}>Register</button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .landing-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          background-color: #7A4A2E;
          color: white;
          padding: 12px 40px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .landing-header.scrolled {
          background-color: #FDF5E6;
          padding: 8px 40px;
          box-shadow: 0 4px 20px rgba(122, 74, 46, 0.15);
        }

        .landing-header-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .landing-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .landing-logo img {
          width: 40px;
          height: 40px;
          border-radius: 6px;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .landing-logo h1 {
          margin: 0;
          font-size: 1.1rem;
          color: white;
          letter-spacing: 2px;
          font-weight: 700;
          transition: color 0.4s ease;
        }

        .landing-header.scrolled .landing-logo h1 {
          color: #7A4A2E;
        }

        .landing-nav {
          display: flex;
          gap: 15px;
        }

        .btn-landing-nav {
          background: white;
          color: #7A4A2E;
          border: 1px solid transparent;
          padding: 8px 25px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .landing-header.scrolled .btn-landing-nav {
          background: #7A4A2E;
          color: white;
        }

        .btn-landing-nav:hover {
          background: #f8f8f8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .landing-header.scrolled .btn-landing-nav:hover {
          background: #613B25;
          color: white;
        }

        @media (max-width: 600px) {
          .landing-header {
            padding: 10px 15px;
          }
          .landing-header.scrolled {
            padding: 8px 15px;
          }
          .landing-logo {
            gap: 8px;
          }
          .landing-logo img {
            width: 32px;
            height: 32px;
          }
          .landing-logo h1 {
            font-size: 0.8rem;
            letter-spacing: 1px;
          }
          .landing-nav {
            gap: 8px;
          }
          .btn-landing-nav {
            padding: 6px 12px;
            font-size: 0.75rem;
          }
        }
      `}</style>
    </header>
  );
};

export default LandingHeader;

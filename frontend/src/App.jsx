import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import SellerDashboard from './pages/SellerDashboard';
import TeamPage from './pages/TeamPage';
import CommissionsPage from './pages/CommissionsPage';
import CitiesPage from './pages/CitiesPage';
import PerformancePage from './pages/PerformancePage';
import SalesPage from './pages/SalesPage';
import TargetsPage from './pages/TargetsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import ServicesPage from './pages/ServicesPage';
import ServicesListingPage from './pages/ServicesListingPage';
import './styles/styles.css';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            {/* Public Route - Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<Layout title="Admin Dashboard" />}>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/team" element={<TeamPage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/services" element={<ServicesPage />} />
              </Route>
            </Route>

            {/* Seller Routes */}
            <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
              <Route element={<Layout title="Seller Dashboard" />}>
                <Route path="/seller" element={<SellerDashboard />} />
                <Route path="/seller/targets" element={<TargetsPage />} />
                <Route path="/seller/sales" element={<SalesPage />} />
                <Route path="/seller/commissions" element={<CommissionsPage />} />
              </Route>
            </Route>

            {/* Shared Routes (both roles) */}
            <Route element={<ProtectedRoute allowedRoles={['admin', 'seller']} />}>
              <Route element={<Layout title="Dashboard" />}>
                <Route path="/commissions" element={<CommissionsPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/targets" element={<TargetsPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/services-listing" element={<ServicesListingPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/help" element={<HelpPage />} />
              </Route>
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

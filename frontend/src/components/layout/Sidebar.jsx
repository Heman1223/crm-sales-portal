import {
    LayoutDashboard,
    Users,
    TrendingUp,
    DollarSign,
    MapPin,
    BarChart3,
    Settings,
    HelpCircle,
    LogOut,
    FileText,
    Target,
    Award,
    ShoppingCart,
    Package,
    X
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ userRole = 'admin', isOpen = false, onClose = () => { } }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const adminNavItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Sales Team', path: '/team' },
        { icon: TrendingUp, label: 'Performance', path: '/performance' },
        { icon: DollarSign, label: 'Commissions', path: '/commissions' },
        { icon: MapPin, label: 'City Analytics', path: '/cities' },
        { icon: ShoppingCart, label: 'All Sales', path: '/sales' },
        { icon: Target, label: 'Targets', path: '/targets' },
        { icon: Package, label: 'Services', path: '/services' },
        { icon: BarChart3, label: 'Reports', path: '/reports' },
    ];

    const sellerNavItems = [
        { icon: LayoutDashboard, label: 'My Dashboard', path: '/seller' },
        { icon: Target, label: 'My Targets', path: '/seller/targets' },
        { icon: DollarSign, label: 'Commissions', path: '/commissions' },
        { icon: Award, label: 'Performance', path: '/performance' },
        { icon: FileText, label: 'My Sales', path: '/seller/sales' },
        { icon: Package, label: 'Services Rate Card', path: '/services-listing' },
    ];

    const navItems = userRole === 'admin' ? adminNavItems : sellerNavItems;

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userName = user?.name || 'User';
    const userTitle = userRole === 'admin' ? 'Admin Manager' : 'Sales Executive';

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <img
                        src="/logo.jpeg"
                        alt="Logo"
                        className="sidebar-logo-img"
                        style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '10px',
                            objectFit: 'cover'
                        }}
                    />
                    <div className="sidebar-logo-text">
                        <h1>SalesEdge</h1>
                        <span>Enterprise CRM</span>
                    </div>
                </div>
                <button
                    className="sidebar-close-btn"
                    onClick={onClose}
                    aria-label="Close sidebar"
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <span className="nav-section-title">Main Menu</span>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <item.icon className="nav-item-icon" />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </div>

                <div className="nav-section">
                    <span className="nav-section-title">Settings</span>
                    <NavLink to="/settings" className="nav-item" onClick={onClose}>
                        <Settings className="nav-item-icon" />
                        <span>Settings</span>
                    </NavLink>
                    <NavLink to="/help" className="nav-item" onClick={onClose}>
                        <HelpCircle className="nav-item-icon" />
                        <span>Help & Support</span>
                    </NavLink>
                    <button onClick={() => { handleLogout(); onClose(); }} className="nav-item logout-btn">
                        <LogOut className="nav-item-icon" />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }} />
                        ) : (
                            getInitials(userName)
                        )}
                    </div>
                    <div className="sidebar-user-info">
                        <h4>{userName}</h4>
                        <span>{userTitle}</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

import { useState, useEffect, useRef } from 'react';
import { Bell, ChevronDown, LogOut, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { salesAPI } from '../../utils/api';

const Navbar = ({ title = 'Dashboard' }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Close dropdowns when clicking outside
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            // Get recent sales as notifications
            const response = await salesAPI.getAll({ limit: 10 });
            const recentSales = response.data.slice(0, 5).map((sale, index) => ({
                id: sale._id,
                type: 'sale',
                title: `New sale: ${sale.client}`,
                message: `₹${sale.amount.toLocaleString()} - ${sale.service}`,
                time: new Date(sale.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                read: index > 1 // First 2 are unread
            }));
            setNotifications(recentSales);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };


    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userName = user?.name || 'User';
    const userTitle = user?.role === 'admin' ? 'Admin Manager' : 'Sales Executive';
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <header className="navbar">
            <div className="navbar-left">
                <h2 className="navbar-title">{title}</h2>
            </div>

            <div className="navbar-right">
                <div className="notification-wrapper" ref={notificationRef}>
                    <button
                        className="navbar-icon-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="badge">{unreadCount}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="notification-dropdown">
                            <div className="notification-header">
                                <h4>Notifications</h4>
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="mark-all-read">
                                        <Check size={14} /> Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="notification-list">
                                {notifications.length === 0 ? (
                                    <div className="notification-empty">No notifications</div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                            onClick={() => markAsRead(notification.id)}
                                        >
                                            <div className="notification-content">
                                                <div className="notification-title">{notification.title}</div>
                                                <div className="notification-message">{notification.message}</div>
                                            </div>
                                            <div className="notification-time">{notification.time}</div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="notification-footer">
                                <button onClick={() => { navigate('/sales'); setShowNotifications(false); }}>
                                    View all activity
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="navbar-profile" onClick={() => navigate('/settings')}>
                    <div className="navbar-profile-avatar">
                        {getInitials(userName)}
                    </div>
                    <div className="navbar-profile-info">
                        <span>{userName}</span>
                        <span>{userTitle}</span>
                    </div>
                    <ChevronDown size={16} />
                </div>

                <button className="navbar-icon-btn" onClick={handleLogout} title="Logout">
                    <LogOut size={20} />
                </button>
            </div>

            <style>{`
                .notification-wrapper {
                    position: relative;
                }
                .notification-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 360px;
                    background: var(--bg-white);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-xl);
                    border: 1px solid var(--accent-light);
                    z-index: 1000;
                    margin-top: 8px;
                }
                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    border-bottom: 1px solid var(--accent-light);
                }
                .notification-header h4 {
                    margin: 0;
                    color: var(--text-primary);
                }
                .mark-all-read {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    background: none;
                    border: none;
                    color: var(--primary-brand);
                    font-size: 0.8rem;
                    cursor: pointer;
                }
                .notification-list {
                    max-height: 320px;
                    overflow-y: auto;
                }
                .notification-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--accent-light);
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .notification-item:hover {
                    background: var(--bg-main);
                }
                .notification-item.unread {
                    background: rgba(122, 74, 46, 0.05);
                    border-left: 3px solid var(--primary-brand);
                }
                .notification-content {
                    flex: 1;
                }
                .notification-title {
                    font-weight: 500;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }
                .notification-message {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .notification-time {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    white-space: nowrap;
                    margin-left: 12px;
                }
                .notification-empty {
                    padding: 32px;
                    text-align: center;
                    color: var(--text-muted);
                }
                .notification-footer {
                    padding: 12px 16px;
                    border-top: 1px solid var(--accent-light);
                    text-align: center;
                }
                .notification-footer button {
                    background: none;
                    border: none;
                    color: var(--primary-brand);
                    font-weight: 500;
                    cursor: pointer;
                }
                
                .search-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: var(--bg-white);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-lg);
                    border: 1px solid var(--accent-light);
                    z-index: 1000;
                    margin-top: 4px;
                }
                .search-result {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--accent-light);
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .search-result:hover {
                    background: var(--bg-main);
                }
                .search-result:last-child {
                    border-bottom: none;
                }
                .search-result-title {
                    font-weight: 500;
                    color: var(--text-primary);
                }
                .search-result-meta {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                .navbar-search {
                    position: relative;
                }
            `}</style>
        </header>
    );
};

export default Navbar;

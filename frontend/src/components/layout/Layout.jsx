import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ title = 'Dashboard' }) => {
    const { user } = useAuth();
    const userRole = user?.role || 'admin';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (for mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [title]);

    // Close sidebar when window resizes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 768) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="app-layout">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}
            <Sidebar
                userRole={userRole}
                isOpen={sidebarOpen}
                onClose={closeSidebar}
            />
            <main className="main-content">
                <Navbar
                    title={title}
                    userRole={userRole}
                    onMenuToggle={toggleSidebar}
                />
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

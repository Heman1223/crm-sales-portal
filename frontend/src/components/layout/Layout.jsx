import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ title = 'Dashboard' }) => {
    const { user } = useAuth();
    const userRole = user?.role || 'admin';

    return (
        <div className="app-layout">
            <Sidebar userRole={userRole} />
            <main className="main-content">
                <Navbar title={title} userRole={userRole} />
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;

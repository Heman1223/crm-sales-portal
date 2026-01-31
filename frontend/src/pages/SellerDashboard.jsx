import { useState, useEffect } from 'react';
import {
    DollarSign,
    Target,
    TrendingUp,
    Award,
    Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, salesAPI, targetsAPI } from '../utils/api';
import StatCard from '../components/dashboard/StatCard';
import PerformanceRanking from '../components/dashboard/PerformanceRanking';
import { TargetLineChart, CommissionBarChart } from '../components/dashboard/Charts';

const SellerDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        thisMonth: { totalRevenue: 0, totalCommission: 0, totalSales: 0 },
        trends: { revenue: 0, sales: 0, commission: 0 }
    });
    const [currentTarget, setCurrentTarget] = useState(null);
    const [revenueData, setRevenueData] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [myRank, setMyRank] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [
                dashboardRes,
                revenueRes,
                performersRes,
                salesRes,
                targetsRes
            ] = await Promise.all([
                analyticsAPI.getDashboard(),
                analyticsAPI.getRevenue(),
                analyticsAPI.getTopPerformers(10),
                salesAPI.getAll({ limit: 5 }),
                targetsAPI.getCurrent()
            ]);

            setDashboardData(dashboardRes.data);
            setRevenueData(revenueRes.data);
            setTopPerformers(performersRes.data);
            setRecentSales(salesRes.data);

            if (targetsRes.data.length > 0) {
                setCurrentTarget(targetsRes.data[0]);
            }

            // Find my rank
            const rank = performersRes.data.findIndex(p => p._id === user._id);
            setMyRank(rank >= 0 ? rank + 1 : null);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const targetPercentage = currentTarget
        ? Math.round((currentTarget.achievedAmount / currentTarget.targetAmount) * 100)
        : 0;

    const stats = [
        {
            icon: DollarSign,
            value: `₹${dashboardData.thisMonth?.totalRevenue?.toLocaleString() || 0}`,
            label: 'My Total Sales',
            trend: dashboardData.trends?.revenue || 0,
            trendValue: `${dashboardData.trends?.revenue >= 0 ? '+' : ''}${dashboardData.trends?.revenue || 0}%`,
            footer: { text: 'This month' }
        },
        {
            icon: TrendingUp,
            value: `₹${dashboardData.thisMonth?.totalCommission?.toLocaleString() || 0}`,
            label: 'Commission Earned',
            trend: dashboardData.trends?.commission || 0,
            trendValue: `${dashboardData.trends?.commission >= 0 ? '+' : ''}${dashboardData.trends?.commission || 0}%`,
            footer: { text: 'This month' }
        },
        {
            icon: Target,
            value: `${targetPercentage}%`,
            label: 'Target Achieved',
            trend: targetPercentage >= 75 ? 1 : -1,
            trendValue: currentTarget ? `₹${currentTarget.achievedAmount.toLocaleString()} / ₹${currentTarget.targetAmount.toLocaleString()}` : 'No target set',
            footer: { text: 'Monthly target' }
        },
        {
            icon: Award,
            value: myRank ? `#${myRank}` : '-',
            label: 'My Ranking',
            trend: 0,
            trendValue: '',
            footer: { text: `Out of ${topPerformers.length} sellers` }
        }
    ];

    // Convert revenue data for target chart
    const targetChartData = revenueData.map(item => ({
        name: item.name,
        achieved: item.revenue,
        target: currentTarget?.targetAmount ? Math.round(currentTarget.targetAmount / 12) : 0
    }));

    // Commission history data
    const commissionData = revenueData.slice(-6).map(item => ({
        name: item.name,
        commission: item.commission
    }));

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>Welcome, {user?.name?.split(' ')[0] || 'Seller'}!</h1>
                        <p>Track your sales performance, commissions, and rankings.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span className="btn btn-secondary btn-sm">
                            <Calendar size={16} />
                            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            {/* Target Progress */}
            {currentTarget && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h3 className="card-title">Monthly Target Progress</h3>
                        <span className="badge badge-secondary">
                            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            <div className="progress-container">
                                <div className="progress-header">
                                    <span className="progress-label">Sales Target</span>
                                    <span className="progress-value">
                                        ₹{currentTarget.achievedAmount.toLocaleString()} / ₹{currentTarget.targetAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${Math.min(targetPercentage, 100)}%` }} />
                                </div>
                            </div>
                            <div className="progress-container">
                                <div className="progress-header">
                                    <span className="progress-label">New Clients</span>
                                    <span className="progress-value">
                                        {currentTarget.achievedClients} / {currentTarget.targetClients}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${Math.min((currentTarget.achievedClients / currentTarget.targetClients) * 100, 100)}%` }} />
                                </div>
                            </div>
                            <div className="progress-container">
                                <div className="progress-header">
                                    <span className="progress-label">Premium Sales</span>
                                    <span className="progress-value">
                                        {currentTarget.achievedPremiumSales} / {currentTarget.targetPremiumSales}
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${Math.min((currentTarget.achievedPremiumSales / currentTarget.targetPremiumSales) * 100, 100)}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">My Sales Trend</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container large">
                            {revenueData.length > 0 ? (
                                <TargetLineChart data={targetChartData} />
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                                    No sales data yet. Start selling to track your progress!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Team Rankings</h3>
                        {myRank && <span className="badge badge-success">Your Position: #{myRank}</span>}
                    </div>
                    <div className="card-body">
                        {topPerformers.length > 0 ? (
                            <PerformanceRanking
                                performers={topPerformers.slice(0, 5).map((p, index) => ({
                                    id: p._id,
                                    name: p._id === user._id ? `${p.name} (You)` : p.name,
                                    avatar: p.avatar,
                                    city: p.city,
                                    value: p.totalRevenue,
                                    metric: 'Sales'
                                }))}
                            />
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                                No ranking data available yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-grid equal" style={{ marginTop: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Commission History</h3>
                        <a href="/seller/commissions" className="btn btn-ghost btn-sm">View All</a>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            {commissionData.length > 0 ? (
                                <CommissionBarChart data={commissionData} />
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No commission data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">My Recent Sales</h3>
                        <a href="/seller/sales" className="btn btn-ghost btn-sm">View All</a>
                    </div>
                    <div className="card-body">
                        {recentSales.length > 0 ? (
                            <ul className="activity-list">
                                {recentSales.map((sale, index) => (
                                    <li key={index} className="activity-item">
                                        <div className="activity-icon">
                                            <DollarSign size={18} />
                                        </div>
                                        <div className="activity-content">
                                            <p><strong>{sale.client}</strong> - {sale.service}</p>
                                            <time>{new Date(sale.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</time>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 600, color: 'var(--primary-brand)' }}>
                                                ₹{sale.amount.toLocaleString()}
                                            </div>
                                            <span className={`badge badge-${sale.status === 'Approved' ? 'success' : 'warning'}`}>
                                                {sale.status}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                                No sales recorded yet. Log your first sale!
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">Quick Actions</h3>
                </div>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <a href="/seller/sales" className="btn btn-primary">
                            <DollarSign size={18} />
                            Log New Sale
                        </a>
                        <a href="/seller/targets" className="btn btn-secondary">
                            <Target size={18} />
                            View Targets
                        </a>
                        <a href="/performance" className="btn btn-secondary">
                            <TrendingUp size={18} />
                            Performance Report
                        </a>
                        <a href="/performance" className="btn btn-secondary">
                            <Award size={18} />
                            Leaderboard
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;

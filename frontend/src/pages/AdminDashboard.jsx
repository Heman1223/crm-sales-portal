import { useState, useEffect } from 'react';
import {
    DollarSign,
    Users,
    TrendingUp,
    ShoppingCart,
    Calendar,
    Download,
    MoreHorizontal
} from 'lucide-react';
import { analyticsAPI, salesAPI } from '../utils/api';
import StatCard from '../components/dashboard/StatCard';
import DataTable from '../components/dashboard/DataTable';
import PerformanceRanking from '../components/dashboard/PerformanceRanking';
import {
    RevenueAreaChart,
    CityPerformanceChart,
    ComparisonBarChart,
    SalesDistributionChart
} from '../components/dashboard/Charts';

const AdminDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        thisMonth: { totalRevenue: 0, totalCommission: 0, totalSales: 0 },
        trends: { revenue: 0, sales: 0, commission: 0 },
        activeSellers: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [cityData, setCityData] = useState([]);
    const [distributionData, setDistributionData] = useState([]);
    const [topPerformers, setTopPerformers] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [
                dashboardRes,
                revenueRes,
                citiesRes,
                distributionRes,
                performersRes,
                salesRes,
                weeklyRes
            ] = await Promise.all([
                analyticsAPI.getDashboard(),
                analyticsAPI.getRevenue(),
                analyticsAPI.getCities(),
                analyticsAPI.getSalesDistribution(),
                analyticsAPI.getTopPerformers(5),
                salesAPI.getAll({ limit: 5 }),
                analyticsAPI.getWeekly()
            ]);

            setDashboardData(dashboardRes.data);
            setRevenueData(revenueRes.data);
            setCityData(citiesRes.data);
            setDistributionData(distributionRes.data);
            setTopPerformers(performersRes.data);
            setRecentSales(salesRes.data);
            setWeeklyData(weeklyRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            icon: DollarSign,
            value: `₹${dashboardData.thisMonth?.totalRevenue?.toLocaleString() || 0}`,
            label: 'Total Revenue',
            trend: dashboardData.trends?.revenue || 0,
            trendValue: `${dashboardData.trends?.revenue >= 0 ? '+' : ''}${dashboardData.trends?.revenue || 0}%`,
            footer: { text: 'vs last month', link: { href: '/reports', text: 'View Report' } }
        },
        {
            icon: ShoppingCart,
            value: dashboardData.thisMonth?.totalSales?.toLocaleString() || 0,
            label: 'Total Sales',
            trend: dashboardData.trends?.sales || 0,
            trendValue: `${dashboardData.trends?.sales >= 0 ? '+' : ''}${dashboardData.trends?.sales || 0}%`,
            footer: { text: 'vs last month' }
        },
        {
            icon: Users,
            value: dashboardData.activeSellers || 0,
            label: 'Active Sellers',
            trend: 0,
            trendValue: '',
            footer: { text: 'Active team members' }
        },
        {
            icon: TrendingUp,
            value: `₹${dashboardData.thisMonth?.totalCommission?.toLocaleString() || 0}`,
            label: 'Commission Paid',
            trend: dashboardData.trends?.commission || 0,
            trendValue: `${dashboardData.trends?.commission >= 0 ? '+' : ''}${dashboardData.trends?.commission || 0}%`,
            footer: { text: 'vs last month' }
        }
    ];

    const recentSalesColumns = [
        {
            header: 'Seller',
            render: (row) => (
                <div className="cell-user">
                    <div className="cell-user-avatar">
                        {row.seller?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                    </div>
                    <div className="cell-user-info">
                        <span>{row.seller?.name || 'Unknown'}</span>
                        <span>{row.city}</span>
                    </div>
                </div>
            )
        },
        { header: 'Service', accessor: 'service' },
        { header: 'Amount', render: (row) => `₹${(row.amount || 0).toLocaleString()}` },
        { header: 'Commission', render: (row) => `₹${(row.commission || 0).toLocaleString()}` },
        {
            header: 'Status',
            render: (row) => (
                <span className={`badge badge-${row.status === 'Completed' ? 'success' : row.status === 'Pending' ? 'warning' : 'muted'}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Date',
            render: (row) => new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        }
    ];

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Welcome back! Here's an overview of your sales performance.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="btn btn-secondary btn-sm" style={{ cursor: 'default' }}>
                            <Calendar size={16} />
                            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </div>
                        <a href="/reports" className="btn btn-primary btn-sm">
                            <Download size={16} />
                            View Reports
                        </a>
                    </div>
                </div>
            </div>

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Revenue Overview</h3>
                        <button className="btn btn-ghost btn-sm">
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="chart-container large">
                            {revenueData.length > 0 ? (
                                <RevenueAreaChart data={revenueData} />
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No revenue data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Top Performers</h3>
                        <a href="/performance" className="btn btn-ghost btn-sm">View All</a>
                    </div>
                    <div className="card-body">
                        {topPerformers.length > 0 ? (
                            <PerformanceRanking
                                performers={topPerformers.map(p => ({
                                    id: p._id,
                                    name: p.name,
                                    city: p.city,
                                    value: p.totalRevenue,
                                    metric: 'Revenue'
                                }))}
                            />
                        ) : (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                                No performer data yet. Sales will appear here.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="dashboard-grid equal" style={{ marginBottom: '24px' }}>
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">City-wise Performance</h3>
                        <a href="/cities" className="btn btn-ghost btn-sm">View Details</a>
                    </div>
                    <div className="card-body">
                        <div className="chart-container large">
                            {cityData.length > 0 ? (
                                <CityPerformanceChart data={cityData} />
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No city data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Sales Distribution</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container large">
                            {distributionData.length > 0 ? (
                                <SalesDistributionChart data={distributionData} />
                            ) : (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No distribution data yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {weeklyData.length > 0 && (
                <div className="card" style={{ marginBottom: '24px' }}>
                    <div className="card-header">
                        <h3 className="card-title">Weekly Revenue vs Commission</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <ComparisonBarChart data={weeklyData} />
                        </div>
                    </div>
                </div>
            )}

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Recent Sales</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <a href="/sales" className="btn btn-ghost btn-sm">View All</a>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {recentSales.length > 0 ? (
                        <DataTable columns={recentSalesColumns} data={recentSales} />
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px' }}>
                            No sales recorded yet. Start logging sales to see them here.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

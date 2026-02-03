import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Download, Filter, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { salesAPI, usersAPI } from '../utils/api';
import DataTable from '../components/dashboard/DataTable';
import { CommissionBarChart } from '../components/dashboard/Charts';

const CommissionsPage = () => {
    const { user, isAdmin } = useAuth();
    const [commissions, setCommissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, paid: 0 });
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchCommissions();
    }, [selectedMonth, selectedYear]);

    const fetchCommissions = async () => {
        try {
            const startDate = new Date(selectedYear, selectedMonth - 1, 1);
            const endDate = new Date(selectedYear, selectedMonth, 0);

            const response = await salesAPI.getAll({
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            });

            const sales = response.data;

            // Calculate stats
            const totalCommission = sales.reduce((sum, sale) => sum + sale.commission, 0);
            const completedCommission = sales
                .filter(s => s.status === 'Approved')
                .reduce((sum, sale) => sum + sale.commission, 0);
            const pendingCommission = totalCommission - completedCommission;

            setStats({
                total: totalCommission,
                paid: completedCommission,
                pending: pendingCommission
            });

            setCommissions(sales);
        } catch (error) {
            console.error('Error fetching commissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            header: 'Seller',
            render: (row) => (
                <div className="cell-user">
                    <div className="cell-user-avatar">
                        {row.seller?.avatar ? (
                            <img src={row.seller.avatar} alt="Avatar" style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }} />
                        ) : (
                            row.seller?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'
                        )}
                    </div>
                    <div className="cell-user-info">
                        <span>{row.seller?.name || 'Unknown'}</span>
                        <span>{row.seller?.city || '-'}</span>
                    </div>
                </div>
            )
        },
        { header: 'Client', accessor: 'client' },
        { header: 'Service', render: (row) => row.service?.name || row.serviceName || 'Unknown Service' },
        {
            header: 'Sale Amount',
            render: (row) => `₹${row.amount.toLocaleString()}`
        },
        {
            header: 'Commission',
            render: (row) => (
                <strong style={{ color: 'var(--primary-brand)' }}>
                    ₹{row.commission.toLocaleString()}
                </strong>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`badge ${row.status === 'Approved' ? 'badge-success' :
                    row.status === 'Pending' ? 'badge-warning' : 'badge-muted'
                    }`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Date',
            render: (row) => new Date(row.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })
        }
    ];

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Prepare chart data
    const chartData = months.map((month, index) => ({
        name: month.slice(0, 3),
        commission: commissions
            .filter(c => new Date(c.date).getMonth() === index)
            .reduce((sum, c) => sum + c.commission, 0)
    })).slice(0, selectedMonth);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>{isAdmin ? 'All Commissions' : 'My Commissions'}</h1>
                        <p>Track commission earnings and payment status</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(Number(e.target.value))}
                            className="select-input"
                        >
                            {months.map((month, index) => (
                                <option key={month} value={index + 1}>{month}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="select-input"
                        >
                            <option value={2026}>2026</option>
                            <option value={2025}>2025</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><DollarSign /></div>
                    </div>
                    <div className="stat-card-value">₹{stats.total.toLocaleString()}</div>
                    <div className="stat-card-label">Total Commission</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><TrendingUp /></div>
                    </div>
                    <div className="stat-card-value">₹{stats.paid.toLocaleString()}</div>
                    <div className="stat-card-label">Paid (Approved)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><Calendar /></div>
                    </div>
                    <div className="stat-card-value">₹{stats.pending.toLocaleString()}</div>
                    <div className="stat-card-label">Pending</div>
                </div>
            </div>

            {/* Chart */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">Commission Trend</h3>
                </div>
                <div className="card-body">
                    <div className="chart-container">
                        <CommissionBarChart data={chartData} />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Commission Details</h3>
                    <span className="badge badge-secondary">{commissions.length} records</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Loading...
                        </div>
                    ) : commissions.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No commissions found for this period.
                        </div>
                    ) : (
                        <DataTable columns={columns} data={commissions} />
                    )}
                </div>
            </div>

        </div>
    );
};

export default CommissionsPage;

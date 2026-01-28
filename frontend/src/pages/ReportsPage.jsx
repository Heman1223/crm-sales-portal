import { useState, useEffect } from 'react';
import {
    Download,
    FileText,
    Calendar,
    BarChart3,
    Filter
} from 'lucide-react';
import { salesAPI, analyticsAPI, usersAPI } from '../utils/api';

const ReportsPage = () => {
    const [reportType, setReportType] = useState('sales');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState('');

    const reportTypes = [
        { id: 'sales', label: 'Sales Report', icon: BarChart3 },
        { id: 'cities', label: 'City Performance', icon: BarChart3 },
        { id: 'performers', label: 'Seller Performance', icon: BarChart3 }
    ];

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        generateReport();
    }, [reportType, dateRange, selectedCity]);

    const fetchCities = async () => {
        try {
            const response = await usersAPI.getCities();
            setCities(response.data || []);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const generateReport = async () => {
        setLoading(true);
        try {
            let data = [];

            if (reportType === 'sales') {
                const params = {
                    limit: 1000,
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                };
                if (selectedCity) params.city = selectedCity;

                const response = await salesAPI.getAll(params);
                data = response.data.map(sale => ({
                    Date: new Date(sale.date).toLocaleDateString('en-IN'),
                    Seller: sale.seller?.name || 'Unknown',
                    Client: sale.client,
                    Service: sale.service,
                    City: sale.city,
                    Amount: sale.amount,
                    Commission: sale.commission,
                    Status: sale.status
                }));
            } else if (reportType === 'cities') {
                const response = await analyticsAPI.getCities();
                data = response.data.map(city => ({
                    City: city._id || 'Unknown',
                    'Total Revenue': city.totalRevenue,
                    'Total Commission': city.totalCommission,
                    'Sales Count': city.salesCount
                }));
            } else if (reportType === 'performers') {
                const response = await analyticsAPI.getTopPerformers(100);
                data = response.data.map((performer, index) => ({
                    Rank: index + 1,
                    Name: performer.name,
                    City: performer.city || 'Unknown',
                    Email: performer.email || '',
                    'Total Revenue': performer.totalRevenue,
                    'Total Commission': performer.totalCommission,
                    'Sales Count': performer.salesCount
                }));
            }

            setReportData(data);
        } catch (error) {
            console.error('Error generating report:', error);
            setReportData([]);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = () => {
        if (reportData.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(reportData[0]);
        const csvContent = [
            headers.join(','),
            ...reportData.map(row =>
                headers.map(header => {
                    let cell = row[header];
                    // Escape quotes and wrap in quotes if contains comma
                    if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"'))) {
                        cell = `"${cell.replace(/"/g, '""')}"`;
                    }
                    return cell;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const totalAmount = reportType === 'sales'
        ? reportData.reduce((sum, r) => sum + (r.Amount || 0), 0)
        : reportData.reduce((sum, r) => sum + (r['Total Revenue'] || 0), 0);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Reports</h1>
                        <p>Generate and export reports</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={exportToCSV}
                        disabled={reportData.length === 0}
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Report Type Selection */}
            <div className="report-types">
                {reportTypes.map(type => (
                    <button
                        key={type.id}
                        className={`report-type-btn ${reportType === type.id ? 'active' : ''}`}
                        onClick={() => setReportType(type.id)}
                    >
                        <type.icon size={24} />
                        <span>{type.label}</span>
                    </button>
                ))}
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-body">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label><Calendar size={14} /> Start Date</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="date-input"
                            />
                        </div>
                        <div className="filter-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="date-input"
                            />
                        </div>
                        {reportType === 'sales' && (
                            <div className="filter-group">
                                <label><Filter size={14} /> City</label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="select-input"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Report Summary */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><FileText /></div>
                    </div>
                    <div className="stat-card-value">{reportData.length}</div>
                    <div className="stat-card-label">Total Records</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><BarChart3 /></div>
                    </div>
                    <div className="stat-card-value">₹{totalAmount.toLocaleString()}</div>
                    <div className="stat-card-label">Total Revenue</div>
                </div>
            </div>

            {/* Report Data Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        {reportTypes.find(r => r.id === reportType)?.label} - Preview
                    </h3>
                    <span className="badge badge-secondary">{reportData.length} records</span>
                </div>
                <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Loading...
                        </div>
                    ) : reportData.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No data found for the selected criteria.
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {Object.keys(reportData[0]).map(key => (
                                        <th key={key}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.slice(0, 50).map((row, index) => (
                                    <tr key={index}>
                                        {Object.values(row).map((value, i) => (
                                            <td key={i}>
                                                {typeof value === 'number' && Object.keys(row)[i].includes('Revenue')
                                                    ? `₹${value.toLocaleString()}`
                                                    : typeof value === 'number' && Object.keys(row)[i].includes('Commission')
                                                        ? `₹${value.toLocaleString()}`
                                                        : typeof value === 'number' && Object.keys(row)[i] === 'Amount'
                                                            ? `₹${value.toLocaleString()}`
                                                            : value
                                                }
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                    {reportData.length > 50 && (
                        <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', borderTop: '1px solid var(--accent-light)' }}>
                            Showing first 50 of {reportData.length} records. Export to CSV to see all.
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .report-types {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }
        .report-type-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background: var(--bg-white);
          border: 2px solid var(--accent-light);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all 0.2s;
        }
        .report-type-btn:hover {
          border-color: var(--primary-brand);
          transform: translateY(-2px);
        }
        .report-type-btn.active {
          border-color: var(--primary-brand);
          background: rgba(122, 74, 46, 0.05);
          color: var(--primary-brand);
        }
        .report-type-btn span {
          font-weight: 500;
        }
        .filters-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: flex-end;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .filter-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .date-input, .select-input {
          padding: 10px 16px;
          border: 1px solid var(--accent-beige);
          border-radius: var(--radius-md);
          background: var(--bg-white);
          font-size: 0.9rem;
          color: var(--text-primary);
          min-width: 160px;
        }
        .date-input:focus, .select-input:focus {
          outline: none;
          border-color: var(--primary-brand);
        }
      `}</style>
        </div>
    );
};

export default ReportsPage;

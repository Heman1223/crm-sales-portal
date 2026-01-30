import { useState, useEffect } from 'react';
import { Trophy, Award, Medal, Filter } from 'lucide-react';
import { analyticsAPI, usersAPI, servicesAPI } from '../utils/api';

const PerformancePage = () => {
    const [performers, setPerformers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        city: '',
        service: '',
        period: 'all'
    });
    const [cities, setCities] = useState([]);
    const [services, setServices] = useState([]);

    useEffect(() => {
        fetchCities();
        fetchServices();
    }, []);

    useEffect(() => {
        fetchPerformers();
    }, [filters]);

    const fetchCities = async () => {
        try {
            const response = await usersAPI.getCities();
            setCities(response.data || []);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await servicesAPI.getAll();
            setServices(response.data || []);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchPerformers = async () => {
        setLoading(true);
        try {
            const params = { limit: 50 };
            if (filters.city) params.city = filters.city;
            if (filters.service) params.service = filters.service;
            if (filters.period) params.period = filters.period;

            const response = await analyticsAPI.getTopPerformers(50, params);
            setPerformers(response.data);
        } catch (error) {
            console.error('Error fetching performers:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const topThree = performers.slice(0, 3);
    const restPerformers = performers.slice(3);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Performance Leaderboard</h1>
                        <p>Track and celebrate top performers</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-body">
                    <div className="filters-row">
                        <div className="filter-group">
                            <label><Filter size={14} /> Filter by City</label>
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="select-input"
                            >
                                <option value="">All Cities</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Filter by Service</label>
                            <select
                                value={filters.service}
                                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                                className="select-input"
                            >
                                <option value="">All Services</option>
                                {services.map(service => (
                                    <option key={service._id} value={service.name}>{service.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Time Period</label>
                            <select
                                value={filters.period}
                                onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                                className="select-input"
                            >
                                <option value="all">All Time</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                        </div>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setFilters({ city: '', service: '', period: 'all' })}
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Top 3 Podium */}
            {!loading && topThree.length > 0 && (
                <div className="podium-container">
                    {/* Second Place */}
                    {topThree[1] && (
                        <div className="podium-item silver">
                            <div className="podium-avatar">
                                {getInitials(topThree[1].name)}
                            </div>
                            <div className="podium-medal">
                                <Medal size={28} />
                                <span>2nd</span>
                            </div>
                            <h3>{topThree[1].name}</h3>
                            <p>{topThree[1].city || 'Unknown'}</p>
                            <div className="podium-value">₹{topThree[1].totalRevenue?.toLocaleString() || 0}</div>
                            <div className="podium-base second" />
                        </div>
                    )}

                    {/* First Place */}
                    {topThree[0] && (
                        <div className="podium-item gold">
                            <div className="podium-avatar">
                                {getInitials(topThree[0].name)}
                            </div>
                            <div className="podium-medal">
                                <Trophy size={32} />
                                <span>1st</span>
                            </div>
                            <h3>{topThree[0].name}</h3>
                            <p>{topThree[0].city || 'Unknown'}</p>
                            <div className="podium-value">₹{topThree[0].totalRevenue?.toLocaleString() || 0}</div>
                            <div className="podium-base first" />
                        </div>
                    )}

                    {/* Third Place */}
                    {topThree[2] && (
                        <div className="podium-item bronze">
                            <div className="podium-avatar">
                                {getInitials(topThree[2].name)}
                            </div>
                            <div className="podium-medal">
                                <Award size={24} />
                                <span>3rd</span>
                            </div>
                            <h3>{topThree[2].name}</h3>
                            <p>{topThree[2].city || 'Unknown'}</p>
                            <div className="podium-value">₹{topThree[2].totalRevenue?.toLocaleString() || 0}</div>
                            <div className="podium-base third" />
                        </div>
                    )}
                </div>
            )}

            {/* Full Ranking List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Full Rankings</h3>
                    <span className="badge badge-secondary">{performers.length} sellers</span>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Loading...
                        </div>
                    ) : performers.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No performers found for the selected filters.
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Seller</th>
                                        <th>City</th>
                                        <th>Total Revenue</th>
                                        <th>Commission</th>
                                        <th>Sales</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {performers.map((performer, index) => (
                                        <tr key={performer._id}>
                                            <td>
                                                <span className={`rank-badge ${index < 3 ? `top-${index + 1}` : ''}`}>
                                                    #{index + 1}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="cell-user">
                                                    <div className="cell-user-avatar">
                                                        {getInitials(performer.name)}
                                                    </div>
                                                    <div className="cell-user-info">
                                                        <span>{performer.name}</span>
                                                        <span>{performer.email || '-'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{performer.city || '-'}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--primary-brand)' }}>
                                                ₹{performer.totalRevenue?.toLocaleString() || 0}
                                            </td>
                                            <td>₹{performer.totalCommission?.toLocaleString() || 0}</td>
                                            <td>{performer.salesCount || 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PerformancePage;

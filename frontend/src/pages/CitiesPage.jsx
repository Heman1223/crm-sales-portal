import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Users, DollarSign, Search, ArrowUpDown, Filter } from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { CityPerformanceChart, SalesDistributionChart } from '../components/dashboard/Charts';

const CitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('revenue');
    const [sortOrder, setSortOrder] = useState('desc');

    useEffect(() => {
        fetchCityData();
    }, [sortBy, sortOrder]);

    useEffect(() => {
        filterAndSortCities();
    }, [cities, searchQuery, sortBy, sortOrder]);

    const fetchCityData = async () => {
        try {
            const response = await analyticsAPI.getCities({ sortBy, sortOrder });
            setCities(response.data);

            const total = response.data.reduce((sum, city) => sum + (city.revenue || 0), 0);
            setTotalRevenue(total || 0);
        } catch (error) {
            console.error('Error fetching city data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCities = () => {
        let filtered = cities;

        // Apply search filter
        if (searchQuery) {
            filtered = cities.filter(city =>
                city.city?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredCities(filtered);
    };

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const getPercentage = (value) => {
        if (totalRevenue === 0) return 0;
        return ((value / totalRevenue) * 100).toFixed(1);
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>City Analytics</h1>
                        <p>View performance breakdown by city with filtering and sorting</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="navbar-search" style={{ width: '200px' }}>
                            <Search className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search cities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            className={`btn btn-sm ${sortBy === 'revenue' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleSortChange('revenue')}
                        >
                            <ArrowUpDown size={14} />
                            Revenue {sortBy === 'revenue' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                            className={`btn btn-sm ${sortBy === 'commission' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleSortChange('commission')}
                        >
                            <ArrowUpDown size={14} />
                            Commission {sortBy === 'commission' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                            className={`btn btn-sm ${sortBy === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleSortChange('sales')}
                        >
                            <ArrowUpDown size={14} />
                            Sales {sortBy === 'sales' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><MapPin /></div>
                    </div>
                    <div className="stat-card-value">{filteredCities.length}</div>
                    <div className="stat-card-label">{searchQuery ? 'Filtered' : 'Active'} Cities</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><DollarSign /></div>
                    </div>
                    <div className="stat-card-value">₹{totalRevenue.toLocaleString()}</div>
                    <div className="stat-card-label">Total Revenue</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><TrendingUp /></div>
                    </div>
                    <div className="stat-card-value">
                        ₹{filteredCities.length > 0 ? Math.round(totalRevenue / filteredCities.length).toLocaleString() : 0}
                    </div>
                    <div className="stat-card-label">Avg per City</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><Users /></div>
                    </div>
                    <div className="stat-card-value">
                        {filteredCities.reduce((sum, city) => sum + (city.salesCount || 0), 0)}
                    </div>
                    <div className="stat-card-label">Total Sales</div>
                </div>
            </div>

            {/* Charts */}
            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Revenue by City</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container large">
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    Loading...
                                </div>
                            ) : (
                                <CityPerformanceChart data={filteredCities} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">City Distribution</h3>
                    </div>
                    <div className="card-body">
                        <div className="chart-container large">
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    Loading...
                                </div>
                            ) : (
                                <SalesDistributionChart
                                    data={filteredCities.slice(0, 6).map(c => ({ name: c.city, value: c.revenue }))}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* City Cards */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">City Performance Details</h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                    ) : filteredCities.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            {searchQuery ? 'No cities found matching your search.' : 'No city data available.'}
                        </p>
                    ) : (
                        <div className="city-grid">
                            {filteredCities.map((city, index) => (
                                <div key={city.city || index} className="city-card">
                                    <div className="city-card-header">
                                        <div className={`city-rank ${index < 3 ? 'top' : ''}`}>
                                            #{index + 1}
                                        </div>
                                        <h4>{city.city || 'Unknown'}</h4>
                                    </div>
                                    <div className="city-stats">
                                        <div className="city-stat">
                                            <span className="city-stat-value">₹{(city.revenue || 0).toLocaleString()}</span>
                                            <span className="city-stat-label">Revenue</span>
                                        </div>
                                        <div className="city-stat">
                                            <span className="city-stat-value">{city.salesCount || 0}</span>
                                            <span className="city-stat-label">Sales</span>
                                        </div>
                                        <div className="city-stat">
                                            <span className="city-stat-value">{getPercentage(city.revenue || 0)}%</span>
                                            <span className="city-stat-label">Share</span>
                                        </div>
                                    </div>
                                    <div className="city-progress">
                                        <div
                                            className="city-progress-bar"
                                            style={{ width: `${getPercentage(city.revenue || 0)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default CitiesPage;

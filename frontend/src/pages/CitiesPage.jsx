import { useState, useEffect } from 'react';
import { MapPin, TrendingUp, Users, DollarSign } from 'lucide-react';
import { analyticsAPI } from '../utils/api';
import { CityPerformanceChart, SalesDistributionChart } from '../components/dashboard/Charts';

const CitiesPage = () => {
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);

    useEffect(() => {
        fetchCityData();
    }, []);

    const fetchCityData = async () => {
        try {
            const response = await analyticsAPI.getCities();
            setCities(response.data);

            const total = response.data.reduce((sum, city) => sum + (city.revenue || 0), 0);
            setTotalRevenue(total || 0);
        } catch (error) {
            console.error('Error fetching city data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPercentage = (value) => {
        if (totalRevenue === 0) return 0;
        return ((value / totalRevenue) * 100).toFixed(1);
    };

    return (
        <div>
            <div className="page-header">
                <h1>City Analytics</h1>
                <p>View performance breakdown by city</p>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><MapPin /></div>
                    </div>
                    <div className="stat-card-value">{cities.length}</div>
                    <div className="stat-card-label">Active Cities</div>
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
                        ₹{cities.length > 0 ? Math.round(totalRevenue / cities.length).toLocaleString() : 0}
                    </div>
                    <div className="stat-card-label">Avg per City</div>
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
                                <CityPerformanceChart data={cities} />
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
                                    data={cities.slice(0, 6).map(c => ({ name: c.city, value: c.revenue }))}
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
                    ) : cities.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No city data available.</p>
                    ) : (
                        <div className="city-grid">
                            {cities.map((city, index) => (
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

            <style>{`
        .city-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .city-card {
          background: var(--bg-main);
          border-radius: var(--radius-md);
          padding: 20px;
          border: 1px solid var(--accent-light);
        }
        .city-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }
        .city-rank {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .city-rank.top {
          background: linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-dark) 100%);
          color: white;
        }
        .city-card-header h4 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text-primary);
        }
        .city-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .city-stat {
          text-align: center;
        }
        .city-stat-value {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--primary-brand);
        }
        .city-stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .city-progress {
          height: 6px;
          background: var(--accent-light);
          border-radius: 3px;
          overflow: hidden;
        }
        .city-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-brand), var(--accent-beige));
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      `}</style>
        </div>
    );
};

export default CitiesPage;

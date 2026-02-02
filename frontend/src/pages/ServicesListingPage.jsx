import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Grid,
    List,
    DollarSign,
    Percent,
    Tag,
    ArrowUpDown
} from 'lucide-react';
import { servicesAPI } from '../utils/api';
import { useToast } from '../components/common/Toast';

const ServicesListingPage = () => {
    const toast = useToast();
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        sortBy: 'category',
        sortOrder: 'asc'
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchServices();
    }, [filters, searchQuery]);

    const fetchData = async () => {
        try {
            const [servicesRes, categoriesRes] = await Promise.all([
                servicesAPI.getRateCard(),
                servicesAPI.getCategories()
            ]);
            
            setServices(servicesRes.data.services);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const params = {
                ...filters,
                search: searchQuery
            };
            const response = await servicesAPI.getRateCard(params);
            setServices(response.data.services);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSortChange = (sortBy) => {
        setFilters(prev => ({
            ...prev,
            sortBy,
            sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
        }));
    };

    const ServiceCard = ({ service }) => (
        <div className="service-card">
            <div className="service-card-header">
                <div className="service-category">
                    <Tag size={14} />
                    {service.category}
                </div>
                <div className="service-commission">
                    {service.commissionRate}%
                </div>
            </div>
            <div className="service-card-body">
                <h3 className="service-name">{service.name}</h3>
                {service.description && (
                    <p className="service-description">{service.description}</p>
                )}
                <div className="service-pricing">
                    <div className="service-price">
                        <DollarSign size={16} />
                        <span>₹{service.basePrice?.toLocaleString() || 'Custom'}</span>
                    </div>
                    <div className="service-commission-rate">
                        <Percent size={16} />
                        <span>{service.commissionRate}% Commission</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const ServiceRow = ({ service }) => (
        <tr className="service-row">
            <td>
                <div className="service-info">
                    <div className="service-name">{service.name}</div>
                    {service.description && (
                        <div className="service-description">{service.description}</div>
                    )}
                </div>
            </td>
            <td>
                <span className="service-category-badge">{service.category}</span>
            </td>
            <td className="service-price">₹{service.basePrice?.toLocaleString() || 'Custom'}</td>
            <td className="service-commission">{service.commissionRate}%</td>
        </tr>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <p>Loading services...</p>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>Services Rate Card</h1>
                        <p>Browse our complete service offerings with pricing and commission details</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <div className="card-body">
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div className="navbar-search" style={{ minWidth: '250px' }}>
                            <Search className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="select-input"
                        >
                            <option value="">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                className={`btn btn-sm ${filters.sortBy === 'commission' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleSortChange('commission')}
                            >
                                <ArrowUpDown size={14} />
                                Commission {filters.sortBy === 'commission' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </button>
                            <button
                                className={`btn btn-sm ${filters.sortBy === 'price' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => handleSortChange('price')}
                            >
                                <ArrowUpDown size={14} />
                                Price {filters.sortBy === 'price' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Services Display */}
            {services.length === 0 ? (
                <div className="card">
                    <div className="card-body" style={{ textAlign: 'center', padding: '48px' }}>
                        <p style={{ color: 'var(--text-muted)' }}>No services found matching your criteria.</p>
                    </div>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="services-grid">
                    {services.map(service => (
                        <ServiceCard key={service._id} service={service} />
                    ))}
                </div>
            ) : (
                <div className="card">
                    <div className="card-body" style={{ padding: 0 }}>
                        <table className="services-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Category</th>
                                    <th>Base Price</th>
                                    <th>Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {services.map(service => (
                                    <ServiceRow key={service._id} service={service} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                .services-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 24px;
                }

                .service-card {
                    background: var(--bg-white);
                    border: 1px solid var(--accent-beige);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: all var(--transition-fast);
                }

                .service-card:hover {
                    border-color: var(--primary-brand);
                    box-shadow: 0 4px 12px rgba(122, 74, 46, 0.1);
                    transform: translateY(-2px);
                }

                .service-card-header {
                    background: var(--bg-main);
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .service-category {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    color: var(--text-muted);
                    font-weight: 500;
                }

                .service-commission {
                    background: var(--primary-brand);
                    color: white;
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .service-card-body {
                    padding: 20px;
                }

                .service-name {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }

                .service-description {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                    line-height: 1.5;
                    margin-bottom: 16px;
                }

                .service-pricing {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 16px;
                    border-top: 1px solid var(--accent-beige);
                }

                .service-price,
                .service-commission-rate {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .service-price {
                    color: var(--primary-brand);
                }

                .service-commission-rate {
                    color: var(--success);
                }

                .services-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .services-table th {
                    background: var(--bg-main);
                    padding: 16px;
                    text-align: left;
                    font-weight: 600;
                    color: var(--text-primary);
                    border-bottom: 1px solid var(--accent-beige);
                }

                .services-table td {
                    padding: 16px;
                    border-bottom: 1px solid var(--accent-beige);
                }

                .service-row:hover {
                    background: var(--bg-main);
                }

                .service-info .service-name {
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 4px;
                }

                .service-info .service-description {
                    font-size: 0.875rem;
                    color: var(--text-muted);
                }

                .service-category-badge {
                    background: var(--accent-beige);
                    color: var(--primary-brand);
                    padding: 4px 8px;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 500;
                }

                .service-price {
                    font-weight: 600;
                    color: var(--primary-brand);
                }

                .service-commission {
                    font-weight: 600;
                    color: var(--success);
                }

                @media (max-width: 768px) {
                    .services-grid {
                        grid-template-columns: 1fr;
                    }
                    
                    .services-table {
                        font-size: 0.875rem;
                    }
                    
                    .services-table th,
                    .services-table td {
                        padding: 12px 8px;
                    }
                }
            `}</style>
        </div>
    );
};

export default ServicesListingPage;
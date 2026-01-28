import { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    DollarSign,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { salesAPI, usersAPI, servicesAPI } from '../utils/api';
import DataTable from '../components/dashboard/DataTable';

const SalesPage = () => {
    const { user, isAdmin } = useAuth();
    const [sales, setSales] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSale, setEditingSale] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        city: '',
        service: '',
        startDate: '',
        endDate: ''
    });

    const [formData, setFormData] = useState({
        client: '',
        service: '',
        amount: '',
        city: user?.city || '',
        notes: '',
        seller: '',
        status: 'Pending'
    });

    const statuses = ['Pending', 'Processing', 'Completed', 'Cancelled'];

    useEffect(() => {
        fetchSales();
        fetchServices();
        if (isAdmin) {
            fetchSellers();
        }
    }, []);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.city) params.city = filters.city;
            if (filters.service) params.service = filters.service;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const response = await salesAPI.getAll(params);
            setSales(response.data);
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSellers = async () => {
        try {
            const response = await usersAPI.getAll();
            setSellers(response.data.filter(s => s.isActive));
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await servicesAPI.getAll();
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    // Apply filters
    useEffect(() => {
        fetchSales();
    }, [filters]);

    // Search filter (client-side for quick response)
    const filteredSales = sales.filter(sale => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            sale.client?.toLowerCase().includes(query) ||
            sale.service?.toLowerCase().includes(query) ||
            sale.seller?.name?.toLowerCase().includes(query) ||
            sale.city?.toLowerCase().includes(query)
        );
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Get service commission rate if available
            const selectedService = services.find(s => s.name === formData.service);

            const saleData = {
                client: formData.client,
                service: formData.service,
                amount: Number(formData.amount),
                city: formData.city || user?.city || 'Unknown',
                notes: formData.notes,
                commissionRate: selectedService?.commissionRate
            };

            // Admin can assign seller
            if (isAdmin && formData.seller) {
                saleData.seller = formData.seller;
            }

            if (editingSale) {
                // Include status for admin edits
                if (isAdmin) {
                    saleData.status = formData.status;
                }
                await salesAPI.update(editingSale._id, saleData);
            } else {
                await salesAPI.create(saleData);
            }

            setShowModal(false);
            setEditingSale(null);
            resetForm();
            fetchSales();
        } catch (error) {
            const errorData = error.response?.data;
            const errorMsg = errorData?.message || 'Error saving sale';
            const validationErrors = errorData?.validationErrors?.join(', ') || '';
            const detailedError = errorData?.error || '';
            alert(`${errorMsg}${validationErrors ? ` (Fields: ${validationErrors})` : ''}${detailedError ? ` - ${detailedError}` : ''}`);
            console.error('Sale error details:', errorData);
        }
    };

    const resetForm = () => {
        setFormData({
            client: '',
            service: services.length > 0 ? services[0].name : '',
            amount: '',
            city: user?.city || '',
            notes: '',
            seller: '',
            status: 'Pending'
        });
    };

    const handleEdit = (sale) => {
        setEditingSale(sale);
        setFormData({
            client: sale.client,
            service: sale.service,
            amount: sale.amount.toString(),
            city: sale.city,
            notes: sale.notes || '',
            seller: sale.seller?._id || '',
            status: sale.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            try {
                await salesAPI.delete(id);
                fetchSales();
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting sale');
            }
        }
    };

    const openNewSaleModal = () => {
        setEditingSale(null);
        resetForm();
        setShowModal(true);
    };

    const columns = [
        {
            header: 'Seller',
            render: (row) => (
                <div className="cell-user">
                    <div className="cell-user-avatar">
                        {row.seller?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'}
                    </div>
                    <div className="cell-user-info">
                        <span>{row.seller?.name || 'Unknown'}</span>
                        <span>{row.city || '-'}</span>
                    </div>
                </div>
            )
        },
        { header: 'Client', accessor: 'client' },
        { header: 'Service', accessor: 'service' },
        {
            header: 'Amount',
            render: (row) => `₹${(row.amount || 0).toLocaleString()}`
        },
        {
            header: 'Commission',
            render: (row) => (
                <span style={{ color: 'var(--primary-brand)', fontWeight: 600 }}>
                    ₹{(row.commission || 0).toLocaleString()}
                </span>
            )
        },
        {
            header: 'Status',
            render: (row) => (
                <span className={`badge ${row.status === 'Completed' ? 'badge-success' :
                    row.status === 'Pending' ? 'badge-warning' :
                        row.status === 'Processing' ? 'badge-secondary' : 'badge-muted'
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
        },
        {
            header: 'Actions',
            render: (row) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleEdit(row)}
                        title="Edit"
                    >
                        <Edit2 size={16} />
                    </button>
                    {isAdmin && (
                        <button
                            className="btn btn-ghost btn-sm btn-icon"
                            onClick={() => handleDelete(row._id)}
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ];

    const totalAmount = filteredSales.reduce((sum, s) => sum + (s.amount || 0), 0);
    const totalCommission = filteredSales.reduce((sum, s) => sum + (s.commission || 0), 0);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>{isAdmin ? 'All Sales' : 'My Sales'}</h1>
                        <p>Track and manage sales transactions</p>
                    </div>
                    <button className="btn btn-primary" onClick={openNewSaleModal}>
                        <Plus size={18} />
                        Log New Sale
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><DollarSign /></div>
                    </div>
                    <div className="stat-card-value">₹{totalAmount.toLocaleString()}</div>
                    <div className="stat-card-label">Total Sales</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><DollarSign /></div>
                    </div>
                    <div className="stat-card-value">₹{totalCommission.toLocaleString()}</div>
                    <div className="stat-card-label">Total Commission</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><DollarSign /></div>
                    </div>
                    <div className="stat-card-value">{filteredSales.length}</div>
                    <div className="stat-card-label">Total Transactions</div>
                </div>
            </div>

            {/* Filters and Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Sales Transactions</h3>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <div className="navbar-search" style={{ width: '200px' }}>
                            <Search className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="select-input"
                        >
                            <option value="">All Status</option>
                            {statuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <select
                            value={filters.service || ''}
                            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                            className="select-input"
                        >
                            <option value="">All Services</option>
                            {services.map(s => (
                                <option key={s._id} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            className="date-input"
                            placeholder="From"
                        />
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            className="date-input"
                            placeholder="To"
                        />
                    </div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Loading...
                        </div>
                    ) : filteredSales.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No sales found. Log your first sale to get started.
                        </div>
                    ) : (
                        <DataTable columns={columns} data={filteredSales} />
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingSale ? 'Edit Sale' : 'Log New Sale'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => {
                                setShowModal(false);
                                setEditingSale(null);
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {isAdmin && !editingSale && (
                                    <div className="form-group">
                                        <label>Seller *</label>
                                        <select
                                            value={formData.seller}
                                            onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Seller</option>
                                            {sellers.map(seller => (
                                                <option key={seller._id} value={seller._id}>
                                                    {seller.name} ({seller.city})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <div className="form-group">
                                    <label>Client Name *</label>
                                    <input
                                        type="text"
                                        value={formData.client}
                                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                                        placeholder="Enter client name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Service *</label>
                                    <select
                                        value={formData.service}
                                        onChange={(e) => {
                                            const service = services.find(s => s.name === e.target.value);
                                            setFormData({
                                                ...formData,
                                                service: e.target.value,
                                                amount: service?.basePrice?.toString() || formData.amount
                                            });
                                        }}
                                        required
                                    >
                                        <option value="">Select Service</option>
                                        {services.map(service => (
                                            <option key={service._id} value={service.name}>
                                                {service.name} {service.basePrice ? `(₹${service.basePrice.toLocaleString()})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="Enter sale amount"
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Enter city"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="Add any notes..."
                                        rows={3}
                                    />
                                </div>
                                {isAdmin && editingSale && (
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        >
                                            {statuses.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSale ? 'Update Sale' : 'Log Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .select-input, .date-input {
          padding: 10px 16px;
          border: 1px solid var(--accent-beige);
          border-radius: var(--radius-md);
          background: var(--bg-white);
          font-size: 0.9rem;
          color: var(--text-primary);
        }
        .select-input:focus, .date-input:focus {
          outline: none;
          border-color: var(--primary-brand);
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          background: var(--bg-white);
          border-radius: var(--radius-lg);
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-xl);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-lg);
          border-bottom: 1px solid var(--accent-light);
        }
        .modal-header h3 {
          margin: 0;
          color: var(--primary-brand);
        }
        .modal-body {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .modal-body .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .modal-body label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .modal-body input, .modal-body select, .modal-body textarea {
          padding: 12px 16px;
          border: 1px solid var(--accent-beige);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          width: 100%;
        }
        .modal-body textarea {
          resize: vertical;
          font-family: inherit;
        }
        .modal-body input:focus, .modal-body select:focus, .modal-body textarea:focus {
          outline: none;
          border-color: var(--primary-brand);
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: var(--space-lg);
          border-top: 1px solid var(--accent-light);
        }
      `}</style>
        </div>
    );
};

export default SalesPage;

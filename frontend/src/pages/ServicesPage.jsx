import { useState, useEffect } from 'react';
import {
    Package,
    Plus,
    Search,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    DollarSign,
    Percent
} from 'lucide-react';
import { servicesAPI } from '../utils/api';
import DataTable from '../components/dashboard/DataTable';

const ServicesPage = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        commissionRate: 10
    });

    useEffect(() => {
        fetchServices();
    }, [showInactive]);

    const fetchServices = async () => {
        setLoading(true);
        try {
            const response = await servicesAPI.getAll({ includeInactive: showInactive });
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    // Client-side search
    const filteredServices = services.filter(service => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            service.name?.toLowerCase().includes(query) ||
            service.description?.toLowerCase().includes(query)
        );
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            basePrice: '',
            commissionRate: 10
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                name: formData.name,
                description: formData.description,
                basePrice: Number(formData.basePrice) || 0,
                commissionRate: Number(formData.commissionRate) || 10
            };

            if (editingService) {
                await servicesAPI.update(editingService._id, data);
            } else {
                await servicesAPI.create(data);
            }

            setShowModal(false);
            setEditingService(null);
            resetForm();
            fetchServices();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving service');
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            description: service.description || '',
            basePrice: service.basePrice?.toString() || '',
            commissionRate: service.commissionRate || 10
        });
        setShowModal(true);
    };

    const handleToggleActive = async (service) => {
        const action = service.isActive ? 'deactivate' : 'reactivate';
        if (window.confirm(`Are you sure you want to ${action} "${service.name}"?`)) {
            try {
                await servicesAPI.update(service._id, { isActive: !service.isActive });
                fetchServices();
            } catch (error) {
                alert(error.response?.data?.message || `Error ${action}ing service`);
            }
        }
    };

    const openNewModal = () => {
        setEditingService(null);
        resetForm();
        setShowModal(true);
    };

    const columns = [
        {
            header: 'Service Name',
            accessor: 'name',
            render: (row) => (
                <div className="cell-user">
                    <div className="cell-user-avatar" style={{ background: 'linear-gradient(135deg, #7A4A2E 0%, #5D3A22 100%)' }}>
                        <Package size={18} />
                    </div>
                    <div className="cell-user-info">
                        <span>{row.name}</span>
                        <span>{row.description || 'No description'}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Base Price',
            render: (row) => `₹${(row.basePrice || 0).toLocaleString()}`
        },
        {
            header: 'Commission Rate',
            render: (row) => `${row.commissionRate || 10}%`
        },
        {
            header: 'Status',
            accessor: 'isActive',
            render: (row) => (
                <span className={`badge ${row.isActive ? 'badge-success' : 'badge-muted'}`}>
                    {row.isActive ? 'Active' : 'Inactive'}
                </span>
            )
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
                    <button
                        className="btn btn-ghost btn-sm btn-icon"
                        onClick={() => handleToggleActive(row)}
                        title={row.isActive ? 'Deactivate' : 'Reactivate'}
                    >
                        {row.isActive ? <Trash2 size={16} /> : <RefreshCw size={16} />}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1>Services</h1>
                        <p>Manage service packages and their commission rates</p>
                    </div>
                    <button className="btn btn-primary" onClick={openNewModal}>
                        <Plus size={18} />
                        Add Service
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><Package /></div>
                    </div>
                    <div className="stat-card-value">{services.length}</div>
                    <div className="stat-card-label">Total Services</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><Package /></div>
                    </div>
                    <div className="stat-card-value">{services.filter(s => s.isActive).length}</div>
                    <div className="stat-card-label">Active Services</div>
                </div>
            </div>

            {/* Search and Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Services</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                            />
                            Show Inactive
                        </label>
                        <div className="navbar-search" style={{ width: '280px' }}>
                            <Search className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            Loading...
                        </div>
                    ) : filteredServices.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No services found. Add your first service to get started.
                        </div>
                    ) : (
                        <DataTable columns={columns} data={filteredServices} />
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => {
                                setShowModal(false);
                                setEditingService(null);
                                resetForm();
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Service Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter service name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter description"
                                        rows={3}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>
                                            <DollarSign size={14} style={{ marginRight: '6px' }} />
                                            Base Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.basePrice}
                                            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                            placeholder="Enter base price"
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>
                                            <Percent size={14} style={{ marginRight: '6px' }} />
                                            Commission Rate (%)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.commissionRate}
                                            onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                                            placeholder="Enter commission rate"
                                            min="0"
                                            max="100"
                                            step="0.5"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingService ? 'Update Service' : 'Add Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
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
        .modal-body .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .modal-body label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
        }
        .modal-body input, .modal-body textarea {
          padding: 12px 16px;
          border: 1px solid var(--accent-beige);
          border-radius: var(--radius-md);
          font-size: 0.9rem;
          font-family: inherit;
        }
        .modal-body textarea {
          resize: vertical;
        }
        .modal-body input:focus, .modal-body textarea:focus {
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

export default ServicesPage;

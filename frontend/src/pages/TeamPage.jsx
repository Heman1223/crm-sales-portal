import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    Percent
} from 'lucide-react';
import { usersAPI } from '../utils/api';
import DataTable from '../components/dashboard/DataTable';
import { useToast } from '../components/common/Toast';

const TeamPage = () => {
    const toast = useToast();
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingSeller, setEditingSeller] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        city: '',
        phone: '',
        commissionRate: 10
    });

    useEffect(() => {
        fetchSellers();
    }, [showInactive]);

    const fetchSellers = async () => {
        setLoading(true);
        try {
            const response = await usersAPI.getAll({ includeInactive: showInactive });
            setSellers(response.data);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    // Client-side search
    const filteredSellers = sellers.filter(seller => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            seller.name?.toLowerCase().includes(query) ||
            seller.email?.toLowerCase().includes(query) ||
            seller.city?.toLowerCase().includes(query)
        );
    });

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            city: '',
            phone: '',
            commissionRate: 10
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                name: formData.name,
                email: formData.email,
                city: formData.city,
                phone: formData.phone,
                commissionRate: Number(formData.commissionRate)
            };

            if (editingSeller) {
                // Only include password if provided for edit
                if (formData.password) {
                    data.password = formData.password;
                }
                await usersAPI.update(editingSeller._id, data);
                toast.success('Seller updated successfully!');
            } else {
                // Password required for new seller
                data.password = formData.password;
                await usersAPI.create(data);
                toast.success('Seller added successfully!');
            }

            setShowModal(false);
            setEditingSeller(null);
            resetForm();
            fetchSellers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving seller');
        }
    };

    const handleEdit = (seller) => {
        setEditingSeller(seller);
        setFormData({
            name: seller.name,
            email: seller.email,
            password: '',
            city: seller.city || '',
            phone: seller.phone || '',
            commissionRate: seller.commissionRate || 10
        });
        setShowModal(true);
    };

    const handleToggleActive = async (seller) => {
        const action = seller.isActive ? 'deactivate' : 'reactivate';
        if (window.confirm(`Are you sure you want to ${action} ${seller.name}?`)) {
            try {
                await usersAPI.update(seller._id, { isActive: !seller.isActive });
                toast.success(`Seller ${action}d successfully!`);
                fetchSellers();
            } catch (error) {
                toast.error(error.response?.data?.message || `Error ${action}ing seller`);
            }
        }
    };

    const openNewModal = () => {
        setEditingSeller(null);
        resetForm();
        setShowModal(true);
    };

    const columns = [
        {
            header: 'Seller',
            accessor: 'name',
            render: (row) => (
                <div className="cell-user">
                    <div className="cell-user-avatar">
                        {row.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="cell-user-info">
                        <span>{row.name}</span>
                        <span>{row.email}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'City',
            accessor: 'city',
            render: (row) => row.city || '-'
        },
        {
            header: 'Phone',
            accessor: 'phone',
            render: (row) => row.phone || '-'
        },
        {
            header: 'Commission Rate',
            render: (row) => `${row.commissionRate || 10}%`
        },
        {
            header: 'Total Sales',
            accessor: 'stats',
            render: (row) => `₹${(row.stats?.totalSales || 0).toLocaleString()}`
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

    const activeSellers = filteredSellers.filter(s => s.isActive);
    const inactiveSellers = filteredSellers.filter(s => !s.isActive);

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>Sales Team</h1>
                        <p>Manage your sellers and their commission rates</p>
                    </div>
                    <button className="btn btn-primary" onClick={openNewModal}>
                        <Plus size={18} />
                        Add Seller
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><Users /></div>
                    </div>
                    <div className="stat-card-value">{sellers.length}</div>
                    <div className="stat-card-label">Total Sellers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><Users /></div>
                    </div>
                    <div className="stat-card-value">{activeSellers.length}</div>
                    <div className="stat-card-label">Active Sellers</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon"><Users /></div>
                    </div>
                    <div className="stat-card-value">{inactiveSellers.length}</div>
                    <div className="stat-card-label">Inactive Sellers</div>
                </div>
            </div>

            {/* Search and Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Sellers</h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                            <input
                                type="checkbox"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                            />
                            Show Inactive
                        </label>
                        <div className="navbar-search" style={{ width: '100%', maxWidth: '280px' }}>
                            <Search className="navbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search sellers..."
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
                    ) : filteredSellers.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No sellers found. Add your first seller to get started.
                        </div>
                    ) : (
                        <DataTable columns={columns} data={filteredSellers} />
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingSeller ? 'Edit Seller' : 'Add New Seller'}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => {
                                setShowModal(false);
                                setEditingSeller(null);
                                resetForm();
                            }}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="Enter email address"
                                        required
                                        disabled={!!editingSeller}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>{editingSeller ? 'New Password (leave blank to keep current)' : 'Password *'}</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder={editingSeller ? 'Leave blank to keep current' : 'Enter password'}
                                        required={!editingSeller}
                                        minLength={editingSeller ? 0 : 6}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            placeholder="Enter city"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                        />
                                    </div>
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
                                    <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        Default is 10%. Experienced sellers can have higher rates.
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingSeller ? 'Update Seller' : 'Add Seller'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TeamPage;

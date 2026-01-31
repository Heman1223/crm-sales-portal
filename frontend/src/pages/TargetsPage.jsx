import { useState, useEffect } from 'react';
import { Target, Plus, Calendar, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { targetsAPI, usersAPI } from '../utils/api';
import { useToast } from '../components/common/Toast';

const TargetsPage = () => {
    const { user, isAdmin } = useAuth();
    const toast = useToast();
    const [targets, setTargets] = useState([]);
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const [formData, setFormData] = useState({
        seller: '',
        targetAmount: '',
        targetClients: 10,
        targetPremiumSales: 3
    });

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchTargets();
        if (isAdmin) {
            fetchSellers();
        }
    }, [selectedMonth, selectedYear]);

    const fetchTargets = async () => {
        try {
            const response = await targetsAPI.getAll({
                month: selectedMonth,
                year: selectedYear
            });
            setTargets(response.data);
        } catch (error) {
            console.error('Error fetching targets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSellers = async () => {
        try {
            const response = await usersAPI.getAll();
            setSellers(response.data);
        } catch (error) {
            console.error('Error fetching sellers:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await targetsAPI.create({
                ...formData,
                month: selectedMonth,
                year: selectedYear,
                targetAmount: Number(formData.targetAmount),
                targetClients: Number(formData.targetClients),
                targetPremiumSales: Number(formData.targetPremiumSales)
            });

            toast.success('Target set successfully!');
            setShowModal(false);
            setFormData({
                seller: '',
                targetAmount: '',
                targetClients: 10,
                targetPremiumSales: 3
            });
            fetchTargets();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error saving target');
        }
    };

    const getProgressColor = (percentage) => {
        if (percentage >= 100) return 'var(--primary-brand)';
        if (percentage >= 75) return '#7A4A2E';
        if (percentage >= 50) return '#A67C5B';
        return '#C4A484';
    };

    return (
        <div>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1>{isAdmin ? 'Manage Targets' : 'My Targets'}</h1>
                        <p>Set and track monthly sales targets</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
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
                        {isAdmin && (
                            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                <Plus size={18} />
                                Set Target
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Target Cards */}
            <div className="targets-grid">
                {loading ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1' }}>
                        Loading...
                    </p>
                ) : targets.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1/-1', padding: '48px' }}>
                        <Target size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <p>No targets set for {months[selectedMonth - 1]} {selectedYear}</p>
                        {isAdmin && <p>Click "Set Target" to create targets for sellers.</p>}
                    </div>
                ) : (
                    targets.map(target => {
                        const percentage = target.targetAmount > 0
                            ? Math.round((target.achievedAmount / target.targetAmount) * 100)
                            : 0;

                        return (
                            <div key={target._id} className="target-card">
                                <div className="target-header">
                                    <div className="target-avatar">
                                        {target.seller?.avatar ? (
                                            <img src={target.seller.avatar} alt="Avatar" style={{
                                                width: '100%',
                                                height: '100%',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }} />
                                        ) : (
                                            target.seller?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'N/A'
                                        )}
                                    </div>
                                    <div>
                                        <h4>{target.seller?.name || 'Unknown'}</h4>
                                        <span>{target.seller?.city || '-'}</span>
                                    </div>
                                </div>

                                <div className="target-main">
                                    <div className="target-amount">
                                        <div className="target-achieved">₹{target.achievedAmount.toLocaleString()}</div>
                                        <div className="target-goal">of ₹{target.targetAmount.toLocaleString()}</div>
                                    </div>
                                    <div
                                        className="target-percentage"
                                        style={{ color: getProgressColor(percentage) }}
                                    >
                                        {percentage}%
                                    </div>
                                </div>

                                <div className="target-progress-bar">
                                    <div
                                        className="target-progress-fill"
                                        style={{
                                            width: `${Math.min(percentage, 100)}%`,
                                            background: `linear-gradient(90deg, ${getProgressColor(percentage)}, var(--accent-beige))`
                                        }}
                                    />
                                </div>

                                <div className="target-details">
                                    <div className="target-detail">
                                        <span className="target-detail-value">{target.achievedClients}/{target.targetClients}</span>
                                        <span className="target-detail-label">Clients</span>
                                    </div>
                                    <div className="target-detail">
                                        <span className="target-detail-value">{target.achievedPremiumSales}/{target.targetPremiumSales}</span>
                                        <span className="target-detail-label">Premium</span>
                                    </div>
                                </div>

                                {percentage >= 100 && (
                                    <div className="target-achieved-badge">
                                        🎯 Target Achieved!
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Set Target for {months[selectedMonth - 1]} {selectedYear}</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Seller</label>
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
                                <div className="form-group">
                                    <label>Target Amount (₹)</label>
                                    <input
                                        type="number"
                                        value={formData.targetAmount}
                                        onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                        placeholder="Enter target amount"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Clients</label>
                                    <input
                                        type="number"
                                        value={formData.targetClients}
                                        onChange={(e) => setFormData({ ...formData, targetClients: e.target.value })}
                                        placeholder="Number of clients"
                                        min="0"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Premium Sales</label>
                                    <input
                                        type="number"
                                        value={formData.targetPremiumSales}
                                        onChange={(e) => setFormData({ ...formData, targetPremiumSales: e.target.value })}
                                        placeholder="Number of premium sales"
                                        min="0"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Set Target
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default TargetsPage;

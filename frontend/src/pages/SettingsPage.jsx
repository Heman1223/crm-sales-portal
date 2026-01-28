import { useState, useEffect, useRef } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Lock,
    Save,
    Eye,
    EyeOff,
    Check,
    AlertCircle,
    Camera,
    Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';

const SettingsPage = () => {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        city: ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                city: user.city || ''
            });
            if (user.avatar) {
                setAvatarPreview(user.avatar);
            }
        }
    }, [user]);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const response = await authAPI.updateProfile({
                name: profileData.name,
                phone: profileData.phone,
                city: profileData.city
            });

            updateUser(response.data);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            await authAPI.updatePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Please select an image file' });
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image must be less than 2MB' });
            return;
        }

        // Read and upload as base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            setAvatarPreview(base64);

            setLoading(true);
            setMessage({ type: '', text: '' });

            try {
                const response = await authAPI.uploadAvatar(base64);
                updateUser({ ...user, avatar: response.data.avatar });
                setMessage({ type: 'success', text: 'Profile picture updated!' });
            } catch (error) {
                setMessage({
                    type: 'error',
                    text: error.response?.data?.message || 'Failed to upload image'
                });
            } finally {
                setLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <div>
            <div className="page-header">
                <h1>Settings</h1>
                <p>Manage your account settings and preferences</p>
            </div>

            <div className="settings-container">
                {/* Sidebar */}
                <div className="settings-sidebar">
                    <div className="settings-profile-card">
                        <div
                            className="settings-avatar"
                            onClick={handleAvatarClick}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }} />
                            ) : (
                                getInitials(user?.name)
                            )}
                            <div className="avatar-overlay">
                                <Camera size={20} />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleAvatarChange}
                            accept="image/*"
                            style={{ display: 'none' }}
                        />
                        <h3>{user?.name}</h3>
                        <span className="badge badge-secondary">
                            {user?.role === 'admin' ? 'Admin' : 'Seller'}
                        </span>
                        <p className="avatar-hint">Click avatar to change</p>
                    </div>

                    <nav className="settings-nav">
                        <button
                            className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                            onClick={() => setActiveTab('profile')}
                        >
                            <User size={18} />
                            Profile
                        </button>
                        <button
                            className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                            onClick={() => setActiveTab('security')}
                        >
                            <Lock size={18} />
                            Security
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="settings-content">
                    {message.text && (
                        <div className={`settings-message ${message.type}`}>
                            {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Profile Information</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleProfileSubmit} className="settings-form">
                                    <div className="form-group">
                                        <label>
                                            <User size={16} />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.name}
                                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                            placeholder="Enter your full name"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <Mail size={16} />
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="disabled"
                                        />
                                        <small>Email cannot be changed</small>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>
                                                <Phone size={16} />
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                placeholder="Enter phone number"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>
                                                <MapPin size={16} />
                                                City
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.city}
                                                onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                                placeholder="Enter city"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            <Save size={18} />
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Change Password</h3>
                            </div>
                            <div className="card-body">
                                <form onSubmit={handlePasswordSubmit} className="settings-form">
                                    <div className="form-group">
                                        <label>
                                            <Lock size={16} />
                                            Current Password
                                        </label>
                                        <div className="password-input">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                placeholder="Enter current password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            >
                                                {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <Lock size={16} />
                                            New Password
                                        </label>
                                        <div className="password-input">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                placeholder="Enter new password"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            >
                                                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            <Lock size={16} />
                                            Confirm New Password
                                        </label>
                                        <div className="password-input">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                placeholder="Confirm new password"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            >
                                                {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-actions">
                                        <button type="submit" className="btn btn-primary" disabled={loading}>
                                            <Lock size={18} />
                                            {loading ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .settings-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
        }
        .settings-sidebar {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .settings-profile-card {
          background: var(--bg-white);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-align: center;
          box-shadow: var(--shadow-md);
        }
        .settings-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-dark) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 auto 16px;
          position: relative;
          overflow: hidden;
        }
        .avatar-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .settings-avatar:hover .avatar-overlay {
          opacity: 1;
        }
        .avatar-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 8px;
        }
        .settings-profile-card h3 {
          margin: 0 0 8px;
          color: var(--text-primary);
        }
        .settings-nav {
          background: var(--bg-white);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .settings-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 16px 20px;
          background: none;
          border: none;
          text-align: left;
          color: var(--text-primary);
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.15s;
          border-left: 3px solid transparent;
        }
        .settings-nav-item:hover {
          background: var(--bg-main);
        }
        .settings-nav-item.active {
          background: var(--bg-main);
          color: var(--primary-brand);
          border-left-color: var(--primary-brand);
          font-weight: 500;
        }
        .settings-content {
          min-width: 0;
        }
        .settings-message {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: var(--radius-md);
          margin-bottom: 24px;
        }
        .settings-message.success {
          background: rgba(34, 197, 94, 0.1);
          color: #16a34a;
          border: 1px solid rgba(34, 197, 94, 0.2);
        }
        .settings-message.error {
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .settings-form .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .settings-form label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }
        .settings-form input {
          padding: 12px 16px;
          border: 1px solid var(--accent-beige);
          border-radius: var(--radius-md);
          font-size: 0.95rem;
          transition: border-color 0.15s;
        }
        .settings-form input:focus {
          outline: none;
          border-color: var(--primary-brand);
        }
        .settings-form input.disabled {
          background: var(--bg-main);
          color: var(--text-muted);
          cursor: not-allowed;
        }
        .settings-form small {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .password-input {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-input input {
          width: 100%;
          padding-right: 48px;
        }
        .password-input button {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
        }
        .password-input button:hover {
          color: var(--primary-brand);
        }
        .form-actions {
          padding-top: 12px;
        }

        @media (max-width: 768px) {
          .settings-container {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    );
};

export default SettingsPage;

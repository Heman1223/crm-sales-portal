import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(toast => toast.id !== id));
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
    const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
    const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, info, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// Hook to use toast
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <>
            <div className="toast-container">
                {toasts.map(toast => (
                    <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
            <style>{`
                .toast-container {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    pointer-events: none;
                }
                .toast {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 20px;
                    border-radius: 12px;
                    background: white;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0, 0, 0, 0.1);
                    min-width: 300px;
                    max-width: 450px;
                    pointer-events: auto;
                    animation: toast-slide-in 0.3s ease-out;
                    border-left: 4px solid;
                }
                .toast.success {
                    border-left-color: #22c55e;
                }
                .toast.error {
                    border-left-color: #ef4444;
                }
                .toast.info {
                    border-left-color: #3b82f6;
                }
                .toast-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .toast.success .toast-icon {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }
                .toast.error .toast-icon {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }
                .toast.info .toast-icon {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                }
                .toast-content {
                    flex: 1;
                }
                .toast-message {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: #1a1a1a;
                    line-height: 1.4;
                }
                .toast-close {
                    background: none;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.15s;
                    flex-shrink: 0;
                }
                .toast-close:hover {
                    background: #f1f5f9;
                    color: #64748b;
                }
                @keyframes toast-slide-in {
                    from {
                        opacity: 0;
                        transform: translateX(100px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @media (max-width: 480px) {
                    .toast-container {
                        left: 12px;
                        right: 12px;
                        top: 12px;
                    }
                    .toast {
                        min-width: 100%;
                    }
                }
            `}</style>
        </>
    );
};

// Individual Toast Component
const Toast = ({ toast, onClose }) => {
    const icons = {
        success: <Check size={18} />,
        error: <AlertCircle size={18} />,
        info: <Info size={18} />
    };

    return (
        <div className={`toast ${toast.type}`}>
            <div className="toast-icon">
                {icons[toast.type]}
            </div>
            <div className="toast-content">
                <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={onClose}>
                <X size={16} />
            </button>
        </div>
    );
};

export default Toast;

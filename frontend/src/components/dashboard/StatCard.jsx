import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({
    icon: Icon,
    value,
    label,
    trend = null,
    trendValue = '',
    footer = null
}) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-card-icon">
                    <Icon />
                </div>
                {trend !== null && (
                    <div className={`stat-card-trend ${trend >= 0 ? 'up' : 'down'}`}>
                        {trend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div className="stat-card-value">{value}</div>
            <div className="stat-card-label">{label}</div>
            {footer && (
                <div className="stat-card-footer">
                    <span>{footer.text}</span>
                    {footer.link && <a href={footer.link.href}>{footer.link.text}</a>}
                </div>
            )}
        </div>
    );
};

export default StatCard;

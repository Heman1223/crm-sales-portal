const PerformanceRanking = ({ performers }) => {
    const getPositionClass = (index) => {
        switch (index) {
            case 0: return 'gold';
            case 1: return 'silver';
            case 2: return 'bronze';
            default: return 'default';
        }
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <ul className="ranking-list">
            {performers.map((performer, index) => (
                <li key={performer.id || index} className="ranking-item">
                    <div className={`ranking-position ${getPositionClass(index)}`}>
                        {index + 1}
                    </div>
                    <div className="ranking-avatar">
                        {getInitials(performer.name)}
                    </div>
                    <div className="ranking-info">
                        <h4>{performer.name}</h4>
                        <span>{performer.role || performer.city}</span>
                    </div>
                    <div className="ranking-value">
                        <h4>₹{performer.value?.toLocaleString()}</h4>
                        <span>{performer.metric || 'Revenue'}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default PerformanceRanking;

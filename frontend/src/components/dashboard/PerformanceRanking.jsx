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

    const renderAvatar = (performer) => {
        if (performer?.avatar) {
            return (
                <img src={performer.avatar} alt="Avatar" style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                }} />
            );
        }
        return getInitials(performer.name);
    };

    return (
        <ul className="ranking-list">
            {performers.map((performer, index) => (
                <li key={performer.id || index} className="ranking-item">
                    <div className={`ranking-position ${getPositionClass(index)}`}>
                        {index + 1}
                    </div>
                    <div className="ranking-avatar">
                        {renderAvatar(performer)}
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

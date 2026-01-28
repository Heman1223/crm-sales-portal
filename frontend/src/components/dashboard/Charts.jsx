import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';

// Color palette matching the theme
const CHART_COLORS = {
    primary: '#7A4A2E',
    primaryDark: '#6B3F26',
    accent: '#E6C9A8',
    accentLight: '#F5E6D3',
    secondary: '#8B5A3C',
    tertiary: '#C4A484',
    muted: '#7A6A5A',
    background: '#FDF1E4'
};

const GRADIENT_COLORS = [
    '#7A4A2E',
    '#8B5A3C',
    '#A67C5B',
    '#C4A484',
    '#E6C9A8',
    '#F5E6D3'
];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                backgroundColor: '#FFFFFF',
                padding: '12px 16px',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(59, 42, 26, 0.15)',
                border: '1px solid #E6C9A8'
            }}>
                <p style={{
                    margin: 0,
                    fontWeight: 600,
                    color: '#7A4A2E',
                    marginBottom: '8px'
                }}>
                    {label}
                </p>
                {payload.map((entry, index) => (
                    <p key={index} style={{
                        margin: 0,
                        color: entry.color,
                        fontSize: '0.875rem'
                    }}>
                        {entry.name}: <strong>₹{entry.value?.toLocaleString()}</strong>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Revenue Area Chart
export const RevenueAreaChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.accent} opacity={0.5} />
                <XAxis
                    dataKey="name"
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                />
                <YAxis
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                    tickFormatter={(value) => `₹${(value / 1000)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue"
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

// Commission Bar Chart
export const CommissionBarChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.accent} opacity={0.5} />
                <XAxis
                    dataKey="name"
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                />
                <YAxis
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                    tickFormatter={(value) => `₹${(value / 1000)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="commission"
                    fill={CHART_COLORS.primary}
                    radius={[6, 6, 0, 0]}
                    name="Commission"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

// City Performance Chart
export const CityPerformanceChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 80, bottom: 0 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.accent} opacity={0.5} />
                <XAxis
                    type="number"
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                    tickFormatter={(value) => `₹${(value / 100000)}L`}
                />
                <YAxis
                    type="category"
                    dataKey="city"
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                    dataKey="revenue"
                    fill={CHART_COLORS.secondary}
                    radius={[0, 6, 6, 0]}
                    name="Revenue"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

// Sales Distribution Pie Chart
export const SalesDistributionChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: CHART_COLORS.muted }}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill={GRADIENT_COLORS[index % GRADIENT_COLORS.length]}
                            stroke={CHART_COLORS.background}
                            strokeWidth={2}
                        />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value) => `₹${value.toLocaleString()}`}
                    contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E6C9A8',
                        boxShadow: '0 4px 12px rgba(59, 42, 26, 0.15)'
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Monthly Target Line Chart
export const TargetLineChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.accent} opacity={0.5} />
                <XAxis
                    dataKey="name"
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                />
                <YAxis
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                    tickFormatter={(value) => `₹${(value / 1000)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="target"
                    stroke={CHART_COLORS.accent}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: CHART_COLORS.accent, strokeWidth: 2 }}
                    name="Target"
                />
                <Line
                    type="monotone"
                    dataKey="achieved"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={3}
                    dot={{ fill: CHART_COLORS.primary, strokeWidth: 2 }}
                    name="Achieved"
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

// Comparison Bar Chart (Revenue vs Commission)
export const ComparisonBarChart = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.accent} opacity={0.5} />
                <XAxis
                    dataKey="name"
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                />
                <YAxis
                    stroke={CHART_COLORS.muted}
                    tick={{ fill: CHART_COLORS.muted, fontSize: 12 }}
                    axisLine={{ stroke: CHART_COLORS.accent }}
                    tickFormatter={(value) => `₹${(value / 1000)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                    dataKey="revenue"
                    fill={CHART_COLORS.primary}
                    radius={[6, 6, 0, 0]}
                    name="Revenue"
                />
                <Bar
                    dataKey="commission"
                    fill={CHART_COLORS.accent}
                    radius={[6, 6, 0, 0]}
                    name="Commission"
                />
            </BarChart>
        </ResponsiveContainer>
    );
};

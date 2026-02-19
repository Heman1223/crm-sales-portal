import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    TrendingUp, Users, Target, ShieldCheck,
    Zap, BarChart3, Clock, Layout, ArrowRight,
    Calculator, LineChart, Globe, Trophy
} from 'lucide-react';
import LandingHeader from '../components/layout/LandingHeader';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
    const navigate = useNavigate();

    // Data for Sales Trends (Genuine-looking CRM data)
    const salesData = [
        { name: 'Jan', revenue: 45000, leads: 120 },
        { name: 'Feb', revenue: 52000, leads: 150 },
        { name: 'Mar', revenue: 48000, leads: 140 },
        { name: 'Apr', revenue: 61000, leads: 180 },
        { name: 'May', revenue: 75000, leads: 220 },
        { name: 'Jun', revenue: 89000, leads: 250 },
        { name: 'Jul', revenue: 82000, leads: 240 },
    ];

    // Data for Lead Conversion Stage
    const leadData = [
        { stage: 'Prospects', count: 450, fill: '#7A4A2E' },
        { stage: 'Qualified', count: 320, fill: '#8D5B3A' },
        { stage: 'Proposal', count: 210, fill: '#A16D47' },
        { stage: 'Negotiation', count: 120, fill: '#B57E54' },
        { stage: 'Closed', count: 85, fill: '#C99061' },
    ];

    // Data for Team Performance
    const performanceData = [
        { name: 'Direct Sales', value: 45 },
        { name: 'Referrals', value: 25 },
        { name: 'Online', value: 30 },
    ];

    const COLORS = ['#7A4A2E', '#A16D47', '#C99061'];

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach((el) => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    return (
        <div className="landing-page">
            <LandingHeader />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content animate-on-scroll">
                    <div className="badge">POWERING HIGH-PERFORMANCE TEAMS</div>
                    <h1>Unlock Your Sales <span className="brand-text">Potential</span></h1>
                    <p className="hero-subtitle">
                        Avani Sales CRM is the ultimate workspace for modern sales professionals.
                        From lead intelligence to automated commission calculations,
                        we provide the tools you need to exceed every target.
                    </p>
                    <div className="hero-actions">
                        <button className="btn-primary" onClick={() => navigate('/login')}>
                            Explore Dashboard <ArrowRight size={18} />
                        </button>
                        <button className="btn-secondary" onClick={() => navigate('/register')}>
                            Join Avani Network
                        </button>
                    </div>
                </div>
            </section>

            {/* Visualization Section */}
            <section className="viz-section">
                <div className="section-header animate-on-scroll">
                    <span className="section-label">REAL-TIME INSIGHTS</span>
                    <h2>Intelligence That Drives Growth</h2>
                    <p>Stop guessing and start closing. Our data engine transforms raw leads into actionable revenue streams.</p>
                </div>

                <div className="viz-grid">
                    {/* Sales Trends */}
                    <div className="viz-card animate-on-scroll">
                        <div className="card-icon"><TrendingUp size={24} /></div>
                        <h3>Revenue Velocity</h3>
                        <p>Track your monthly recurring revenue and lead velocity in one unified dashboard.</p>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#7A4A2E" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#7A4A2E" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#7A4A2E" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Funnel Data */}
                    <div className="viz-card animate-on-scroll">
                        <div className="card-icon"><Target size={24} /></div>
                        <h3>Conversion Funnel</h3>
                        <p>Visualize your sales pipeline and identify bottlenecks before they affect your bottom line.</p>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={leadData}>
                                    <Tooltip
                                        cursor={{ fill: 'rgba(122, 74, 46, 0.05)' }}
                                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={30} fill="#7A4A2E" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Team Performance */}
                    <div className="viz-card animate-on-scroll">
                        <div className="card-icon"><Users size={24} /></div>
                        <h3>Source Performance</h3>
                        <p>Analyze which channels bring the highest quality leads to optimize your marketing spend.</p>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={performanceData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {performanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Features Grid (Replaced Round Hub) */}
            <section className="features-grid-section">
                <div className="section-header animate-on-scroll">
                    <span className="section-label">CORE ARCHITECTURE</span>
                    <h2>Built for Modern Sellers</h2>
                    <p>A comprehensive ecosystem designed to eliminate friction and maximize output.</p>
                </div>

                <div className="features-grid">
                    <div className="feature-item animate-on-scroll">
                        <div className="icon-box"><Calculator /></div>
                        <h4>Commission Automation</h4>
                        <p>Instant calculations for complex commission structures. No more spreadsheets.</p>
                    </div>
                    <div className="feature-item animate-on-scroll">
                        <div className="icon-box"><Zap /></div>
                        <h4>Instant Lead Routing</h4>
                        <p>Smart algorithms assign leads to the most qualified available representative.</p>
                    </div>
                    <div className="feature-item animate-on-scroll">
                        <div className="icon-box"><LineChart /></div>
                        <h4>Advanced Analytics</h4>
                        <p>Deep-dive reports that uncover hidden trends in your sales performance.</p>
                    </div>
                    <div className="feature-item animate-on-scroll">
                        <div className="icon-box"><ShieldCheck /></div>
                        <h4>Advanced Security</h4>
                        <p>Your data is kept safe with advanced encryption and reliable access controls.</p>
                    </div>
                    <div className="feature-item animate-on-scroll">
                        <div className="icon-box"><Globe /></div>
                        <h4>Multi-Region Support</h4>
                        <p>Seamlessly manage teams across different timezones and currencies.</p>
                    </div>
                    <div className="feature-item animate-on-scroll">
                        <div className="icon-box"><Trophy /></div>
                        <h4>Gamified Rewards</h4>
                        <p>Boost morale with leaderboards, badges, and automated incentive tracking.</p>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="cta-container">
                <div className="cta-gradient-card animate-on-scroll">
                    <div className="cta-inner">
                        <div className="badge white">START YOUR JOURNEY</div>
                        <h2>Ready to Outperform?</h2>
                        <p>Join thousands of professionals using Avani to scale their sales operations.</p>
                        <div className="cta-btns">
                            <button className="btn-cta-white" onClick={() => navigate('/register')}>Create Account</button>
                            <button className="btn-cta-outline" onClick={() => navigate('/login')}>Sign In</button>
                        </div>
                    </div>
                </div>
            </section >

            <Footer />

            <style>{`
                .landing-page {
                    background-color: #FDF5E6;
                    color: #3D2B1F;
                    overflow-x: hidden;
                }

                section {
                    padding: 120px 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .animate-on-scroll {
                    opacity: 0;
                    transform: translateY(40px);
                    transition: all 1s cubic-bezier(0.2, 0.8, 0.2, 1);
                }

                .animate-in {
                    opacity: 1;
                    transform: translateY(0);
                }

                .badge {
                    background: rgba(122, 74, 46, 0.1);
                    color: #7A4A2E;
                    padding: 8px 20px;
                    border-radius: 100px;
                    font-size: 0.75rem;
                    font-weight: 800;
                    letter-spacing: 2px;
                    display: inline-block;
                    margin-bottom: 30px;
                }

                .badge.white {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                .hero-section {
                    min-height: 90vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    padding-top: 160px;
                }

                .hero-content h1 {
                    font-size: 5rem;
                    font-weight: 900;
                    margin-bottom: 30px;
                    line-height: 1;
                    color: #1A110B;
                }

                .brand-text {
                    background: linear-gradient(135deg, #7A4A2E, #BD7D57);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-subtitle {
                    max-width: 800px;
                    margin: 0 auto 50px;
                    font-size: 1.4rem;
                    line-height: 1.6;
                    color: #5C4033;
                    font-weight: 500;
                }

                .hero-actions {
                    display: flex;
                    gap: 25px;
                    justify-content: center;
                }

                .btn-primary {
                    background: #7A4A2E;
                    color: white;
                    border: none;
                    padding: 18px 45px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 20px 40px rgba(122, 74, 46, 0.3);
                }

                .btn-secondary {
                    background: white;
                    color: #7A4A2E;
                    border: 1px solid rgba(122, 74, 46, 0.2);
                    padding: 18px 45px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .btn-primary:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 25px 50px rgba(122, 74, 46, 0.4);
                    background: #8D5B3A;
                }

                .btn-secondary:hover {
                    background: #7A4A2E;
                    color: white;
                    border-color: #7A4A2E;
                }

                .section-header {
                    text-align: center;
                    margin-bottom: 100px;
                }

                .section-label {
                    color: #7A4A2E;
                    font-weight: 900;
                    letter-spacing: 4px;
                    font-size: 0.8rem;
                    display: block;
                    margin-bottom: 15px;
                }

                .section-header h2 {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 25px;
                    color: #1A110B;
                }

                .section-header p {
                    max-width: 700px;
                    margin: 0 auto;
                    font-size: 1.2rem;
                    color: #5C4033;
                }

                .viz-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 40px;
                }

                .viz-card {
                    background: white;
                    padding: 50px;
                    border-radius: 40px;
                    box-shadow: 0 30px 60px rgba(122, 74, 46, 0.05);
                    border: 1px solid rgba(122, 74, 46, 0.05);
                }

                .card-icon {
                    width: 50px;
                    height: 50px;
                    background: rgba(122, 74, 46, 0.1);
                    border-radius: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #7A4A2E;
                    margin-bottom: 25px;
                }

                .viz-card h3 {
                    font-size: 1.6rem;
                    margin-bottom: 15px;
                    font-weight: 800;
                }

                .viz-card p {
                    font-size: 1rem;
                    line-height: 1.6;
                    color: #5C4033;
                    margin-bottom: 40px;
                    opacity: 0.8;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 40px;
                }

                .feature-item {
                    background: #FDF5E6;
                    padding: 50px;
                    border-radius: 40px;
                    transition: all 0.4s ease;
                    border: 1px solid transparent;
                }

                .feature-item:hover {
                    background: white;
                    border-color: rgba(122, 74, 46, 0.1);
                    box-shadow: 0 20px 50px rgba(122, 74, 46, 0.08);
                }

                .icon-box {
                    width: 60px;
                    height: 60px;
                    background: #7A4A2E;
                    color: white;
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 30px;
                }

                .feature-item h4 {
                    font-size: 1.4rem;
                    font-weight: 800;
                    margin-bottom: 15px;
                }

                .feature-item p {
                    color: #5C4033;
                    line-height: 1.6;
                    font-weight: 500;
                }

                .cta-container {
                    padding: 100px 40px 150px;
                }

                .cta-gradient-card {
                    background: linear-gradient(135deg, #3D2B1F, #7A4A2E);
                    border-radius: 50px;
                    padding: 120px 60px;
                    text-align: center;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .cta-gradient-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
                    pointer-events: none;
                }

                .cta-inner {
                    position: relative;
                    z-index: 1;
                }

                .cta-gradient-card h2 {
                    font-size: 4rem;
                    font-weight: 900;
                    margin-bottom: 25px;
                    letter-spacing: -1px;
                }

                .cta-gradient-card p {
                    font-size: 1.5rem;
                    margin-bottom: 60px;
                    opacity: 0.9;
                    max-width: 700px;
                    margin-left: auto;
                    margin-right: auto;
                }

                .cta-btns {
                    display: flex;
                    gap: 30px;
                    justify-content: center;
                }

                .btn-cta-white {
                    background: white;
                    color: #7A4A2E;
                    border: none;
                    padding: 20px 60px;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-cta-outline {
                    background: transparent;
                    color: white;
                    border: 2px solid white;
                    padding: 18px 60px;
                    border-radius: 20px;
                    font-weight: 800;
                    font-size: 1.2rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .btn-cta-white:hover {
                    transform: scale(1.05);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
                }

                .btn-cta-outline:hover {
                    background: white;
                    color: #3D2B1F;
                }

                @media (max-width: 1100px) {
                    .viz-grid, .features-grid { grid-template-columns: repeat(2, 1fr); }
                    .hero-content h1 { font-size: 4rem; }
                }

                @media (max-width: 768px) {
                    section { padding: 80px 25px; }
                    .hero-section { padding-top: 140px; }
                    .hero-content h1 { font-size: 3rem; }
                    .hero-subtitle { font-size: 1.1rem; }
                    .viz-grid, .features-grid { grid-template-columns: 1fr; gap: 25px; }
                    .viz-card, .feature-item { padding: 35px; }
                    .cta-gradient-card h2 { font-size: 2.5rem; }
                    .btn-cta-white, .btn-cta-outline { width: 100%; padding: 15px 30px; }
                    .cta-btns { flex-direction: column; gap: 15px; }
                    .cta-gradient-card { padding: 80px 30px; }
                }

                @media (max-width: 480px) {
                    .hero-content h1 { font-size: 2.2rem; }
                    .hero-subtitle { font-size: 1rem; }
                    .hero-actions { flex-direction: column; gap: 15px; }
                    .btn-primary, .btn-secondary { width: 100%; justify-content: center; padding: 15px 30px; }
                    .cta-gradient-card h2 { font-size: 1.8rem; }
                    .cta-gradient-card p { font-size: 1.1rem; }
                    .badge { margin-bottom: 20px; }
                }
            `}</style>
        </div >
    );
};

export default LandingPage;

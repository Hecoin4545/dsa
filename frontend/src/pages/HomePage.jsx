import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ArrowRight, TrendingUp, Users, BarChart3, Zap, Shield, Globe } from 'lucide-react';

export default function HomePage() {
    const { user } = useUser();

    return (
        <div className="page-container">
            {/* Hero */}
            <section className="hero-section">
                <div className="hero-badge">
                    <Zap size={14} /> Competitive Programming Tracker
                </div>
                <h1>
                    Climb The <span className="gradient-text">Leaderboard</span>
                    <br />Compete With Your Peers
                </h1>
                <p>
                    Track your progress across LeetCode, Codeforces, and CodeChef. See how you rank among your college peers, stay motivated, and push your competitive edge.
                </p>
                <div className="hero-buttons">
                    {!user ? (
                        <>
                            <Link to="/signup" className="hero-btn-primary">
                                Get Started <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="hero-btn-secondary">
                                Already have an account?
                            </Link>
                        </>
                    ) : user.isVerified ? (
                        <Link to="/rankings" className="hero-btn-primary">
                            View Rankings <ArrowRight size={18} />
                        </Link>
                    ) : (
                        <div className="unverified-banner" style={{ maxWidth: 500, margin: '0 auto' }}>
                            <Shield size={20} className="banner-icon" />
                            <span>Your account is pending verification. An admin will verify your college email shortly.</span>
                        </div>
                    )}
                </div>
            </section>

            {/* How it works */}
            <section className="features-section">
                <h2>How It Works</h2>
                <p className="section-subtitle">Three simple steps to get started and compete.</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Users size={24} /></div>
                        <h3>1. Sign Up</h3>
                        <p>Create your account using your college email and link your competitive programming profiles — LeetCode, Codeforces, CodeChef, and GeeksforGeeks.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Shield size={24} /></div>
                        <h3>2. Get Verified</h3>
                        <p>Once you sign up, an admin will verify your college email address. This ensures only legit peers appear on the leaderboard.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><TrendingUp size={24} /></div>
                        <h3>3. Compete & Climb</h3>
                        <p>View live rankings across platforms. Track total problems solved, monthly progress, and contest ratings. Push yourself to the top!</p>
                    </div>
                </div>
            </section>

            {/* Supported Platforms */}
            <section className="platforms-section">
                <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Supported Platforms</h2>
                <p className="section-subtitle" style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>We track your stats across the major competitive programming platforms.</p>
                <div className="platforms-grid">
                    <div className="platform-card">
                        <div className="platform-icon">🟡</div>
                        <h3>LeetCode</h3>
                        <p>Problems solved, difficulty breakdown, and global ranking</p>
                    </div>
                    <div className="platform-card">
                        <div className="platform-icon">🔵</div>
                        <h3>Codeforces</h3>
                        <p>Contest rating, total accepted, and monthly stats</p>
                    </div>
                    <div className="platform-card">
                        <div className="platform-icon">🟤</div>
                        <h3>CodeChef</h3>
                        <p>Star rating, current rating, and problem count</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="features-section">
                <h2>What We Track</h2>
                <p className="section-subtitle">Detailed metrics to fuel friendly competition.</p>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><BarChart3 size={24} /></div>
                        <h3>Total Problems Solved</h3>
                        <p>See how many problems each user has solved on each platform. The all-time leaderboard shows dedication and consistency.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Zap size={24} /></div>
                        <h3>Monthly Progress</h3>
                        <p>Track how many problems were solved this month. Stay active and keep climbing the monthly leaderboard.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Globe size={24} /></div>
                        <h3>Contest Rating</h3>
                        <p>Your contest rating reflects your real competitive ability. We pull live ratings from each platform's official API.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

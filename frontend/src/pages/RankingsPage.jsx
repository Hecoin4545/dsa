import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { RefreshCw, Trophy, Star, AlertCircle, Hash, CalendarDays, Award } from 'lucide-react';
import axios from 'axios';

const PLATFORMS = [
    { key: 'leetcode', label: 'LeetCode', dotClass: 'leetcode' },
    { key: 'codeforces', label: 'Codeforces', dotClass: 'codeforces' },
    { key: 'codechef', label: 'CodeChef', dotClass: 'codechef' },
];

const SORT_TABS = [
    { key: 'totalSolved', label: 'Total Solved', icon: Hash, description: 'Ranked by total problems solved' },
    { key: 'monthlySolved', label: 'This Month', icon: CalendarDays, description: 'Ranked by problems solved this month' },
    { key: 'rating', label: 'Contest Rating', icon: Award, description: 'Ranked by contest rating' },
];

export default function RankingsPage() {
    const { user } = useUser();
    const [platform, setPlatform] = useState('leetcode');
    const [sortBy, setSortBy] = useState('totalSolved');
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');
    const [refreshResult, setRefreshResult] = useState(null);

    useEffect(() => {
        fetchRankings();
    }, [platform, sortBy]);

    async function fetchRankings() {
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.get(`/api/rankings/${platform}?sortBy=${sortBy}`, { withCredentials: true });
            setRankings(data);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to fetch rankings.');
        } finally {
            setLoading(false);
        }
    }

    async function handleRefresh() {
        setRefreshing(true);
        setRefreshResult(null);
        try {
            const { data } = await axios.post('/api/rankings/refresh', {}, { withCredentials: true });
            setRefreshResult(data.results);
            await fetchRankings();
            setTimeout(() => setRefreshResult(null), 5000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to refresh stats.');
        } finally {
            setRefreshing(false);
        }
    }

    function getRankBadgeClass(rank) {
        if (rank === 1) return 'rank-badge gold';
        if (rank === 2) return 'rank-badge silver';
        if (rank === 3) return 'rank-badge bronze';
        return 'rank-badge normal';
    }

    function getInitials(name) {
        return name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
    }

    function getSortValue(item) {
        return item.stats?.[platform]?.[sortBy] || 0;
    }

    function renderExtraColumns(item) {
        const stats = item.stats?.[platform] || {};

        if (sortBy === 'totalSolved') {
            return (
                <>
                    <td><span className="stat-pill total">{stats.totalSolved || 0}</span></td>
                    <td><span className="stat-pill monthly">{stats.monthlySolved || 0}</span></td>
                    <td><span className="stat-pill rating"><Star size={12} /> {stats.rating || 0}</span></td>
                </>
            );
        }
        if (sortBy === 'monthlySolved') {
            return (
                <>
                    <td><span className="stat-pill monthly">{stats.monthlySolved || 0}</span></td>
                    <td><span className="stat-pill total">{stats.totalSolved || 0}</span></td>
                    <td><span className="stat-pill rating"><Star size={12} /> {stats.rating || 0}</span></td>
                </>
            );
        }
        // rating
        return (
            <>
                <td><span className="stat-pill rating"><Star size={12} /> {stats.rating || 0}</span></td>
                <td><span className="stat-pill total">{stats.totalSolved || 0}</span></td>
                <td><span className="stat-pill monthly">{stats.monthlySolved || 0}</span></td>
            </>
        );
    }

    function getColumnHeaders() {
        if (sortBy === 'totalSolved') return ['Rank', 'User', 'Total Solved ↓', 'Monthly', 'Rating'];
        if (sortBy === 'monthlySolved') return ['Rank', 'User', 'Monthly ↓', 'Total Solved', 'Rating'];
        return ['Rank', 'User', 'Rating ↓', 'Total Solved', 'Monthly'];
    }

    if (!user?.isVerified) {
        return (
            <div className="page-container">
                <div className="unverified-banner">
                    <AlertCircle size={20} className="banner-icon" />
                    <span>Your account needs to be verified to access the rankings. Please wait for admin verification.</span>
                </div>
            </div>
        );
    }

    const currentSortTab = SORT_TABS.find(t => t.key === sortBy);

    return (
        <div className="page-container rankings-page">
            {/* Header */}
            <div className="rankings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1><Trophy size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />Rankings</h1>
                    <p>See how you stack up against your peers.</p>
                </div>
                <button className={`btn-refresh ${refreshing ? 'spinning' : ''}`} onClick={handleRefresh} disabled={refreshing}>
                    <RefreshCw size={16} />
                    {refreshing ? 'Refreshing...' : 'Refresh My Stats'}
                </button>
            </div>

            {/* Refresh result feedback */}
            {refreshResult && (
                <div className="refresh-results">
                    {Object.entries(refreshResult).map(([key, status]) => (
                        <span key={key} className={`refresh-chip ${status}`}>
                            {key}: {status === 'success' ? '✅' : '❌'}
                        </span>
                    ))}
                </div>
            )}

            {/* Platform Tabs */}
            <div className="platform-tabs">
                {PLATFORMS.map(p => (
                    <button
                        key={p.key}
                        className={`platform-tab ${platform === p.key ? 'active' : ''}`}
                        onClick={() => setPlatform(p.key)}
                    >
                        <span className={`tab-dot ${p.dotClass}`}></span>
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Sort Sub-Tabs */}
            <div className="sort-tabs">
                {SORT_TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.key}
                            className={`sort-tab ${sortBy === tab.key ? 'active' : ''}`}
                            onClick={() => setSortBy(tab.key)}
                        >
                            <Icon size={15} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Active sort description */}
            <p className="sort-description">{currentSortTab?.description}</p>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loader"><div className="loader-spinner"></div></div>
            ) : rankings.length === 0 ? (
                <div className="empty-state">
                    <Trophy size={48} />
                    <h3>No rankings yet</h3>
                    <p>No verified users with {PLATFORMS.find(p => p.key === platform)?.label} handles found. Be the first!</p>
                </div>
            ) : (
                <div className="rankings-table-wrap">
                    <table className="rankings-table">
                        <thead>
                            <tr>
                                {getColumnHeaders().map(h => (
                                    <th key={h}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rankings.map((item, index) => {
                                const handle = item.handles?.[platform] || '';
                                const rank = index + 1;
                                return (
                                    <tr key={item._id} className={item._id === user?._id ? 'current-user-row' : ''}>
                                        <td><span className={getRankBadgeClass(rank)}>{rank}</span></td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar">{getInitials(item.name)}</div>
                                                <div className="user-info">
                                                    <div className="user-name">
                                                        {item.name}
                                                        {item._id === user?._id && <span className="you-badge">You</span>}
                                                    </div>
                                                    <div className="user-handle">@{handle}</div>
                                                </div>
                                            </div>
                                        </td>
                                        {renderExtraColumns(item)}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

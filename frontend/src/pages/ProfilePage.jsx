import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { User, Shield, AlertCircle, Check } from 'lucide-react';

export default function ProfilePage() {
    const { user, updateHandles } = useUser();
    const [handles, setHandles] = useState({
        leetcode: user?.handles?.leetcode || '',
        codeforces: user?.handles?.codeforces || '',
        codechef: user?.handles?.codechef || '',
        geeksforgeeks: user?.handles?.geeksforgeeks || '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    function handleChange(e) {
        setHandles({ ...handles, [e.target.name]: e.target.value });
    }

    async function handleSave() {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await updateHandles(handles);
            setSuccess('Profiles updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profiles.');
        } finally {
            setLoading(false);
        }
    }

    const PLATFORMS = [
        { key: 'leetcode', label: 'LeetCode', color: 'var(--leetcode-color)' },
        { key: 'codeforces', label: 'Codeforces', color: 'var(--codeforces-color)' },
        { key: 'codechef', label: 'CodeChef', color: 'var(--codechef-color)' },
        { key: 'geeksforgeeks', label: 'GeeksforGeeks', color: 'var(--gfg-color)' },
    ];

    return (
        <div className="page-container profile-page">
            {/* Verification Status */}
            {!user?.isVerified && (
                <div className="unverified-banner">
                    <AlertCircle size={20} className="banner-icon" />
                    <span>Your account is <strong>pending verification</strong>. An admin will verify your college email address. Rankings will be unlocked once verified.</span>
                </div>
            )}

            {/* User Info Card */}
            <div className="profile-card" style={{ marginBottom: '1.5rem' }}>
                <h2><User size={20} /> Account Info</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div className="user-avatar" style={{ width: 48, height: 48, fontSize: '1rem' }}>
                        {user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user?.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{user?.email}</div>
                    </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: '0.5rem', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, background: user?.isVerified ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)', color: user?.isVerified ? 'var(--success)' : 'var(--warning)' }}>
                    {user?.isVerified ? <><Check size={14} /> Verified</> : <><Shield size={14} /> Pending Verification</>}
                </div>
            </div>

            {/* Handles Card */}
            <div className="profile-card">
                <h2>🔗 Competitive Programming Profiles</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="profile-handles-grid">
                    {PLATFORMS.map(p => (
                        <div key={p.key} className="handle-input-group">
                            <div className="handle-label">
                                <span className="handle-dot" style={{ background: p.color }}></span>
                                {p.label}
                            </div>
                            <input
                                name={p.key}
                                value={handles[p.key]}
                                onChange={handleChange}
                                placeholder={`Your ${p.label} username`}
                            />
                        </div>
                    ))}
                </div>

                <button className="profile-save-btn" onClick={handleSave} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

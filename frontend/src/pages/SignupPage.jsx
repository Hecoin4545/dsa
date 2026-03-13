import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function SignupPage() {
    const { register } = useUser();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        leetcode: '',
        codeforces: '',
        codechef: '',
        geeksforgeeks: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');

        if (!form.name || !form.email || !form.password) {
            setError('Name, email, and password are required.');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                handles: {
                    leetcode: form.leetcode,
                    codeforces: form.codeforces,
                    codechef: form.codechef,
                    geeksforgeeks: form.geeksforgeeks,
                },
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="logo-icon">CP</div>
                    <h1>Create Account</h1>
                    <p>Join the competitive programming leaderboard</p>
                </div>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input id="name" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">College Email</label>
                        <input id="email" name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input id="password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} />
                    </div>

                    <div className="form-section-title">Competitive Programming Profiles</div>
                    <div className="handles-grid">
                        <div className="form-group">
                            <label htmlFor="leetcode">🟡 LeetCode</label>
                            <input id="leetcode" name="leetcode" placeholder="username" value={form.leetcode} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="codeforces">🔵 Codeforces</label>
                            <input id="codeforces" name="codeforces" placeholder="handle" value={form.codeforces} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="codechef">🟤 CodeChef</label>
                            <input id="codechef" name="codechef" placeholder="username" value={form.codechef} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="geeksforgeeks">🟢 GeeksforGeeks</label>
                            <input id="geeksforgeeks" name="geeksforgeeks" placeholder="username" value={form.geeksforgeeks} onChange={handleChange} />
                        </div>
                    </div>

                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

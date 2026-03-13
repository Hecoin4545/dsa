import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Home, Trophy, User, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useUser();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="navbar-logo">
                    <div className="logo-icon">CP</div>
                    <span>Leaderboard</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/" className={isActive('/')}>
                        <Home size={16} />
                        <span>Home</span>
                    </Link>

                    {user && user.isVerified && (
                        <Link to="/rankings" className={isActive('/rankings')}>
                            <Trophy size={16} />
                            <span>Rankings</span>
                        </Link>
                    )}

                    {user && (
                        <Link to="/profile" className={isActive('/profile')}>
                            <User size={16} />
                            <span>Profile</span>
                        </Link>
                    )}

                    <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {user ? (
                        <button className="btn-logout" onClick={logout}>
                            <LogOut size={14} />
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="nav-link">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

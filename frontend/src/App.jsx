import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import RankingsPage from './pages/RankingsPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children }) {
    const { user, loading } = useUser();
    if (loading) return <div className="loader"><div className="loader-spinner"></div></div>;
    if (!user) return <Navigate to="/login" replace />;
    return children;
}

function GuestRoute({ children }) {
    const { user, loading } = useUser();
    if (loading) return <div className="loader"><div className="loader-spinner"></div></div>;
    if (user) return <Navigate to="/" replace />;
    return children;
}

function AppRoutes() {
    const { user, loading } = useUser();

    if (loading) {
        return (
            <div className="app-container">
                <div className="loader" style={{ minHeight: '100vh' }}>
                    <div className="loader-spinner"></div>
                </div>
            </div>
        );
    }

    // If user is not logged in, only show home page, signup, and login
    return (
        <div className="app-container">
            <Navbar />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={
                    <GuestRoute><SignupPage /></GuestRoute>
                } />
                <Route path="/login" element={
                    <GuestRoute><LoginPage /></GuestRoute>
                } />
                <Route path="/rankings" element={
                    <ProtectedRoute><RankingsPage /></ProtectedRoute>
                } />
                <Route path="/profile" element={
                    <ProtectedRoute><ProfilePage /></ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <UserProvider>
                    <AppRoutes />
                </UserProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

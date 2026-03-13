import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// In production, VITE_API_URL points to the deployed backend.
// In dev, it's empty so the Vite proxy (localhost:4000) handles /api calls.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';


const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    async function fetchProfile() {
        try {
            const { data } = await axios.get('/api/auth/profile', { withCredentials: true });
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }

    async function login(email, password) {
        const { data } = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
        setUser(data);
        return data;
    }

    async function register(formData) {
        const { data } = await axios.post('/api/auth/register', formData, { withCredentials: true });
        setUser(data);
        return data;
    }

    async function logout() {
        await axios.post('/api/auth/logout', {}, { withCredentials: true });
        setUser(null);
    }

    async function updateHandles(handles) {
        const { data } = await axios.put('/api/auth/profile/handles', { handles }, { withCredentials: true });
        setUser(data);
        return data;
    }

    return (
        <UserContext.Provider value={{ user, loading, login, register, logout, updateHandles, fetchProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}

import { createContext, useState, useContext, useEffect } from 'react';
import api from '../Config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(() => !!sessionStorage.getItem('user'));

    useEffect(() => {
        const userData = sessionStorage.getItem('user');

        if (!userData) return;

        let active = true;

        Promise.resolve()
            .then(() => JSON.parse(userData))
            .then((parsedUser) => {
                if (!active) return;
                setUser(parsedUser);
                return api.get('/auth/verify');
            })
            .then((response) => {
                if (!active || !response) return;
                if (!response.data.valid) {
                    sessionStorage.removeItem('user');
                    setUser(null);
                }
            })
            .catch(() => {
                if (!active) return;
                sessionStorage.removeItem('user');
                setUser(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => { active = false; };
    }, []);

    useEffect(() => {
        const onPageShow = (e) => {
            if (e.persisted) {
                const userData = sessionStorage.getItem('user');
                if (userData) {
                    try {
                        setUser(JSON.parse(userData));
                        return;
                    } catch {
                        sessionStorage.removeItem('user');
                    }
                }
                setUser(null);
            }
        };
        window.addEventListener('pageshow', onPageShow);
        return () => window.removeEventListener('pageshow', onPageShow);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email: (email || '').trim().toLowerCase(), password });
            const { user } = response.data;

            const normalizedUser = {
                ...user,
        
                rol: user?.rol ?? user?.role,
                role: user?.role ?? user?.rol
            };


            sessionStorage.setItem('user', JSON.stringify(normalizedUser));
            setUser(normalizedUser);

            return { success: true, user: normalizedUser };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.error || 'Error al iniciar sesión'
            };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('user');
        setUser(null);
        api.post('/auth/logout').catch(() => {});
    };

    const isAdmin = () => user?.rol === 'admin';
    const isRecepcion = () => user?.rol === 'recepcion';
    const isAuthenticated = () => !!user;

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            login, 
            logout, 
            isAdmin,
            isRecepcion,
            isAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
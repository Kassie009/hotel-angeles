import { createContext, useState, useContext, useEffect } from 'react';
import api from '../Config/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = sessionStorage.getItem('user');  
        
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                Promise.resolve().then(() => setUser(parsedUser));

                api.get('/auth/verify')
                    .then(response => {
                        if (!response.data.valid) {
                            sessionStorage.removeItem('user');
                            Promise.resolve().then(() => setUser(null));
                        }
                    })
                    .catch(() => {
                        sessionStorage.removeItem('user');
                        Promise.resolve().then(() => setUser(null));
                    });
            } catch (err) {
                sessionStorage.removeItem('user');
                Promise.resolve().then(() => setUser(null));
            }

        }
        setLoading(false);

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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return context;
};
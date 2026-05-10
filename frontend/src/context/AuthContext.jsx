import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        const token = localStorage.getItem("jb_token");
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const u = await getMe();
            setUser(u);
        } catch {
            localStorage.removeItem("jb_token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("payment") === "success") {
            refreshUser();
            window.history.replaceState({}, "", window.location.pathname);
        }
    }, [refreshUser]);

    const login = (token, userData) => {
        localStorage.setItem("jb_token", token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("jb_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

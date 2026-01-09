import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import axios from '../api';
import { supabase } from '../supabaseClient';

interface UserProfile {
    id: number;
    username: string;
    role: string;
    tenant_id: number;
    tenant_name: string;
    plan?: string;
    subscription_status?: string;
    subscription_end_date?: string;
}

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    isAdmin: boolean;
    needsMFA: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    fetchProfile: async () => { },
    isAdmin: false,
    needsMFA: false
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [needsMFA, setNeedsMFA] = useState(false);

    const checkMFA = async (currentSession: Session | null) => {
        if (!currentSession) {
            setNeedsMFA(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.mfa.listFactors();
            if (error) {
                console.error("Error listing factors checking MFA", error);
                return;
            }

            const verifiedFactors = data.totp.filter(f => f.status === 'verified');
            const hasVerifiedFactors = verifiedFactors.length > 0;

            const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
            const currentLevel = aalData?.currentLevel;

            if (hasVerifiedFactors && currentLevel === 'aal1') {
                console.log("User has MFA enabled but is on AAL1. MFA Required.");
                setNeedsMFA(true);
            } else {
                setNeedsMFA(false);
            }

        } catch (err) {
            console.error("Error checking MFA", err);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await axios.get('/api/auth/me');
            setProfile(res.data);
        } catch (err: any) {
            console.error('Error fetching profile', err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                // Don't clear session immediately to avoid flicker
            }
        }
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session } } = await supabase.auth.getSession();

                if (!mounted) return;

                if (session) {
                    setSession(session);
                    setUser(session.user);

                    // Run parallel
                    fetchProfile();
                    checkMFA(session);
                } else {
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                }
            } catch (err) {
                console.error("Auth Initialization Error:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        initializeAuth();

        // Safety timeout
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Auth initialization timed out, forcing load completion.");
                setLoading(false);
            }
        }, 3000);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;

            if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setProfile(null);
                setNeedsMFA(false);
                setLoading(false);
                return;
            }

            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                setSession(session);
                setUser(session?.user ?? null);

                if (session) {
                    fetchProfile();
                    checkMFA(session);
                }
                if (mounted) setLoading(false);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
        setUser(null);
        setNeedsMFA(false);
    };

    return (
        <AuthContext.Provider value={{
            session,
            user,
            profile,
            loading,
            signOut,
            fetchProfile,
            isAdmin: profile?.role === 'admin',
            needsMFA
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

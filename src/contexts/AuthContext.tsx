import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    updateProfile: (fullName: string, avatarUrl: string | null) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch profile data
    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }

            return data as Profile;
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            return null;
        }
    };

    // Initialize auth state
    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                fetchProfile(session.user.id).then(setProfile);
            }

            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                const profileData = await fetchProfile(session.user.id);
                setProfile(profileData);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Real-time profile updates
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel(`profile:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${user.id}`,
                },
                (payload) => {
                    if (payload.new) {
                        setProfile(payload.new as Profile);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        return { error };
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            console.log('Registrando usuario con:', { email, fullName });

            // Create auth user with metadata
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                    emailRedirectTo: `${window.location.origin}/`,
                },
            });

            if (signUpError) {
                return { error: signUpError };
            }

            if (!authData.user) {
                return { error: new Error('No user returned from signup') };
            }

            console.log('Usuario creado en auth.users:', authData.user.id);
            console.log('Metadata:', authData.user.user_metadata);

            // Wait a bit for trigger to execute
            await new Promise(resolve => setTimeout(resolve, 500));

            // Check if profile exists
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();

            if (existingProfile) {
                console.log('Perfil creado por trigger:', existingProfile);
            } else {
                console.log('Trigger no creó perfil, creando manualmente...');
                // Manually create profile
                const { data: newProfile, error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: authData.user.id,
                        full_name: fullName,
                        avatar_url: null,
                    })
                    .select()
                    .single();

                if (profileError) {
                    console.error('Error creando perfil:', profileError);
                    return { error: new Error(`Error al crear perfil: ${profileError.message}`) };
                }

                console.log('Perfil creado manualmente:', newProfile);
            }

            return { error: null };
        } catch (err) {
            console.error('Error en signUp:', err);
            return { error: err as Error };
        }
    };

    const updateProfile = async (fullName: string, avatarUrl: string | null) => {
        if (!user?.id) {
            return { error: new Error('No user logged in') };
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    avatar_url: avatarUrl,
                })
                .eq('id', user.id);

            if (error) {
                return { error };
            }

            return { error: null };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        profile,
        loading,
        signInWithEmail,
        signUp,
        updateProfile,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

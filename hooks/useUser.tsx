"use client"

import { Subscription, UserDetails } from "@/types";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { usePathname } from "next/navigation";

type UserContextType = {
    accessToken: string | null;
    user: User | null;
    userDetails: UserDetails | null;
    isLoading: boolean;
    subscription: Subscription | null;
    refreshUserData: () => Promise<void>;
};

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export interface Props {
    [propName: string]: any;
};

export const MyUserContextProvider = (props: Props) => {
    const { supabase } = useSupabase();
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    // Get user details helper
    const getUserDetails = () => supabase.from('users').select('*').single();
    
    // Get subscription helper
    const getSubscription = () => 
        supabase
            .from('subscriptions')
            .select('*, prices(*, products(*))')
            .in('status', ['trialing', 'active'])
            .maybeSingle();

    // Initialize auth and listen for changes
    useEffect(() => {
        // Get initial user with getUser() instead of getSession()
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUser(user ?? null);
        });

        // Get access token separately
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAccessToken(session?.access_token ?? null);
        });

        // Listen for auth state changes
        const { data: { subscription: authListener } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                setAccessToken(session?.access_token ?? null);
            }
        );

        return () => {
            authListener.unsubscribe();
        };
    }, [supabase]);

    // Function to refresh user data
    const refreshUserData = async () => {
        if (!user) return;
        
        setIsLoadingData(true);
        try {
            const results = await Promise.allSettled([getUserDetails(), getSubscription()]);
            
            const userDetailsPromise = results[0];
            const subscriptionPromise = results[1];

            if (userDetailsPromise.status === 'fulfilled') {
                setUserDetails(userDetailsPromise.value.data as UserDetails);
            }

            if (subscriptionPromise.status === 'fulfilled') {
                setSubscription(subscriptionPromise.value.data as Subscription);
            } else {
                setSubscription(null);
            }
        } finally {
            setIsLoadingData(false);
        }
    };

    // Fetch user details and subscription when user is available
    useEffect(() => {
        if (user && !isLoadingData && !userDetails && !subscription) {
            refreshUserData();
        } else if (!user && !isLoadingData) {
            setUserDetails(null);
            setSubscription(null);
        }
    }, [user]);

    // Refresh subscription data when pathname changes to /account or root
    useEffect(() => {
        if (user && (pathname === '/account' || pathname === '/')) {
            // Small delay to ensure webhook has processed
            const timer = setTimeout(() => {
                refreshUserData();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [pathname, user]);

    // Subscribe to real-time subscription changes
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel('subscription-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'subscriptions',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    refreshUserData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase]);

    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingData,
        subscription,
        refreshUserData
    };

    return <UserContext.Provider value={value} {...props} />
}

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a MyUserContextProvider');
    }

    return context;
}
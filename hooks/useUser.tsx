// import { Subscription, UserDetails } from "@/types";
// import { User } from "@supabase/supabase-js";
// import { createContext, useContext, useEffect, useState } from "react";
// import { useSessionContext, useUser as useSupaUser } from "@supabase/auth-helpers-react";

// type UserContextType = {
//     accessToken: string | null;
//     user: User | null;
//     userDetails: UserDetails | null;
//     isLoading: boolean;
//     subscription: Subscription | null;
// };

// export const UserContext = createContext<UserContextType | undefined>(
//     undefined
// );

// export interface Props {
//     [propName: string]: any;
// };

// export const MyUserContextProvider = (props: Props) => {
//     const {
//         session,
//         isLoading: isLoadingUser,
//         supabaseClient: supabase
//     } = useSessionContext();

//     const user = useSupaUser();
//     const accessToken = session?.access_token ?? null;
//     const [isLoadingData, setIsLoadingData] = useState(false);
//     const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
//     const [subscription, setSubscription] = useState<Subscription | null>(null);

//     const getUserDetails = () => supabase.from('users').select('*').single();
//     const getSubscription = () => 
//         supabase
//             .from('subscriptions')
//             .select('*, prices(*, products(*))')
//             .in('status', ['trailing', 'active'])
//             .single();
    
//     useEffect(() => {
//         if(user && !isLoadingData && !userDetails && !subscription) {
//             setIsLoadingData(true);

//             Promise.allSettled([getUserDetails(), getSubscription()]).then(
//                 (results) => {
//                     const userDetailsPromise = results[0];
//                     const subscriptionPromise = results[1];

//                     if(userDetailsPromise.status === 'fulfilled') {
//                         setUserDetails(userDetailsPromise.value.data as UserDetails);
//                     }

//                     if(subscriptionPromise.status === "fulfilled") {
//                         setSubscription(subscriptionPromise.value.data as Subscription);
//                     }

//                     setIsLoadingData(false);
//                 }
//             );
//         } else if(!user && !isLoadingUser && !isLoadingData) {
//             setUserDetails(null);
//             setSubscription(null);
//         }
//     }, [user, isLoadingUser]);

//     const value = {
//         accessToken,
//         user,
//         userDetails,
//         isLoading: isLoadingUser || isLoadingData,
//         subscription
//     };

//     return <UserContext.Provider value={value} {...props} />
// }

// export const useUser = () => {
//     const context = useContext(UserContext);
//     if(context === undefined) {
//         throw new Error('useUser must be used within a MyUserContextProvider');
//     }

//     return context;
// }

"use client"

import { Subscription, UserDetails } from "@/types";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";

type UserContextType = {
    accessToken: string | null;
    user: User | null;
    userDetails: UserDetails | null;
    isLoading: boolean;
    subscription: Subscription | null;
};

export const UserContext = createContext<UserContextType | undefined>(
    undefined
);

export interface Props {
    [propName: string]: any;
};

export const MyUserContextProvider = (props: Props) => {
    const { supabase } = useSupabase();
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
            .single();

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

    // Fetch user details and subscription when user is available
    useEffect(() => {
        if (user && !isLoadingData && !userDetails && !subscription) {
            setIsLoadingData(true);

            Promise.allSettled([getUserDetails(), getSubscription()]).then(
                (results) => {
                    const userDetailsPromise = results[0];
                    const subscriptionPromise = results[1];

                    if (userDetailsPromise.status === 'fulfilled') {
                        setUserDetails(userDetailsPromise.value.data as UserDetails);
                    }

                    if (subscriptionPromise.status === 'fulfilled') {
                        setSubscription(subscriptionPromise.value.data as Subscription);
                    }

                    setIsLoadingData(false);
                }
            );
        } else if (!user && !isLoadingData) {
            setUserDetails(null);
            setSubscription(null);
        }
    }, [user, isLoadingData, userDetails, subscription]);

    const value = {
        accessToken,
        user,
        userDetails,
        isLoading: isLoadingData,
        subscription
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
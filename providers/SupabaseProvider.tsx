"use client"

import { Database } from "@/types_db"
import { createContext, useContext, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

type SupabaseContext = {
    supabase: SupabaseClient<Database>;
};

const Context = createContext<SupabaseContext | undefined>(undefined);

interface SupabaseProviderProps {
    children: React.ReactNode;
};

export const SupabaseProvider: React.FC<SupabaseProviderProps> = ({
    children
}) => {
    const [supabase] = useState(() => 
        createBrowserClient<Database>(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    );

    return (
        <Context.Provider value={{ supabase }}>
            {children}
        </Context.Provider>
    );
};

export const useSupabase = () => {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error("useSupabase must be used inside SupabaseProvider");
    }
    return context;
};

export default SupabaseProvider;
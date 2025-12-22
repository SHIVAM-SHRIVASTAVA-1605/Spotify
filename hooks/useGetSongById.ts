// import { useSupabase } from "@/lib/supabaseClient";
// import { useSessionContext } from "@supabase/auth-helpers-react";
import { Song } from "@/types";
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const useGetSongById = (id?: string) => {
    const [isLoading, setIsLoading] = useState(false);
    const [song, setSong] = useState<Song | undefined>(undefined);
    // const { supabase } = useSupabase();
    // const { supabaseClient } = useSessionContext();

    useEffect(() => {
        if(!id) {
            return;
        }

        setIsLoading(true);

        const fetchSong = async () => {
            // const { data, error } = await supabase
            const { data, error } = await supabase
                .from('songs')
                .select('*')
                .eq('id', parseInt(id))
                .single();

            if(error) {
                setIsLoading(false);
                return toast.error(error.message);
            }

            setSong(data as Song);
            setIsLoading(false);
        }

        fetchSong();
    }, [id]);

    return useMemo(() => ({
        isLoading,
        song
    }), [isLoading, song]);
};

export default useGetSongById;
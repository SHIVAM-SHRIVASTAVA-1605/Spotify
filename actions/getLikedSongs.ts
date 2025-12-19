import { Song } from "@/types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const getLikedSongs = async (): Promise<Song[]> => {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    // const {
    //     data: {
    //         session
    //     }
    // } = await supabase.auth.getSession();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return [];
    }

    const { data, error } = await supabase
        .from('liked_songs')
        .select('*, songs(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

    if(error) {
        console.log(error);
        return [];
    }

    if(!data) {
        return [];
    }

    return data.map((item) => item.songs)
    .filter((song): song is Song => song !== null);
};

export default getLikedSongs;
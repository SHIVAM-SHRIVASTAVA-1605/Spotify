import { useSupabase } from "@/providers/SupabaseProvider";
import { Song } from "@/types";

const useLoadImage = (song: Song) => {
    const { supabase } = useSupabase();

    if(!song || !song.image_path) {
        return null;
    }

    const { data: imageData } = supabase
        .storage
        .from('images')
        .getPublicUrl(song.image_path);

    return imageData.publicUrl;
};

export default useLoadImage;
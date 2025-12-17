"use client"

import Modal from "./Modal"
import { useRouter } from "next/navigation";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import useAuthModal from "@/hooks/useAuthModal";
import { useEffect } from "react";
import { useSupabase } from "@/providers/SupabaseProvider";
import { useUser } from "@/hooks/useUser";

const AuthModal = () => {
    const { supabase } = useSupabase();
    const router = useRouter();
    
    const { user } = useUser();
    const { onClose, isOpen } = useAuthModal();

    useEffect(() => {
        if(user) {
            router.refresh();
            onClose();
        }
    }, [user, router, onClose]);

    const onChange = (open: boolean) => {
        if(!open) {
            onClose();
        }
    }

    return (
        <Modal
            title="Welcome back"
            description="Login to you account"
            isOpen={isOpen}
            onChange={() => {}}
        >
            <Auth 
                theme="dark"
                magicLink
                providers={["github"]}
                supabaseClient={supabase}
                appearance={{
                    theme: ThemeSupa,
                    variables: {
                        default: {
                            colors: {
                                brand: '#404040',
                                brandAccent: '#22c55e'
                            }
                        }
                    }
                }}
            />
        </Modal>
    );
}

export default AuthModal;
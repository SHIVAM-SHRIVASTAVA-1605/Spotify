import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
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
                            // Handling the error
                        }
                    }
                }
            }
        );

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json({ error: 'Not authenticated', user: null, subscription: null });
        }

        // Get all subscriptions for this user
        const { data: subscriptions, error: subError } = await supabase
            .from('subscriptions')
            .select('*, prices(*, products(*))')
            .eq('user_id', user.id);

        if (subError) {
            return NextResponse.json({ 
                error: subError.message, 
                user: user.id,
                subscriptions: null 
            });
        }

        // Get active subscription
        const { data: activeSubscription, error: activeError } = await supabase
            .from('subscriptions')
            .select('*, prices(*, products(*))')
            .eq('user_id', user.id)
            .in('status', ['trialing', 'active'])
            .maybeSingle();

        return NextResponse.json({ 
            user: user.id,
            email: user.email,
            allSubscriptions: subscriptions,
            activeSubscription: activeSubscription,
            activeError: activeError?.message || null
        });
    } catch (error: any) {
        console.error('[Check Subscription API]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

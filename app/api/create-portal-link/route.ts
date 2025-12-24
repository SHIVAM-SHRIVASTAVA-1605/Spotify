import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/libs/stripe";
import { getURL } from "@/libs/helpers";
import { createOrRetrieveCustomer } from "@/libs/supabaseAdmin";

export async function POST() {
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

        const { data: { user } } = await supabase.auth.getUser();

        if(!user) throw new Error('Could not get user');

        const customer = await createOrRetrieveCustomer({
            uuid: user.id || '',
            email: user.email || ''
        });

        if(!customer) throw new Error('Could not get customer');

        const { url } = await stripe.billingPortal.sessions.create({
            customer,
            return_url: `${getURL()}/account`
        });

        return NextResponse.json({ url });
    } catch (error: any) {
        console.log(error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
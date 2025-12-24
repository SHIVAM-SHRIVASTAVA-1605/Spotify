import { createServerClient } from "@supabase/ssr";
import { headers, cookies } from "next/headers";
import { NextResponse } from "next/server";

import { stripe } from "@/libs/stripe";
import { getURL } from "@/libs/helpers";
import { createOrRetrieveCustomer } from "@/libs/supabaseAdmin";

export async function POST(
    request: Request
) {
    const { price, quantity = 1, metadata = {} } = await request.json();

    try {
        // const supabase = createRouteHandlerClient({
        //     cookies,
        // });

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

        const customer = await createOrRetrieveCustomer({
            uuid: user?.id || '',
            email: user?.email || ''
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            billing_address_collection: 'required',
            customer,
            line_items: [
                {
                    price: price.id,
                    quantity
                }
            ],
            mode: 'subscription',
            allow_promotion_codes: true,
            subscription_data: {
                // trial_from_plan: true,
                metadata
            },
            success_url: `${getURL()}/account`,
            cancel_url: `${getURL()}`
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.log(error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
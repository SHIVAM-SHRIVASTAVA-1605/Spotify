import Stripe from "stripe";

export interface UserDetails {
    id: string;
    // first_name: string;
    // last_name: string;
    full_name?: string;
    avatar_url?: string;
    // billing_address?: Stripe.Address;
    billing_address: Stripe.Address | null;
    // payment_method?: Stripe.PaymentMethod[Stripe.PaymentMethod.Type];
    payment_method: Stripe.PaymentMethod[Stripe.PaymentMethod.Type] | null;
};

export interface Product {
    id: string;
    active?: boolean;
    name?: string;
    description?: string;
    image?: string;
    metadata?: Stripe.Metadata;
}

export interface Price {
    id: string;
    product_id?: string;
    // active?: string;
    active?: boolean;
    description?: string;
    // unit_amount?: string;
    uniit_amount?: number;
    currency?: string;
    type?: Stripe.Price.Type;
    inteval?: Stripe.Price.Recurring.Interval;
    interval_count?: number;
    trial_period_days?: number | null;
    metadata?: Stripe.Metadata;
    products?: Product;
}

export interface Subscription {
    id: string;
    user_id: string;
    status?: Stripe.Subscription.Status;
    metadata?: Stripe.Metadata;
    price_id?: string;
    // quantity?: string;
    quantity?: number | null;
    // cancel_at_period_end?: boolean;
    cancel_at_period_end?: boolean | null;
    created: string;
    current_period_start: string;
    current_period_end: string;
    // ended_at?: string;
    ended_at?: string | null;
    // cancel_at?: string;
    cancel_at?: string | null;
    // canceled_at?: string;
    canceled_at?: string | null;
    // trial_start?: string;
    trial_start?: string | null;
    // trial_end?: string;
    trial_end?: string | null;
    prices?: Price;
}
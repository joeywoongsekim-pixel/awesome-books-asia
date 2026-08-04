import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {createSupabaseService} from '../../../lib/supabase/service';

// Stripe → entitlements. Configure the endpoint in the Stripe dashboard as
// https://www.awesomebooks.asia/api/stripe-webhook with the events
// checkout.session.completed and customer.subscription.updated/deleted,
// then set STRIPE_WEBHOOK_SECRET (and SUPABASE_SERVICE_ROLE_KEY) in Vercel.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabase = createSupabaseService();
  if (!secret || !whSecret || !supabase) {
    return NextResponse.json({error: 'unconfigured'}, {status: 503});
  }

  const stripe = new Stripe(secret);
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, whSecret);
  } catch {
    return NextResponse.json({error: 'bad signature'}, {status: 400});
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.user_id;

    if (session.mode === 'payment' && userId && session.metadata?.book_id) {
      await supabase.from('purchases').insert({
        user_id: userId,
        book_id: session.metadata.book_id,
        stripe_payment_intent:
          typeof session.payment_intent === 'string' ? session.payment_intent : null
      });
    }

    if (session.mode === 'subscription' && userId && session.subscription) {
      const subId =
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id;
      const sub = await stripe.subscriptions.retrieve(subId);
      const periodEnd = sub.items.data[0]?.current_period_end;
      await supabase.from('subscriptions').upsert(
        {
          user_id: userId,
          stripe_subscription_id: subId,
          status: sub.status === 'active' || sub.status === 'trialing' ? 'active' : sub.status,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null
        },
        {onConflict: 'stripe_subscription_id'}
      );
    }
  }

  if (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const sub = event.data.object;
    const periodEnd = sub.items.data[0]?.current_period_end;
    await supabase
      .from('subscriptions')
      .update({
        status:
          event.type === 'customer.subscription.deleted'
            ? 'canceled'
            : sub.status === 'active' || sub.status === 'trialing'
              ? 'active'
              : sub.status,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null
      })
      .eq('stripe_subscription_id', sub.id);
  }

  return NextResponse.json({received: true});
}

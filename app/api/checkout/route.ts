import {NextRequest, NextResponse} from 'next/server';
import Stripe from 'stripe';
import {createSupabaseServer} from '../../../lib/supabase/server';

// Creates a Stripe Checkout session. Until STRIPE_SECRET_KEY (and, for
// subscriptions, STRIPE_PRICE_MONTHLY / STRIPE_PRICE_ANNUAL) are set in the
// environment this responds 503 and the UI shows a quiet notice.
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({error: 'unconfigured'}, {status: 503});

  const body = (await req.json().catch(() => null)) as
    | {kind: 'book'; slug: string; locale: string}
    | {kind: 'sub'; plan: 'monthly' | 'annual'; locale: string}
    | null;
  if (!body || !('kind' in body)) {
    return NextResponse.json({error: 'bad request'}, {status: 400});
  }
  const locale = 'locale' in body && body.locale ? body.locale : 'en';

  const supabase = await createSupabaseServer();
  const {
    data: {user}
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error: 'auth'}, {status: 401});

  const stripe = new Stripe(secret);
  const origin = req.nextUrl.origin;
  const successUrl = `${origin}/${locale}/library?paid=1`;

  if (body.kind === 'book') {
    const {data: book} = await supabase
      .from('books')
      .select('id, slug, title, price_cents')
      .eq('slug', body.slug)
      .maybeSingle();
    if (!book || !book.price_cents) {
      return NextResponse.json({error: 'not purchasable'}, {status: 404});
    }
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email ?? undefined,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: book.price_cents,
            product_data: {name: book.title}
          }
        }
      ],
      metadata: {user_id: user.id, book_id: book.id},
      success_url: successUrl,
      cancel_url: `${origin}/${locale}/books/${book.slug}`
    });
    return NextResponse.json({url: session.url});
  }

  const priceId =
    body.plan === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY;
  if (!priceId) return NextResponse.json({error: 'unconfigured'}, {status: 503});

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email ?? undefined,
    line_items: [{price: priceId, quantity: 1}],
    metadata: {user_id: user.id, plan: body.plan},
    subscription_data: {metadata: {user_id: user.id}},
    success_url: successUrl,
    cancel_url: `${origin}/${locale}/#plans`
  });
  return NextResponse.json({url: session.url});
}

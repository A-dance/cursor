import { createClient } from "@supabase/supabase-js";
import { isPaidUser } from "@/lib/isPaidUser";
import { getStripe } from "@/lib/stripe";
import { tryGetSupabaseAdmin } from "@/lib/supabaseAdmin";

/** ログインメールと同じ Stripe Customer を検索 */
export async function findStripeCustomerByEmail(email) {
  const stripe = getStripe();
  const { data } = await stripe.customers.list({
    email: email.trim().toLowerCase(),
    limit: 1,
  });
  return data[0] ?? null;
}

/**
 * @returns {{ ok: boolean, error?: string }}
 */
async function saveProfile(userId, patch, accessToken) {
  const admin = tryGetSupabaseAdmin();

  if (admin) {
    const { error } = await admin.from("profiles").upsert({
      id: userId,
      stripe_customer_id: patch.stripe_customer_id,
      is_paid: patch.is_paid,
    });
    if (!error) return { ok: true };
    return { ok: false, error: `admin: ${error.message}` };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!accessToken || !url || !key) {
    return {
      ok: false,
      error:
        "SUPABASE_SERVICE_ROLE_KEY が未設定です。Dashboard → Settings → API の service_role を .env に追加するか、SQL で profiles テーブルを作成してください。",
    };
  }

  const supabase = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  const { error: rpcError } = await supabase.rpc("update_my_stripe_profile", {
    p_customer_id: patch.stripe_customer_id,
    p_is_paid: patch.is_paid,
  });
  if (!rpcError) return { ok: true };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      stripe_customer_id: patch.stripe_customer_id,
      is_paid: patch.is_paid,
    })
    .eq("id", userId);

  if (!updateError) return { ok: true };

  return {
    ok: false,
    error: `rpc: ${rpcError.message} / update: ${updateError.message}`,
  };
}

/**
 * Stripe の Customer を profiles に保存し、有料か判定
 */
export async function syncStripeCustomerForUser(userId, email, accessToken) {
  const customer = await findStripeCustomerByEmail(email);
  if (!customer) {
    return { synced: false, customerId: null, isPaid: false, saveError: null };
  }

  const paid = await isPaidUser(customer.id);
  const patch = {
    stripe_customer_id: customer.id,
    is_paid: paid,
  };

  const { ok, error: saveError } = await saveProfile(userId, patch, accessToken);

  return {
    synced: ok,
    customerId: customer.id,
    isPaid: paid,
    saveError: saveError ?? null,
  };
}

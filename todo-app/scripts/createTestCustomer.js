/**
 * テスト用 Customer + Subscription を作成（チュートリアル用）
 * 実行: node scripts/createTestCustomer.js
 */
const { loadEnv } = require("./loadEnv");
loadEnv();

const Stripe = require("stripe");

const priceId = process.env.STRIPE_PRICE_ID;
if (!process.env.STRIPE_SECRET_KEY) {
  console.error("STRIPE_SECRET_KEY を .env に設定してください");
  process.exit(1);
}
if (!priceId) {
  console.error("STRIPE_PRICE_ID を .env に設定してください");
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

(async () => {
  const customer = await stripe.customers.create({
    email: "test-user@example.com",
    description: "Playground user",
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: priceId }],
  });

  console.log("Customer ID:", customer.id);
  console.log("Subscription status:", subscription.status);
  console.log("\n判定テスト: node scripts/checkPaid.js", customer.id);
})().catch((e) => {
  console.error(e.message);
  process.exit(1);
});

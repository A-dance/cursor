/**
 * isPaidUser() の CLI テスト
 * 実行: node scripts/checkPaid.js cus_xxxxx
 */
const { loadEnv } = require("./loadEnv");
loadEnv();

const Stripe = require("stripe");

function isSubscriptionPaid(sub) {
  return ["active", "trialing"].includes(sub.status);
}

async function isPaidUser(customerId) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { data } = await stripe.subscriptions.list({
    customer: customerId,
    status: "all",
    limit: 20,
  });
  return data.some((sub) => isSubscriptionPaid(sub));
}

(async () => {
  const customerId = process.argv[2];
  if (!customerId) {
    throw new Error("Customer ID を渡してください（例: node scripts/checkPaid.js cus_xxx）");
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY を .env に設定してください");
  }

  const paid = await isPaidUser(customerId);
  console.log(paid ? "有料ユーザーです" : "無料ユーザーです");
})().catch((e) => {
  console.error("判定エラー:", e.message);
  process.exit(1);
});

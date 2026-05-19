/** Stripe サブスクから請求期間終了（Unix 秒）を取得 */
export function getSubscriptionPeriodEndUnix(subscription) {
  if (!subscription) return null;

  const top = subscription.current_period_end;
  if (typeof top === "number" && top > 0) return top;

  const items = subscription.items?.data;
  if (Array.isArray(items)) {
    for (const item of items) {
      const end = item?.current_period_end;
      if (typeof end === "number" && end > 0) return end;
    }
  }

  const cancelAt = subscription.cancel_at;
  if (typeof cancelAt === "number" && cancelAt > 0) return cancelAt;

  return null;
}

/** ISO 文字列に変換。取得できない場合は null */
export function subscriptionPeriodEndIso(subscription) {
  const unix = getSubscriptionPeriodEndUnix(subscription);
  if (!unix) return null;
  const d = new Date(unix * 1000);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

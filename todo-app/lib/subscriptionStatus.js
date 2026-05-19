/** レッスン: active / trialing を有料扱い */
export const PAID_SUBSCRIPTION_STATUSES = ["active", "trialing"];

/** 機能利用可能か（解約予約後も請求期間末までは true） */
export function canUsePaidFeatures(subscription) {
  if (!subscription) return false;
  const status =
    typeof subscription === "string" ? subscription : subscription.status;
  return PAID_SUBSCRIPTION_STATUSES.includes(status);
}

/** Webhook / DB 同期用（canUsePaidFeatures と同じ） */
export function isSubscriptionPaid(subscription) {
  return canUsePaidFeatures(subscription);
}

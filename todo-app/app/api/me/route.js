import { authenticateRequest } from "@/lib/authenticateRequest";
import { resolvePaidStatus } from "@/lib/resolvePaidStatus";
import { NextResponse } from "next/server";

/** レッスンの GET /me 相当 — フロント用に isPaidUser とサブスク状態を返す */
export async function GET(request) {
  const { user, error } = await authenticateRequest(request);

  if (error || !user) {
    return NextResponse.json({ error: "未ログイン" }, { status: 401 });
  }

  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();

  const status = await resolvePaidStatus(user.id, token || undefined);

  const payload = {
    id: user.id,
    email: user.email,
    stripeCustomerId: status.customerId,
    isPaidUser: status.isPaid,
    paidSource: status.source,
    subscription: status.subscription,
  };

  if (process.env.NODE_ENV === "development") {
    console.log("ユーザー情報:", payload);
  }

  return NextResponse.json(payload);
}

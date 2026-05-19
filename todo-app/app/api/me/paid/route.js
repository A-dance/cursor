import { authenticateRequest } from "@/lib/authenticateRequest";
import { resolvePaidStatus } from "@/lib/resolvePaidStatus";
import { NextResponse } from "next/server";

/** ログインユーザーが有料か（Stripe Subscription または profiles） */
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

  return NextResponse.json({
    isPaid: status.isPaid,
    source: status.source,
    customerId: status.customerId,
  });
}

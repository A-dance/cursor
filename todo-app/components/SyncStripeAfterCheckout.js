"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/** ?paid=success のとき Stripe Customer を自動同期 */
export default function SyncStripeAfterCheckout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (searchParams.get("paid") !== "success") return;

    let cancelled = false;

    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        if (!cancelled) {
          setMessage("ログインしてから再度お試しください。");
        }
        return;
      }

      const res = await fetch("/api/me/sync-stripe", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      let json = {};
      try {
        json = await res.json();
      } catch {
        json = { message: "サーバー応答の解析に失敗しました" };
      }

      if (!cancelled) {
        if (json.synced && json.isPaid) {
          setMessage("有料プランを確認しました。TODO が使えます。");
        } else if (json.customerId) {
          setMessage(
            [json.message, json.detail].filter(Boolean).join(" — ") ||
              `Customer ID: ${json.customerId}`,
          );
        } else {
          setMessage(
            json.message ??
              "Stripe の顧客が見つかりませんでした。決済時と同じメールでログインしているか確認してください。",
          );
        }
      }

      router.replace("/");
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  if (!message) return null;

  return (
    <p
      style={{
        padding: "0.75rem 1rem",
        marginBottom: "1rem",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: 6,
        fontSize: "0.875rem",
      }}
    >
      {message}
    </p>
  );
}

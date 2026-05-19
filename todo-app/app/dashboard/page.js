"use client";

import SubscriptionPanel from "@/components/SubscriptionPanel";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * 検証レッスン用ダッシュボード（マニュアルの /dashboard 相当）
 * GET /api/me で isPaidUser を確認
 */
export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("billing") === "return") {
      setReloadKey((k) => k + 1);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("未ログインです");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "取得に失敗しました");
        setLoading(false);
        return;
      }

      console.log("ユーザー情報:", json);
      setUser(json);
      setLoading(false);
    })();
  }, [reloadKey]);

  if (loading) {
    return (
      <main style={{ padding: "2rem" }}>
        <h2>ダッシュボード（検証用）</h2>
        <p>読み込み中…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ padding: "2rem" }}>
        <h2>ダッシュボード（検証用）</h2>
        <p style={{ color: "#b91c1c" }}>{error}</p>
        <p>
          <Link href="/">トップでログイン →</Link>
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 560 }}>
      <h2>ダッシュボード（検証用）</h2>
      <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1.5rem" }}>
        マニュアルの /dashboard + GET /me 相当。ターミナルにもユーザー情報が出力されます。
      </p>

      <section
        style={{
          padding: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: 8,
          marginBottom: "1rem",
          background: user.isPaidUser ? "#f0fdf4" : "#fffbeb",
        }}
      >
        {user.isPaidUser ? (
          <p style={{ margin: 0, fontWeight: 600 }}>有料ユーザー向けダッシュボード</p>
        ) : (
          <p style={{ margin: 0, fontWeight: 600 }}>
            無料ユーザー向けダッシュボード（アップグレードを促す）
          </p>
        )}
        <p id="feature" style={{ margin: "0.75rem 0 0", fontSize: "0.875rem" }}>
          {user.isPaidUser
            ? "プレミアム機能が使えます"
            : "まずは無料でお試しください"}
        </p>
      </section>

      {user.isPaidUser ? (
        <SubscriptionPanel subscription={user.subscription} />
      ) : null}

      <dl style={{ fontSize: "0.875rem", lineHeight: 1.8 }}>
        <dt>email</dt>
        <dd>{user.email}</dd>
        <dt>isPaidUser</dt>
        <dd>{String(user.isPaidUser)}</dd>
        <dt>stripeCustomerId</dt>
        <dd>{user.stripeCustomerId ?? "（未設定）"}</dd>
        <dt>paidSource</dt>
        <dd>{user.paidSource}</dd>
        <dt>cancelAtPeriodEnd</dt>
        <dd>{String(user.subscription?.cancelAtPeriodEnd ?? false)}</dd>
        <dt>currentPeriodEnd</dt>
        <dd>
          {user.subscription?.currentPeriodEnd
            ? new Date(user.subscription.currentPeriodEnd).toLocaleString("ja-JP")
            : "—"}
        </dd>
      </dl>

      <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#888" }}>
        Webhook テスト:{" "}
        <code>
          stripe listen --forward-to localhost:3000/api/webhooks/stripe
        </code>
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/">ホーム</Link>
        {" · "}
        <Link href="/subscribe">有料プラン</Link>
        {" · "}
        <Link href="/todos">TODO</Link>
      </p>
    </main>
  );
}

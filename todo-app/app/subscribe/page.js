"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

export default function SubscribePage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      const accessToken = session?.access_token;
      if (!accessToken) {
        setError(
          "ログイン情報を取得できませんでした。トップページ（/）で一度ログアウトしてから、再度ログインしてください。",
        );
        return;
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const contentType = res.headers.get("content-type") ?? "";
      const json = contentType.includes("application/json")
        ? await res.json()
        : null;

      if (!res.ok) {
        setError(json?.error ?? `決済の開始に失敗しました（${res.status}）`);
        return;
      }

      if (!json?.url) {
        setError("決済ページの URL を取得できませんでした");
        return;
      }

      window.location.assign(json.url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "通信エラーが発生しました。しばらくしてから再度お試しください。",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>読み込み中…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: "2rem",
        textAlign: "center",
        maxWidth: 400,
        margin: "auto",
      }}
    >
      <h2>有料プラン</h2>
      <p style={{ color: "#666", marginBottom: "1.5rem" }}>
        TODO の追加・編集・削除は有料プランでご利用いただけます。
      </p>

      {!user ? (
        <p style={{ color: "#b45309", marginBottom: "1rem", fontSize: "0.875rem" }}>
          先にログインしてください。
          <Link href="/" style={{ marginLeft: "0.25rem" }}>
            トップへ
          </Link>
        </p>
      ) : (
        <p style={{ color: "#666", marginBottom: "1rem", fontSize: "0.875rem" }}>
          ログイン中: {user.email}
        </p>
      )}

      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading || !user}
        style={{ padding: "0.75rem 1.5rem", width: "100%" }}
      >
        {loading ? "処理中…" : "Stripe で登録する（テスト）"}
      </button>
      {error ? (
        <p style={{ color: "red", marginTop: "1rem", fontSize: "0.875rem" }}>
          {error}
        </p>
      ) : null}
      <p style={{ marginTop: "1.5rem", fontSize: "0.75rem", color: "#888" }}>
        学習用: Supabase の profiles で is_paid を true にすると、決済なしでも TODO
        を試せます。
      </p>
    </main>
  );
}

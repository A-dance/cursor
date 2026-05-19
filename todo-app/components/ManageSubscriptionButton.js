"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/** Stripe Customer Portal へ（解約・支払い方法の変更） */
export default function ManageSubscriptionButton({ label = "プラン管理・解約" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setError("ログインしてください");
        return;
      }

      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "ポータルを開けませんでした");
        return;
      }

      if (json.url) {
        window.location.assign(json.url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "inline-block" }}>
      <button type="button" onClick={handleClick} disabled={loading}>
        {loading ? "読み込み中…" : label}
      </button>
      {error ? (
        <span
          style={{
            display: "block",
            color: "#b91c1c",
            fontSize: "0.75rem",
            marginTop: "0.25rem",
          }}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}


"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function formatEndDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const btn = {
  padding: "0.5rem 0.85rem",
  borderRadius: 6,
  fontSize: "0.875rem",
  cursor: "pointer",
};

/** サブスク状態の表示 — 管理と解約を分離 */
export default function SubscriptionPanel({ subscription }) {
  const router = useRouter();
  const [localSub, setLocalSub] = useState(subscription);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const [justCanceled, setJustCanceled] = useState(false);

  useEffect(() => {
    setLocalSub(subscription);
    if (subscription?.cancelAtPeriodEnd) setJustCanceled(false);
  }, [subscription]);

  const authHeaders = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("ログインしてください");
    return { Authorization: `Bearer ${session.access_token}` };
  };

  const applyCanceled = (currentPeriodEnd) => {
    setLocalSub((prev) => ({
      ...prev,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: currentPeriodEnd ?? prev?.currentPeriodEnd,
    }));
    setJustCanceled(true);
    setError(null);
    router.refresh();
  };

  const handlePortal = async () => {
    setBusy("portal");
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "ポータルを開けませんでした");
      if (json.url) window.location.assign(json.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setBusy(null);
    }
  };

  const handleCancel = async () => {
    if (localSub?.cancelAtPeriodEnd) {
      setJustCanceled(true);
      return;
    }

    const endLabel =
      formatEndDate(localSub?.currentPeriodEnd) ?? "請求期間の終了日";

    const ok = window.confirm(
      `サブスクリプションを解約しますか？\n\n${endLabel}までは TODO を引き続きご利用いただけます。\nそれ以降は自動更新されません。`,
    );
    if (!ok) return;

    setBusy("cancel");
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "解約に失敗しました");
      applyCanceled(json.currentPeriodEnd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setBusy(null);
    }
  };

  const handleResume = async () => {
    const ok = window.confirm(
      "解約予約を取り消して、サブスクリプションを継続しますか？",
    );
    if (!ok) return;

    setBusy("resume");
    setError(null);
    try {
      const headers = await authHeaders();
      const res = await fetch("/api/subscription/resume", {
        method: "POST",
        headers,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "取り消しに失敗しました");
      setJustCanceled(false);
      setLocalSub((prev) => ({
        ...prev,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: json.currentPeriodEnd ?? prev?.currentPeriodEnd,
      }));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setBusy(null);
    }
  };

  const canceled = Boolean(localSub?.cancelAtPeriodEnd);
  const endLabel = formatEndDate(localSub?.currentPeriodEnd);

  return (
    <div
      style={{
        margin: "0.5rem auto 1rem",
        maxWidth: 440,
        padding: "0.75rem 1rem",
        borderRadius: 8,
        border: canceled ? "1px solid #fcd34d" : "1px solid #e5e5e5",
        background: canceled ? "#fffbeb" : "#f9fafb",
        fontSize: "0.875rem",
      }}
    >
      {canceled ? (
        <>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 600, color: "#92400e" }}>
            解約済みです
          </p>
          <p style={{ margin: "0 0 0.75rem", color: "#78350f" }}>
            {endLabel
              ? `${endLabel} まで TODO をご利用いただけます。`
              : "請求期間の終了までは TODO をご利用いただけます。"}
          </p>
          {justCanceled ? (
            <p
              style={{
                margin: "0 0 0.75rem",
                padding: "0.5rem 0.65rem",
                borderRadius: 6,
                background: "#fef3c7",
                color: "#92400e",
                fontSize: "0.8125rem",
                textAlign: "center",
              }}
            >
              解約の手続きが完了しました。
            </p>
          ) : null}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={handleResume}
              disabled={Boolean(busy)}
              style={{ ...btn, background: "#2563eb", color: "#fff", border: "none" }}
            >
              {busy === "resume" ? "処理中…" : "解約を取り消す（継続する）"}
            </button>
            <button
              type="button"
              onClick={handlePortal}
              disabled={Boolean(busy)}
              style={{ ...btn, background: "#fff", border: "1px solid #d1d5db" }}
            >
              {busy === "portal" ? "処理中…" : "支払い・請求の管理"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ margin: "0 0 0.75rem", color: "#374151" }}>
            有料プラン利用中
            {endLabel ? `（次回更新目安: ${endLabel}）` : ""}
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <button
              type="button"
              onClick={handlePortal}
              disabled={Boolean(busy)}
              style={{ ...btn, background: "#fff", border: "1px solid #d1d5db" }}
            >
              {busy === "portal" ? "処理中…" : "支払い・請求の管理"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={Boolean(busy)}
              style={{
                ...btn,
                background: "#fff",
                border: "1px solid #fca5a5",
                color: "#b91c1c",
              }}
            >
              {busy === "cancel" ? "処理中…" : "解約する"}
            </button>
          </div>
        </>
      )}
      {error ? (
        <span
          style={{
            display: "block",
            color: "#b91c1c",
            fontSize: "0.75rem",
            marginTop: "0.5rem",
            textAlign: "center",
          }}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import SubscriptionPanel from "@/components/SubscriptionPanel";
import UserMenu from "@/components/UserMenu";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { useState } from "react";

export default function AuthGate() {
  const { user, loading, isPaid, subscription } = useSupabaseUser();
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) return <p>読み込み中…</p>;

  if (!user) {
    return <AuthForm />;
  }

  if (!isPaid) {
    return (
      <div style={{ textAlign: "center" }}>
        <UserMenu userEmail={user.email} />
        <p style={{ margin: "1.5rem 0" }}>
          有料プランに登録すると TODO 機能が使えます。
        </p>
        <Link
          href="/subscribe"
          style={{
            display: "inline-block",
            padding: "0.75rem 1.5rem",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 6,
            textDecoration: "none",
          }}
        >
          有料プランを見る
        </Link>
      </div>
    );
  }

  return (
    <>
      <UserMenu userEmail={user.email} />
      <SubscriptionPanel subscription={subscription} />
      <TodoForm onAdd={() => setRefreshKey((prev) => prev + 1)} />
      <TodoList refreshKey={refreshKey} />
    </>
  );
}

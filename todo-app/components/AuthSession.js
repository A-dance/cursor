"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthForm from "@/components/AuthForm";
import UserMenu from "@/components/UserMenu";

export default function AuthSession() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <p>読み込み中…</p>;
  }

  if (user) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <p>ログインしました。</p>
        <UserMenu userEmail={user.email} />
        <p>
          <Link href="/todos">TODOリストへ進む →</Link>
        </p>
        <p>
          <Link href="/">ホームへ →</Link>
        </p>
      </div>
    );
  }

  return <AuthForm />;
}

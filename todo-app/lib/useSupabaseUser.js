"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

async function fetchMe(accessToken) {
  const res = await fetch("/api/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json();
}

/** 認証状態 (user, loading, isPaid, subscription) を返すカスタムフック */
export function useSupabaseUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    let mounted = true;

    const applySession = async (session) => {
      if (!mounted) return;

      try {
        const sessionUser = session?.user ?? null;
        setUser(sessionUser);

        if (sessionUser && session?.access_token) {
          const me = await fetchMe(session.access_token);
          if (!mounted) return;
          setIsPaid(Boolean(me?.isPaidUser));
          setSubscription(me?.subscription ?? null);
        } else {
          setIsPaid(false);
          setSubscription(null);
        }
      } catch {
        if (mounted) {
          setIsPaid(false);
          setSubscription(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(() => {
          applySession(session);
        }, 0);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading, isPaid, subscription };
}

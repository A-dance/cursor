"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function UserMenu({ userEmail }) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span>{userEmail}</span>
      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>
    </div>
  );
}

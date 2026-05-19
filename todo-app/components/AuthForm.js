"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");

  const normalizeEmail = () => email.trim().toLowerCase();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const normalizedEmail = normalizeEmail();
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    if (data.session) {
      router.refresh();
      return;
    }

    setInfoMsg(
      "登録しました。確認メールのリンクを開いてから「ログイン」を押してください。",
    );
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setInfoMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(),
      password,
    });

    setLoading(false);

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("email not confirmed") ||
        msg.includes("not confirmed")
      ) {
        setErrorMsg(
          "メールアドレスがまだ確認されていません。受信トレイの確認メールのリンクを開くか、Supabase の Users で手動確認してください。",
        );
      } else if (error.message === "Invalid login credentials") {
        setErrorMsg(
          "ログインできません。パスワードを確認するか、登録直後なら確認メールのリンクを開いてください（未確認だとこのエラーになることがあります）。",
        );
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    router.refresh();
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto" }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <input
        type="password"
        placeholder="Password（6文字以上）"
        value={password}
        required
        minLength={6}
        onChange={(e) => setPassword(e.target.value)}
        style={{ width: "100%", padding: "0.5rem", marginBottom: "0.5rem" }}
      />
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <button
          type="button"
          disabled={loading}
          onClick={handleSignUp}
          style={{ flex: 1, padding: "0.5rem" }}
        >
          {loading ? "処理中…" : "登録"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={handleSignIn}
          style={{ flex: 1, padding: "0.5rem" }}
        >
          {loading ? "処理中…" : "ログイン"}
        </button>
      </div>
      {errorMsg ? (
        <p style={{ color: "red", fontSize: "0.875rem" }}>{errorMsg}</p>
      ) : null}
      {infoMsg ? (
        <p style={{ color: "#2563eb", fontSize: "0.875rem" }}>{infoMsg}</p>
      ) : null}
    </div>
  );
}

import AuthSession from "@/components/AuthSession";

export default function AuthPage() {
  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <h2>認証</h2>
      <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>
        ログイン後は上部メニューまたは下のリンクから TODO リストへ移動できます。
      </p>
      <AuthSession />
    </main>
  );
}

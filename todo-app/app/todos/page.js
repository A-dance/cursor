import AuthGate from "@/components/AuthGate";

export default function TodosPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h2>TODO リスト</h2>
      <p style={{ fontSize: "0.875rem", color: "#666", marginBottom: "1rem" }}>
        有料プラン登録済みのユーザーのみ利用できます（マニュアル: ルーティングガード）。
      </p>
      <AuthGate />
    </main>
  );
}

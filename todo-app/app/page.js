import AuthGate from "@/components/AuthGate";

export default function Home() {
  return (
    <main style={{ padding: "2rem" }}>
      <h2>TODO アプリ</h2>
      <AuthGate />
    </main>
  );
}

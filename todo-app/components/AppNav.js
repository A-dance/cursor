import Link from "next/link";

export default function AppNav() {
  return (
    <nav
      style={{
        display: "flex",
        gap: "1rem",
        padding: "0.75rem 1rem",
        borderBottom: "1px solid #e5e5e5",
        marginBottom: "0.5rem",
      }}
    >
      <Link href="/">ホーム</Link>
      <Link href="/todos">TODOリスト</Link>
      <Link href="/auth">認証</Link>
    </nav>
  );
}

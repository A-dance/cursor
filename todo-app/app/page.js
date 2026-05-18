import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <h1>Todo App</h1>
      <p>Supabase に保存された TODO を表示します。</p>
      <p>
        <Link href="/todos">TODOリストを見る →</Link>
      </p>
    </main>
  );
}

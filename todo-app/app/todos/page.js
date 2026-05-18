import { fetchTodos } from "@/lib/fetchTodos";

export const dynamic = "force-dynamic";

export default async function TodoListPage() {
  let todos = [];
  let errorMessage = null;

  try {
    todos = await fetchTodos();
  } catch (err) {
    console.error(err);
    errorMessage =
      err instanceof Error ? err.message : "データの取得に失敗しました";
  }

  return (
    <main>
      <h2>TODOリスト</h2>
      {errorMessage ? (
        <p>エラー: {errorMessage}</p>
      ) : todos.length === 0 ? (
        <p>TODO がありません。</p>
      ) : (
        <ul>
          {todos.map((todo) => (
            <li key={todo.id}>{todo.title.trim()}</li>
          ))}
        </ul>
      )}
    </main>
  );
}

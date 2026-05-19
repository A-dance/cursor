"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTodosFromApi } from "@/lib/todoApi";
import TodoItem from "@/components/TodoItem";

/**
 * 一覧取得と再取得ロジックをカプセル化
 * refreshKey が変わると一覧を再取得（追加後の同期用）
 */
export default function TodoList({ refreshKey = 0 }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTodos = useCallback(async () => {
    setError(null);
    try {
      const data = await fetchTodosFromApi();
      setTodos(data);
    } catch (err) {
      setTodos([]);
      setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadTodos();
  }, [loadTodos, refreshKey]);

  if (loading) {
    return <p>読み込み中…</p>;
  }

  if (error) {
    return <p style={{ color: "#b91c1c", fontSize: "0.875rem" }}>{error}</p>;
  }

  if (todos.length === 0) {
    return <p>TODO がありません。</p>;
  }

  return (
    <ul style={{ padding: 0 }}>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onRefresh={loadTodos} />
      ))}
    </ul>
  );
}

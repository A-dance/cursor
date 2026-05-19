"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchTodos } from "@/lib/fetchTodos";
import TodoItem from "@/components/TodoItem";

/**
 * 一覧取得と再取得ロジックをカプセル化
 * refreshKey が変わると一覧を再取得（追加後の同期用）
 */
export default function TodoList({ refreshKey = 0 }) {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTodos = useCallback(async () => {
    const data = await fetchTodos();
    setTodos(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos, refreshKey]);

  if (loading) {
    return <p>読み込み中…</p>;
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

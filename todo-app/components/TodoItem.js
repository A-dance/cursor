"use client";

import { useState } from "react";
import { deleteTodoViaApi, updateTodoViaApi } from "@/lib/todoApi";

export default function TodoItem({ todo, onRefresh }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      await updateTodoViaApi(todo.id, trimmed);
      setEditing(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この TODO を削除しますか？")) return;

    setLoading(true);
    setError(null);
    try {
      await deleteTodoViaApi(todo.id);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <li style={{ marginBottom: "0.5rem", listStyle: "none" }}>
      {editing ? (
        <>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginRight: "0.5rem", padding: "0.25rem" }}
            disabled={loading}
          />
          <button type="button" onClick={handleUpdate} disabled={loading}>
            保存
          </button>
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setTitle(todo.title);
              setError(null);
            }}
            disabled={loading}
            style={{ marginLeft: "0.25rem" }}
          >
            キャンセル
          </button>
        </>
      ) : (
        <>
          {todo.title.trim()}
          <button
            type="button"
            onClick={() => setEditing(true)}
            style={{ marginLeft: "0.5rem" }}
            disabled={loading}
          >
            編集
          </button>
          <button
            type="button"
            onClick={handleDelete}
            style={{ marginLeft: "0.5rem" }}
            disabled={loading}
          >
            削除
          </button>
        </>
      )}
      {error ? (
        <p style={{ color: "#b91c1c", fontSize: "0.75rem", margin: "0.25rem 0 0" }}>
          {error}
        </p>
      ) : null}
    </li>
  );
}

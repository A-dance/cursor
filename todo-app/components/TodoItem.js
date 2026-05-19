"use client";

import { useState } from "react";
import { deleteTodo } from "@/lib/deleteTodo";
import { updateTodo } from "@/lib/updateTodo";

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
    const ok = await updateTodo(todo.id, trimmed);
    setLoading(false);

    if (ok) {
      setEditing(false);
      onRefresh();
    } else {
      setError(
        "更新に失敗しました。UPDATE 用の RLS ポリシーがあるか確認してください。",
      );
    }
  };

  const handleDelete = async () => {
    if (!confirm("この TODO を削除しますか？")) return;

    setLoading(true);
    setError(null);
    const ok = await deleteTodo(todo.id);
    setLoading(false);

    if (ok) {
      onRefresh();
    } else {
      setError(
        "削除に失敗しました。DELETE 用の RLS ポリシーがあるか確認してください。",
      );
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

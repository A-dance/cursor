"use client";

import { useState } from "react";
import { insertTodo } from "@/lib/insertTodo";

/**
 * props:
 *   onAdd: (todo) => void
 */
export default function TodoForm({ onAdd }) {
  // 教材 例2: オブジェクトを state で管理
  const [form, setForm] = useState({ title: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = form.title.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);

    try {
      const newTodo = await insertTodo(trimmed);
      if (newTodo) {
        onAdd(newTodo);
        setForm((prev) => ({ ...prev, title: "" }));
      } else {
        setError(
          "追加に失敗しました。user_id カラムと RLS ポリシーを確認してください。",
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "追加に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="新しい TODO を入力"
        value={form.title}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, title: e.target.value }))
        }
        style={{ padding: "0.5rem", width: "70%" }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}
      >
        {loading ? "追加中…" : "追加"}
      </button>
      {error ? (
        <p style={{ color: "#b91c1c", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          {error}
        </p>
      ) : null}
    </form>
  );
}

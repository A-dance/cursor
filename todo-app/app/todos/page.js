"use client";

import { useState } from "react";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";

export default function TodosPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAdd = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h2>TODO リスト</h2>
      <TodoForm onAdd={handleAdd} />
      <TodoList refreshKey={refreshKey} />
    </main>
  );
}

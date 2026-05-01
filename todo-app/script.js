const STORAGE_KEY = "todo-app-items";

const form = document.querySelector("#todo-form");
const input = document.querySelector("#todo-input");
const startDateInput = document.querySelector("#start-date");
const endDateInput = document.querySelector("#end-date");
const list = document.querySelector("#todo-list");
const itemsLeft = document.querySelector("#items-left");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedButton = document.querySelector("#clear-completed");
const template = document.querySelector("#todo-item-template");

let todos = [];
let currentFilter = "all";

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (todo) =>
        todo &&
        typeof todo.id === "string" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean" &&
        typeof todo.startDate === "string" &&
        typeof todo.endDate === "string"
    );
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function filteredTodos() {
  if (currentFilter === "active") {
    return todos.filter((todo) => !todo.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter((todo) => todo.completed);
  }
  return todos;
}

function updateCount() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  itemsLeft.textContent = `${remaining}件の未完了`;
}

function toDate(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function formatDate(dateStr) {
  const date = toDate(dateStr);
  return date.toLocaleDateString("ja-JP", {
    month: "numeric",
    day: "numeric",
  });
}

function calcDurationDays(startDate, endDate) {
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = toDate(endDate).getTime() - toDate(startDate).getTime();
  return Math.floor(diff / msPerDay) + 1;
}

function getRemainingDays(endDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((toDate(endDate).getTime() - today.getTime()) / msPerDay);
}

function getRemainingMeter(todo) {
  const totalDays = calcDurationDays(todo.startDate, todo.endDate);
  const remainingRaw = getRemainingDays(todo.endDate);
  const remainingDays = Math.max(0, Math.min(totalDays, remainingRaw));
  const ratio = totalDays <= 0 ? 0 : Math.round((remainingDays / totalDays) * 100);
  return { totalDays, remainingDays, ratio };
}

function buildDueLabel(todo) {
  if (todo.completed) return "完了";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = toDate(todo.endDate);
  const msPerDay = 1000 * 60 * 60 * 24;
  const diff = Math.floor((deadline.getTime() - today.getTime()) / msPerDay);
  if (diff < 0) return `期限切れ ${Math.abs(diff)}日`;
  if (diff === 0) return "今日まで";
  return `残り ${diff}日`;
}

function createTodoElement(todo) {
  const fragment = template.content.cloneNode(true);
  const item = fragment.querySelector(".todo-item");
  const checkbox = fragment.querySelector(".toggle");
  const text = fragment.querySelector(".text");
  const period = fragment.querySelector(".period");
  const dueBadge = fragment.querySelector(".due-badge");
  const meterFill = fragment.querySelector(".todo-meter-fill");
  const meterLabel = fragment.querySelector(".todo-meter-label");
  const deleteButton = fragment.querySelector(".delete-btn");

  text.textContent = todo.text;
  period.textContent = `${formatDate(todo.startDate)} - ${formatDate(todo.endDate)}`;
  dueBadge.textContent = buildDueLabel(todo);
  const meter = getRemainingMeter(todo);
  meterFill.style.width = `${todo.completed ? 0 : meter.ratio}%`;
  meterLabel.textContent = todo.completed
    ? "完了"
    : `残り ${meter.remainingDays}/${meter.totalDays}日`;
  checkbox.checked = todo.completed;
  item.classList.toggle("completed", todo.completed);
  item.classList.toggle("overdue", !todo.completed && buildDueLabel(todo).startsWith("期限切れ"));

  checkbox.addEventListener("change", () => {
    todos = todos.map((t) =>
      t.id === todo.id ? { ...t, completed: checkbox.checked } : t
    );
    saveTodos();
    render();
  });

  deleteButton.addEventListener("click", () => {
    todos = todos.filter((t) => t.id !== todo.id);
    saveTodos();
    render();
  });

  return fragment;
}

function render() {
  list.innerHTML = "";
  const targetTodos = filteredTodos();

  if (targetTodos.length === 0) {
    const empty = document.createElement("li");
    empty.className = "todo-item";
    empty.innerHTML = `<span class="text">Todoはまだありません。</span>`;
    list.appendChild(empty);
  } else {
    targetTodos.forEach((todo) => {
      list.appendChild(createTodoElement(todo));
    });
  }

  filterButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });

  updateCount();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  const startDate = startDateInput.value;
  const endDate = endDateInput.value;
  if (!text || !startDate || !endDate) return;
  if (toDate(startDate) > toDate(endDate)) {
    alert("終了日は開始日以降を選んでください。");
    return;
  }

  todos.unshift({
    id: generateId(),
    text,
    completed: false,
    startDate,
    endDate,
  });

  input.value = "";
  startDateInput.value = "";
  endDateInput.value = "";
  saveTodos();
  render();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter || "all";
    render();
  });
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.completed);
  saveTodos();
  render();
});

todos = loadTodos();
render();

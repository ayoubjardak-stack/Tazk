export const PRIORITIES = ["low", "medium", "high"];

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function createTask({ title, priority = "medium", dueDate = null, notes = "" }) {
  const now = Date.now();
  const cleanTitle = title.trim();

  return {
    id: createId(),
    title: cleanTitle,
    notes: notes.trim(),
    priority: PRIORITIES.includes(priority) ? priority : "medium",
    dueDate: dueDate ? dueDate : null,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function toggleComplete(task) {
  return { ...task, completed: !task.completed, updatedAt: Date.now() };
}

export function updateTask(task, patch) {
  const title = typeof patch.title === "string" ? patch.title.trim() : task.title;

  return {
    ...task,
    title: title === "" ? task.title : title,
    notes: typeof patch.notes === "string" ? patch.notes.trim() : task.notes,
    priority: PRIORITIES.includes(patch.priority) ? patch.priority : task.priority,
    dueDate: patch.dueDate ? patch.dueDate : null,
    updatedAt: Date.now(),
  };
}

export function deleteTask(tasks, id) {
  return tasks.filter((task) => task.id !== id);
}

export function clearCompleted(tasks) {
  return tasks.filter((task) => !task.completed);
}

export function filterTasks(tasks, { filter = "all", search = "" } = {}) {
  const needle = search.trim().toLowerCase();

  return tasks.filter((task) => {
    if (filter === "active" && task.completed) return false;
    if (filter === "completed" && !task.completed) return false;
    if (needle === "") return true;

    return (
      task.title.toLowerCase().includes(needle) ||
      task.notes.toLowerCase().includes(needle)
    );
  });
}

export function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    const rank = (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
    if (rank !== 0) return rank;

    if (a.dueDate !== b.dueDate) {
      if (a.dueDate === null) return 1;
      if (b.dueDate === null) return -1;
      return a.dueDate < b.dueDate ? -1 : 1;
    }

    return a.createdAt - b.createdAt;
  });
}

export function todayString() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${now.getFullYear()}-${month}-${day}`;
}

export function isOverdue(task) {
  return !task.completed && task.dueDate !== null && task.dueDate < todayString();
}

export function getCounts(tasks) {
  const completed = tasks.filter((task) => task.completed).length;

  return {
    total: tasks.length,
    completed,
    active: tasks.length - completed,
    overdue: tasks.filter(isOverdue).length,
  };
}

export function formatDueDate(dueDate) {
  if (!dueDate) return "";

  const [year, month, day] = dueDate.split("-").map(Number);
  if (!year || !month || !day) return dueDate;

  const date = new Date(year, month - 1, day);
  const formatted = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });

  return `Due ${formatted}`;
}
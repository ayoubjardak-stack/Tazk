const STORAGE_KEY = "task-manager.tasks.v1";

const PRIORITIES = ["low", "medium", "high"];

function normalizeTask(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (typeof raw.id !== "string" || raw.id === "") return null;
  if (typeof raw.title !== "string") return null;

  const now = Date.now();

  return {
    id: raw.id,
    title: raw.title,
    notes: typeof raw.notes === "string" ? raw.notes : "",
    priority: PRIORITIES.includes(raw.priority) ? raw.priority : "medium",
    dueDate: typeof raw.dueDate === "string" && raw.dueDate !== "" ? raw.dueDate : null,
    completed: raw.completed === true,
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : now,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : now,
  };
}

export function loadTasks() {
  let parsed;

  try {
    parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed.map(normalizeTask).filter((task) => task !== null);
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
}
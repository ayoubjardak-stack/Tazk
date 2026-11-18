import { loadTasks, saveTasks } from "./storage.js";
import { loadSettings, saveSettings, applySettings } from "./settings.js";
import {
  clearCompleted,
  createTask,
  deleteTask,
  filterTasks,
  formatDueDate,
  getCounts,
  isOverdue,
  sortTasks,
  toggleComplete,
  updateTask,
} from "./tasks.js";

const el = {};

let tasks = loadTasks();
let filter = "all";
let search = "";
let editingId = null;
let confirmDeleteId = null;
let searchTimer = null;
let settings = loadSettings();

function persist() {
  const ok = saveTasks(tasks);
  el.storageError.hidden = ok;
}

function applyTheme() {
  settings = applySettings(settings);
  syncSettingsUI();
}

function persistSettings() {
  saveSettings(settings);
  applyTheme();
}

function priorityLabel(priority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function buildMeta(task) {
  const meta = document.createElement("div");
  meta.className = "task-meta";

  const badge = document.createElement("span");
  badge.className = `badge priority-${task.priority}`;
  badge.textContent = priorityLabel(task.priority);
  meta.append(badge);

  if (task.dueDate) {
    const due = document.createElement("span");
    due.className = isOverdue(task) ? "due overdue" : "due";
    due.textContent = formatDueDate(task.dueDate);
    meta.append(due);
  }

  if (task.notes) {
    const flag = document.createElement("span");
    flag.className = "notes-flag";
    flag.textContent = "Note";
    flag.title = task.notes;
    meta.append(flag);
  }

  return meta;
}

function buildEditor(task) {
  const editor = document.createElement("div");
  editor.className = "task-editor";

  const titleInput = document.createElement("input");
  titleInput.className = "input editor-title";
  titleInput.type = "text";
  titleInput.maxLength = 200;
  titleInput.value = task.title;
  titleInput.dataset.field = "title";
  titleInput.placeholder = "Task title";
  titleInput.setAttribute("aria-label", "Task title");

  const row = document.createElement("div");
  row.className = "editor-row";

  const dueInput = document.createElement("input");
  dueInput.className = "input editor-date";
  dueInput.type = "date";
  dueInput.value = task.dueDate ?? "";
  dueInput.dataset.field = "dueDate";
  dueInput.setAttribute("aria-label", "Due date");

  const prioritySelect = document.createElement("select");
  prioritySelect.className = "input editor-priority";
  prioritySelect.dataset.field = "priority";
  prioritySelect.setAttribute("aria-label", "Priority");
  for (const value of ["low", "medium", "high"]) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = priorityLabel(value);
    option.selected = task.priority === value;
    prioritySelect.append(option);
  }

  const notesInput = document.createElement("textarea");
  notesInput.className = "input editor-notes";
  notesInput.rows = 3;
  notesInput.maxLength = 1000;
  notesInput.value = task.notes;
  notesInput.dataset.field = "notes";
  notesInput.placeholder = "Notes";
  notesInput.setAttribute("aria-label", "Notes");

  const actions = document.createElement("div");
  actions.className = "editor-actions";

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "btn btn-primary";
  saveBtn.dataset.action = "save";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-ghost";
  cancelBtn.dataset.action = "cancel";
  cancelBtn.textContent = "Cancel";

  actions.append(saveBtn, cancelBtn);
  row.append(dueInput, prioritySelect);
  editor.append(titleInput, row, notesInput, actions);

  return editor;
}

function buildTaskRow(task) {
  const li = document.createElement("li");
  li.className = "task";
  li.dataset.id = task.id;
  li.classList.toggle("completed", task.completed);
  li.classList.toggle("overdue", isOverdue(task));
  li.classList.toggle("editing", editingId === task.id);

  const main = document.createElement("div");
  main.className = "task-main";

  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.className = "task-toggle";
  toggle.checked = task.completed;
  toggle.dataset.action = "toggle";
  toggle.setAttribute(
    "aria-label",
    `Mark "${task.title}" as ${task.completed ? "not done" : "done"}`,
  );

  const body = document.createElement("div");
  body.className = "task-body";

  const title = document.createElement("span");
  title.className = "task-title";
  title.textContent = task.title;

  body.append(title, buildMeta(task));

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn btn-ghost btn-small";
  editBtn.dataset.action = "edit";
  editBtn.textContent = editingId === task.id ? "Close" : "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = confirmDeleteId === task.id ? "btn btn-danger btn-small" : "btn btn-ghost btn-small";
  deleteBtn.dataset.action = "delete";
  deleteBtn.textContent = confirmDeleteId === task.id ? "Confirm?" : "Delete";

  actions.append(editBtn, deleteBtn);
  main.append(toggle, body, actions);
  li.append(main);

  if (editingId === task.id) {
    li.append(buildEditor(task));
  }

  return li;
}

function captureFocus() {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;

  if (active === el.search) {
    return { target: "search", pos: active.selectionStart };
  }

  if (active === el.newTitle) {
    return { target: "new-title", pos: active.selectionStart };
  }

  const row = active.closest(".task");
  if (row) {
    return {
      target: "task",
      taskId: row.dataset.id,
      action: active.dataset.action ?? null,
      field: active.dataset.field ?? null,
      pos: active.selectionStart,
    };
  }

  return null;
}

function restoreFocus(snapshot) {
  if (!snapshot) return;

  if (snapshot.target === "search") {
    el.search.focus();
    if (typeof snapshot.pos === "number") el.search.setSelectionRange(snapshot.pos, snapshot.pos);
    return;
  }

  if (snapshot.target === "new-title") {
    el.newTitle.focus();
    if (typeof snapshot.pos === "number") el.newTitle.setSelectionRange(snapshot.pos, snapshot.pos);
    return;
  }

  const row = el.taskList.querySelector(`.task[data-id="${CSS.escape(snapshot.taskId)}"]`);
  if (!row) return;

  const selector = snapshot.field
    ? `[data-field="${snapshot.field}"]`
    : `[data-action="${snapshot.action}"]`;
  const target = row.querySelector(selector);
  if (!(target instanceof HTMLElement)) return;

  target.focus();
  if (typeof snapshot.pos === "number" && typeof target.setSelectionRange === "function") {
    try {
      target.setSelectionRange(snapshot.pos, snapshot.pos);
    } catch {
      /* input types without selection support */
    }
  }
}

function emptyMessage(counts, visible) {
  if (counts.total === 0) return "No tasks yet. Add one above to get started.";
  if (visible > 0) return "";

  if (search.trim() !== "") return `No tasks match "${search.trim()}".`;
  if (filter === "active") return "No active tasks. Everything is done!";
  if (filter === "completed") return "Nothing completed yet.";

  return "No tasks to show.";
}

function render() {
  const snapshot = captureFocus();
  const counts = getCounts(tasks);
  const visible = sortTasks(filterTasks(tasks, { filter, search }));

  el.progress.textContent =
    counts.total === 0
      ? "No tasks yet"
      : `${counts.completed} of ${counts.total} done${
          counts.overdue > 0 ? ` · ${counts.overdue} overdue` : ""
        }`;
  el.progressFill.style.width = counts.total === 0 ? "0%" : `${(counts.completed / counts.total) * 100}%`;

  el.countAll.textContent = `${counts.total}`;
  el.countActive.textContent = `${counts.active}`;
  el.countCompleted.textContent = `${counts.completed}`;

  for (const btn of el.filterBtns) {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", `${active}`);
  }

  el.footerCount.textContent = `${counts.active} task${counts.active === 1 ? "" : "s"} left`;
  el.clearCompleted.disabled = counts.completed === 0;

  const message = emptyMessage(counts, visible.length);
  el.emptyState.textContent = message;
  el.emptyState.hidden = message === "";

  const list = document.createDocumentFragment();
  for (const task of visible) list.append(buildTaskRow(task));
  el.taskList.replaceChildren(list);

  restoreFocus(snapshot);
}

function findTask(id) {
  return tasks.find((task) => task.id === id);
}

function commit(mutated) {
  tasks = mutated;
  persist();
  render();
}

function handleAdd(event) {
  event.preventDefault();

  const title = el.newTitle.value.trim();
  if (title === "") {
    el.newTitle.focus();
    return;
  }

  const task = createTask({
    title,
    priority: el.newPriority.value,
    dueDate: el.newDue.value,
  });

  tasks = [task, ...tasks];
  persist();
  el.newTitle.value = "";
  confirmDeleteId = null;
  render();
  el.newTitle.focus();
}

function handleListClick(event) {
  const target = event.target.closest("[data-action]");
  if (!(target instanceof HTMLElement)) return;

  const row = target.closest(".task");
  const task = row ? findTask(row.dataset.id) : null;
  const action = target.dataset.action;

  if (action === "toggle") return;

  if (!task) return;

  if (action === "edit") {
    editingId = editingId === task.id ? null : task.id;
    confirmDeleteId = null;
    render();
    return;
  }

  if (action === "delete") {
    if (confirmDeleteId === task.id) {
      editingId = editingId === task.id ? null : editingId;
      confirmDeleteId = null;
      commit(deleteTask(tasks, task.id));
    } else {
      confirmDeleteId = task.id;
      render();
    }
    return;
  }

  if (action === "save") {
    const editor = row.querySelector(".task-editor");
    if (!editor) return;

    const data = readEditor(editor);
    const next = updateTask(task, data);
    const updated = tasks.map((item) => (item.id === task.id ? next : item));

    editingId = null;
    confirmDeleteId = null;
    commit(updated);
    return;
  }

  if (action === "cancel") {
    editingId = null;
    confirmDeleteId = null;
    render();
  }
}

function readEditor(editor) {
  const value = (field) => editor.querySelector(`[data-field="${field}"]`)?.value ?? "";

  return {
    title: value("title"),
    notes: value("notes"),
    priority: value("priority"),
    dueDate: value("dueDate"),
  };
}

function handleListChange(event) {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const row = target.closest(".task");
  const task = row ? findTask(row.dataset.id) : null;

  if (task && target.dataset.action === "toggle") {
    commit(tasks.map((item) => (item.id === task.id ? toggleComplete(item) : item)));
  }
}

function handleListKeydown(event) {
  if (event.key !== "Enter" && event.key !== "Escape") return;
  if (!(event.target instanceof HTMLElement)) return;

  const editor = event.target.closest(".task-editor");
  if (!editor) return;

  const row = editor.closest(".task");
  const task = row ? findTask(row.dataset.id) : null;
  if (!task) return;

  if (event.key === "Escape") {
    event.preventDefault();
    editingId = null;
    render();
    return;
  }

  if (event.target.matches("textarea")) return;

  event.preventDefault();
  const next = updateTask(task, readEditor(editor));
  editingId = null;
  commit(tasks.map((item) => (item.id === task.id ? next : item)));
}

function handleFilterClick(event) {
  const btn = event.target.closest("[data-filter]");
  if (!(btn instanceof HTMLElement)) return;

  filter = btn.dataset.filter;
  confirmDeleteId = null;
  render();
}

function handleSearchInput() {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    search = el.search.value;
    render();
  }, 120);
}

function handleClearCompleted() {
  if (!tasks.some((task) => task.completed)) return;

  editingId = null;
  confirmDeleteId = null;
  commit(clearCompleted(tasks));
}

function openSettings() {
  syncSettingsUI();
  el.settingsModal.showModal();
}

function closeSettings() {
  el.settingsModal.close();
}

function syncSettingsUI() {
  for (const btn of el.themeBtns) {
    btn.classList.toggle("active", btn.dataset.theme === settings.theme);
  }
  for (const btn of el.scaleBtns) {
    btn.classList.toggle("active", btn.dataset.scale === settings.scale);
  }
  for (const sw of el.swatches) {
    const isActive = settings.theme === "hacker" ? false : sw.dataset.color === settings.accent;
    sw.classList.toggle("active", isActive);
    sw.disabled = settings.theme === "hacker";
  }
}

function handleSettingsClick(event) {
  const themeBtn = event.target.closest("[data-theme]");
  if (themeBtn) {
    settings.theme = themeBtn.dataset.theme;
    persistSettings();
    return;
  }

  const scaleBtn = event.target.closest("[data-scale]");
  if (scaleBtn) {
    settings.scale = scaleBtn.dataset.scale;
    persistSettings();
    return;
  }

  const swatch = event.target.closest("[data-color]");
  if (swatch) {
    settings.accent = swatch.dataset.color;
    persistSettings();
  }
}

function bindSettingsHandlers() {
  el.themeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      settings.theme = btn.dataset.theme;
      persistSettings();
    });
  });
  el.scaleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      settings.scale = btn.dataset.scale;
      persistSettings();
    });
  });
  el.swatches.forEach((sw) => {
    sw.addEventListener("click", () => {
      settings.accent = sw.dataset.color;
      persistSettings();
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  el.taskList = document.querySelector("#task-list");
  el.emptyState = document.querySelector("#empty-state");
  el.addForm = document.querySelector("#add-form");
  el.newTitle = document.querySelector("#new-title");
  el.newDue = document.querySelector("#new-due");
  el.newPriority = document.querySelector("#new-priority");
  el.search = document.querySelector("#search");
  el.progress = document.querySelector("#progress");
  el.progressFill = document.querySelector("#progress-fill");
  el.footerCount = document.querySelector("#footer-count");
  el.clearCompleted = document.querySelector("#clear-completed");
  el.storageError = document.querySelector("#storage-error");
  el.countAll = document.querySelector("#count-all");
  el.countActive = document.querySelector("#count-active");
  el.countCompleted = document.querySelector("#count-completed");
  el.filterBtns = document.querySelectorAll("[data-filter]");

  el.settingsBtn = document.querySelector("#settings-btn");
  el.settingsModal = document.querySelector("#settings-modal");
  el.settingsClose = document.querySelector("#settings-close");
  el.settingsDone = document.querySelector("#settings-done");
  el.themeBtns = document.querySelectorAll("[data-theme]");
  el.scaleBtns = document.querySelectorAll("[data-scale]");
  el.swatches = document.querySelectorAll("[data-color]");

  el.addForm.addEventListener("submit", handleAdd);
  el.taskList.addEventListener("click", handleListClick);
  el.taskList.addEventListener("change", handleListChange);
  el.taskList.addEventListener("keydown", handleListKeydown);
  el.search.addEventListener("input", handleSearchInput);
  el.clearCompleted.addEventListener("click", handleClearCompleted);
  for (const btn of el.filterBtns) btn.addEventListener("click", handleFilterClick);

  el.settingsBtn.addEventListener("click", openSettings);
  el.settingsClose.addEventListener("click", closeSettings);
  el.settingsDone.addEventListener("click", closeSettings);
  bindSettingsHandlers();

  applyTheme();
  render();
});
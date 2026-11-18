// A small front-end-only to-do list demo. Tasks are stored in
// localStorage so they survive a page reload — nothing is sent
// anywhere, there's no backend.

const STORAGE_KEY = "listed-tasks";

const form = document.getElementById("addForm");
const input = document.getElementById("taskInput");
const listEl = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const remainingCountEl = document.getElementById("remainingCount");
const clearCompletedBtn = document.getElementById("clearCompleted");

let tasks = loadTasks();

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Couldn't read saved tasks:", err);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn("Couldn't save tasks:", err);
  }
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) return;
  tasks.push({ id: makeId(), text: trimmed, completed: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  render();
}

function render() {
  listEl.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task-item" + (task.completed ? " completed" : "");
    li.innerHTML = `
      <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""} aria-label="Mark \"${escapeHtml(task.text)}\" as ${task.completed ? "not done" : "done"}">
      <span class="task-label">${escapeHtml(task.text)}</span>
      <button type="button" class="task-delete" aria-label="Delete \"${escapeHtml(task.text)}\"">×</button>
    `;
    li.querySelector(".task-checkbox").addEventListener("change", () => toggleTask(task.id));
    li.querySelector(".task-delete").addEventListener("click", () => deleteTask(task.id));
    listEl.appendChild(li);
  });

  emptyState.hidden = tasks.length > 0;

  const remaining = tasks.filter((t) => !t.completed).length;
  remainingCountEl.textContent = `${remaining} ${remaining === 1 ? "task" : "tasks"} left`;

  const hasCompleted = tasks.some((t) => t.completed);
  clearCompletedBtn.hidden = !hasCompleted;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTask(input.value);
  input.value = "";
  input.focus();
});

clearCompletedBtn.addEventListener("click", clearCompleted);

render();

const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const storageStatus = document.querySelector("#storage-status");
const storageKey = "todo-list-tasks";

const checkIcon = `
  <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="m3.5 8 3 3 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

const deleteIcon = `
  <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M4.5 6h11m-9.5 0 .6 9.1a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9L14 6m-6.5 0V4.5A.5.5 0 0 1 8 4h4a.5.5 0 0 1 .5.5V6m-4 2.5v4m3-4v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
`;

function updateTaskCount() {
  const count = taskList.children.length;
  taskCount.textContent = `${count} ${count === 1 ? "task" : "tasks"}`;
  emptyState.hidden = count > 0;
}

function setStorageError(error) {
  console.error("Unable to access saved tasks.", error);
  storageStatus.hidden = false;
  storageStatus.textContent = "Your tasks could not be saved in this browser.";
}

function saveTasks() {
  const tasks = [...taskList.children].map((item) => ({
    text: item.dataset.task,
    completed: item.classList.contains("is-complete"),
  }));

  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    storageStatus.hidden = true;
    storageStatus.textContent = "";
  } catch (error) {
    setStorageError(error);
  }
}

function loadTasks() {
  try {
    const savedTasks = localStorage.getItem(storageKey);
    if (savedTasks === null) {
      return [];
    }

    const tasks = JSON.parse(savedTasks);
    if (
      !Array.isArray(tasks) ||
      !tasks.every(
        (task) =>
          task &&
          typeof task.text === "string" &&
          typeof task.completed === "boolean"
      )
    ) {
      throw new Error("Saved task data has an unexpected format.");
    }

    return tasks;
  } catch (error) {
    setStorageError(error);
    return [];
  }
}

function addTask(text, completed = false) {
  const item = document.createElement("li");
  item.className = completed ? "task-item is-complete" : "task-item";
  item.dataset.task = text;

  const toggle = document.createElement("button");
  toggle.className = "task-toggle";
  toggle.type = "button";
  toggle.setAttribute("aria-label", `Mark "${text}" as ${completed ? "incomplete" : "complete"}`);
  toggle.setAttribute("aria-pressed", String(completed));
  toggle.innerHTML = checkIcon;

  const taskText = document.createElement("span");
  taskText.className = "task-text";
  taskText.textContent = text;

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-task";
  deleteButton.type = "button";
  deleteButton.setAttribute("aria-label", `Delete "${text}"`);
  deleteButton.innerHTML = deleteIcon;

  toggle.addEventListener("click", () => {
    const isComplete = item.classList.toggle("is-complete");
    toggle.setAttribute("aria-label", `Mark "${text}" as ${isComplete ? "incomplete" : "complete"}`);
    toggle.setAttribute("aria-pressed", String(isComplete));
    saveTasks();
  });

  deleteButton.addEventListener("click", () => {
    item.remove();
    updateTaskCount();
    saveTasks();
  });

  item.append(toggle, taskText, deleteButton);
  taskList.append(item);
  updateTaskCount();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = taskInput.value.trim();

  if (!text) {
    taskInput.focus();
    return;
  }

  addTask(text);
  saveTasks();
  taskInput.value = "";
  taskInput.focus();
});

for (const task of loadTasks()) {
  addTask(task.text, task.completed);
}

updateTaskCount();

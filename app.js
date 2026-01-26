let sortMode = "manual"; // manual | due | priority

const inputBox = document.getElementById("inputBox");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const emptyState = document.getElementById("emptyState");
const statsBar = document.getElementById("statsBar");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const themeToggle = document.getElementById("themeToggle");
const searchBox = document.getElementById("searchBox");
const sortDueBtn = document.getElementById("sortDueBtn");
const sortPriorityBtn = document.getElementById("sortPriorityBtn");
const priorityFilterButtons = document.querySelectorAll(".priority-filter-btn");

let dragSrcId = null;
let currentSearch = "";
let currentFilter = "all";       // status filter
let currentPriorityFilter = "all"; // priority filter
let todos = [];

/* ------------------------------
   Storage
------------------------------ */

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

/* ------------------------------
   Theme
------------------------------ */

function loadTheme() {
  const stored = localStorage.getItem("theme") || "dark";
  document.body.classList.toggle("dark", stored === "dark");
  document.body.classList.toggle("light", stored === "light");
  themeToggle.checked = stored === "light";
}

themeToggle.addEventListener("change", () => {
  const mode = themeToggle.checked ? "light" : "dark";
  document.body.classList.toggle("light", mode === "light");
  document.body.classList.toggle("dark", mode === "dark");
  localStorage.setItem("theme", mode);
});

/* ------------------------------
   Todos
------------------------------ */

function loadTodos() {
  const stored = localStorage.getItem("todos");
  if (!stored) return;

  todos = JSON.parse(stored).map(t => ({
    id: t.id || crypto.randomUUID(),
    text: t.text,
    completed: t.completed,
    dueDate: t.dueDate || null,
    priority: t.priority || "medium"
  }));
}

/* ------------------------------
   Filtering + Sorting
------------------------------ */

function getFilteredTodos() {
  let result = todos;

  // Status filter
  if (currentFilter === "active") result = result.filter(t => !t.completed);
  if (currentFilter === "completed") result = result.filter(t => t.completed);

  // Priority filter
  if (currentPriorityFilter !== "all") {
    result = result.filter(t => t.priority === currentPriorityFilter);
  }

  // Search filter
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    result = result.filter(t => t.text.toLowerCase().includes(q));
  }

  // Sorting
  if (sortMode === "due") {
    result = [...result].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }

  if (sortMode === "priority") {
    const rank = { high: 0, medium: 1, low: 2 };
    result = [...result].sort((a, b) => {
      return rank[a.priority] - rank[b.priority];
    });
  }

  return result;
}

/* ------------------------------
   Sort Buttons
------------------------------ */

sortDueBtn.addEventListener("click", () => {
  sortMode = sortMode === "due" ? "manual" : "due";

  sortDueBtn.classList.toggle("active", sortMode === "due");
  sortPriorityBtn.classList.remove("active");

  sortDueBtn.textContent =
    sortMode === "due" ? "Manual Order" : "Sort by Due";

  if (sortMode !== "due") {
    sortDueBtn.textContent = "Sort by Due";
  }

  renderTodos();
});

sortPriorityBtn.addEventListener("click", () => {
  sortMode = sortMode === "priority" ? "manual" : "priority";

  sortPriorityBtn.classList.toggle("active", sortMode === "priority");
  sortDueBtn.classList.remove("active");

  sortPriorityBtn.textContent =
    sortMode === "priority" ? "Manual Order" : "Sort by Priority";

  if (sortMode !== "priority") {
    sortPriorityBtn.textContent = "Sort by Priority";
  }

  renderTodos();
});

/* ------------------------------
   Stats
------------------------------ */

function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  statsBar.textContent =
    `Total: ${total} | Active: ${total - completed} | Completed: ${completed}`;
}

/* ------------------------------
   Render
------------------------------ */

function renderTodos() {
  list.innerHTML = "";

  const filteredTodos = getFilteredTodos();
  updateStats();

  clearCompletedBtn.style.display =
    todos.some(t => t.completed) ? "block" : "none";

  emptyState.style.display =
    filteredTodos.length ? "none" : "block";

  filteredTodos.forEach(todo => {
    const index = todos.findIndex(t => t.id === todo.id);

    const li = document.createElement("li");
    li.draggable = sortMode === "manual";

    if (todo.completed) li.classList.add("completed");

    if (todo.dueDate && !todo.completed) {
      const today = new Date();
      const due = new Date(todo.dueDate);
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);

      if (due < today) li.classList.add("overdue");
      else if (due.getTime() === today.getTime()) li.classList.add("due-today");
    }

    /* Drag reorder */
    li.addEventListener("dragstart", e => {
      if (sortMode !== "manual") return;
      dragSrcId = todo.id;
      e.dataTransfer.setData("text/plain", "");
    });

    li.addEventListener("dragover", e => {
      if (sortMode !== "manual") return;
      e.preventDefault();
    });

    li.addEventListener("drop", e => {
      if (sortMode !== "manual") return;
      e.preventDefault();
      if (!dragSrcId || dragSrcId === todo.id) return;

      const from = todos.findIndex(t => t.id === dragSrcId);
      const to = todos.findIndex(t => t.id === todo.id);
      if (from === -1 || to === -1) return;

      const [moved] = todos.splice(from, 1);
      todos.splice(to, 0, moved);

      saveTodos();
      renderTodos();
    });

    /* Checkbox */
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    checkbox.addEventListener("change", () => {
      todos[index].completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    /* Priority badge */
    const priorityBadge = document.createElement("span");
    priorityBadge.className = `priority-badge ${todo.priority}`;
    priorityBadge.textContent = todo.priority[0].toUpperCase();

    priorityBadge.addEventListener("click", () => {
      const order = ["low", "medium", "high"];
      const next =
        order[(order.indexOf(todo.priority) + 1) % order.length];

      todos[index].priority = next;
      saveTodos();
      renderTodos();
    });

    /* Text */
    const span = document.createElement("span");
    span.textContent = todo.text;

    span.addEventListener("dblclick", () => {
      const input = document.createElement("input");
      input.value = todo.text;
      input.className = "edit-input";
      li.replaceChild(input, topRow);
      input.focus();

      function saveEdit() {
        const value = input.value.trim();
        if (value) todos[index].text = value;
        saveTodos();
        renderTodos();
      }

      input.addEventListener("keydown", e => {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") renderTodos();
      });

      input.addEventListener("blur", saveEdit);
    });

    /* Due date */
    const dateBtn = document.createElement("button");
    dateBtn.className = "due-date-btn";
    dateBtn.textContent = todo.dueDate
      ? new Date(todo.dueDate).toLocaleDateString()
      : "Add date";

    dateBtn.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "date";
      input.value = todo.dueDate || "";
      input.className = "date-input";
      bottomRow.replaceChild(input, dateBtn);
      input.focus();

      function saveDate() {
        todos[index].dueDate = input.value || null;
        saveTodos();
        renderTodos();
      }

      input.addEventListener("change", saveDate);
      input.addEventListener("blur", saveDate);
    });

    /* Delete */
    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.className = "delete-btn";

    delBtn.addEventListener("click", () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    /* Row layout */
    const topRow = document.createElement("div");
    topRow.className = "todo-top-row";
    topRow.append(checkbox, priorityBadge, span);

    const bottomRow = document.createElement("div");
    bottomRow.className = "todo-bottom-row";
    bottomRow.append(dateBtn, delBtn);

    li.append(topRow, bottomRow);
    list.appendChild(li);
  });
}

/* ------------------------------
   Add Todo
------------------------------ */

function addItem() {
  const value = inputBox.value.trim();
  if (!value) return;

  todos.push({
    id: crypto.randomUUID(),
    text: value,
    completed: false,
    dueDate: null,
    priority: "medium"
  });

  saveTodos();
  renderTodos();
  inputBox.value = "";
}

/* ------------------------------
   Events
------------------------------ */

addBtn.addEventListener("click", addItem);

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
});

inputBox.addEventListener("keydown", e => {
  if (e.key === "Enter") addItem();
});

searchBox.addEventListener("input", e => {
  currentSearch = e.target.value;
  renderTodos();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTodos();
  });
});

/* ------------------------------
   Priority Filters
------------------------------ */

priorityFilterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentPriorityFilter = btn.dataset.priority;

    priorityFilterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    renderTodos();
  });
});

/* ------------------------------
   Init
------------------------------ */

loadTheme();
loadTodos();
renderTodos();
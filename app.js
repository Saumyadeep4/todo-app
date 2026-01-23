const inputBox = document.getElementById("inputBox");
const addBtn = document.getElementById("addBtn");
const list = document.getElementById("list");
const emptyState = document.getElementById("emptyState");
const statsBar = document.getElementById("statsBar");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let todos = [];
let currentFilter = "all";

// ---- LocalStorage ----
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function loadTodos() {
  const stored = localStorage.getItem("todos");
  if (stored) {
    todos = JSON.parse(stored);
  }
}

// ---- Filtering ----
function getFilteredTodos() {
  if (currentFilter === "active") {
    return todos.filter(t => !t.completed);
  }
  if (currentFilter === "completed") {
    return todos.filter(t => t.completed);
  }
  return todos;
}

// ---- Stats ----
function updateStats() {
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;

  statsBar.textContent = `Total: ${total} | Active: ${active} | Completed: ${completed}`;
}

// ---- Render ----
function renderTodos() {
  list.innerHTML = "";

  const filteredTodos = getFilteredTodos();

  updateStats();
  const hasCompleted = todos.some(t => t.completed);
  clearCompletedBtn.style.display = hasCompleted ? "block" : "none";

  // ---- Empty state toggle ----
  if (filteredTodos.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }

  filteredTodos.forEach((todo) => {
    const index = todos.indexOf(todo);
    const li = document.createElement("li");
    li.classList.add("todo-enter");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.completed;

    const span = document.createElement("span");
    span.textContent = todo.text;

    const delBtn = document.createElement("button");
    delBtn.textContent = "×";
    delBtn.className = "delete-btn";

    if (todo.completed) {
      li.classList.add("completed");
    }

    // Toggle complete
    checkbox.addEventListener("change", () => {
      todos[index].completed = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    // Delete with animation
    delBtn.addEventListener("click", () => {
      li.classList.add("todo-exit");

      li.addEventListener(
        "animationend",
        () => {
          todos.splice(index, 1);
          saveTodos();
          renderTodos();
        },
        { once: true }
      );
    });

    // Edit on double-click
    span.addEventListener("dblclick", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = todo.text;
      input.className = "edit-input";

      li.replaceChild(input, span);
      input.focus();

      function saveEdit() {
        const newValue = input.value.trim();
        if (newValue) {
          todos[index].text = newValue;
          saveTodos();
        }
        renderTodos();
      }

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit();
        if (e.key === "Escape") renderTodos();
      });

      input.addEventListener("blur", saveEdit);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// ---- Add Todo ----
function addItem() {
  const value = inputBox.value.trim();
  if (!value) return;

  todos.push({
    text: value,
    completed: false
  });

  saveTodos();
  renderTodos();
  inputBox.value = "";
}

// ---- Events ----
addBtn.addEventListener("click", addItem);

clearCompletedBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  renderTodos();
});

inputBox.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addItem();
  }
});

// Filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    renderTodos();
  });
});

// ---- Init ----
loadTodos();
renderTodos();
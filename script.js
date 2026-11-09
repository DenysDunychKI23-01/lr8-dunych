// -------------------------------------------------------------
// Глобальний стан додатку (Завдання 7: Збереження в LocalStorage)
// -------------------------------------------------------------
let tasks = JSON.parse(localStorage.getItem('todo_tasks_v8')) || [];
let currentFilter = 'all';
let currentSort = 'status';

// Елементи DOM
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sortSelect');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// Лічильники
const countAll = document.getElementById('countAll');
const countActive = document.getElementById('countActive');
const countCompleted = document.getElementById('countCompleted');

// -------------------------------------------------------------
// Ініціалізація та Події DOM
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderTasks();

  // Завдання 1: Додавання нового завдання при натисканні Enter
  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  });

  // Завдання 8: Фільтрація виконаних / невиконаних
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // Завдання 8: Сортування
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasks();
  });

  // Додатково: Очищення всіх виконаних
  clearCompletedBtn.addEventListener('click', clearCompletedTasks);
});

// -------------------------------------------------------------
// Завдання 1: Функція додавання нового завдання
// -------------------------------------------------------------
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  // Завдання 2: Форматована дата та час додавання (наприклад: 12.12.22, 16:09)
  const now = new Date();
  const formattedDate = formatDate(now);

  const newTask = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: formattedDate,
    timestamp: now.getTime()
  };

  tasks.unshift(newTask);
  saveTasks();
  taskInput.value = '';
  renderTasks();
}

// Форматування дати під вимогу завдання 2 (DD.MM.YY, HH:MM)
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

// -------------------------------------------------------------
// Завдання 7: Збереження стану в LocalStorage
// -------------------------------------------------------------
function saveTasks() {
  localStorage.setItem('todo_tasks_v8', JSON.stringify(tasks));
  updateCounters();
}

function updateCounters() {
  countAll.textContent = tasks.length;
  countActive.textContent = tasks.filter(t => !t.completed).length;
  countCompleted.textContent = tasks.filter(t => t.completed).length;
}

// -------------------------------------------------------------
// Завдання 4 & 5: Виконання, видалення та редагування
// -------------------------------------------------------------
function toggleTaskStatus(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

// -------------------------------------------------------------
// Завдання 6: Подвійний клік для редагування завдання
// -------------------------------------------------------------
function enableEditMode(taskItem, task) {
  if (task.completed) return; // Не редагуємо вже виконані завдання

  const taskContent = taskItem.querySelector('.task-content');
  const currentText = task.text;

  // Заміна пункту списку на <input> елемент
  taskContent.innerHTML = `
    <input type="text" class="edit-input" value="${escapeHtml(currentText)}">
    <span class="task-date"><i class="fa-regular fa-clock"></i> ${task.createdAt}</span>
  `;

  const editInput = taskContent.querySelector('.edit-input');
  editInput.focus();
  editInput.select();

  // Забереження зміненого тексту при натисканні Enter або втраті фокусу (blur)
  const handleSave = () => {
    const newText = editInput.value.trim();
    if (newText && newText !== currentText) {
      task.text = newText;
      saveTasks();
    }
    renderTasks();
  };

  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      renderTasks();
    }
  });

  editInput.addEventListener('blur', handleSave);
}

// -------------------------------------------------------------
// Завдання 8: Сортування та Рендеринг списку
// -------------------------------------------------------------
function getFilteredAndSortedTasks() {
  // 1. Фільтрація
  let result = tasks.filter(task => {
    if (currentFilter === 'active') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true;
  });

  // 2. Сортування (Завдання 8)
  result.sort((a, b) => {
    if (currentSort === 'status') {
      // Спочатку невиконані, потім виконані
      return a.completed === b.completed ? b.timestamp - a.timestamp : a.completed ? 1 : -1;
    } else if (currentSort === 'newest') {
      return b.timestamp - a.timestamp;
    } else if (currentSort === 'oldest') {
      return a.timestamp - b.timestamp;
    }
    return 0;
  });

  return result;
}

function renderTasks() {
  taskList.innerHTML = '';
  const filteredTasks = getFilteredAndSortedTasks();

  if (filteredTasks.length === 0) {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    // Завдання 3 та 4: Чекбокс (зникає у виконаних через CSS)
    const checkboxHtml = `<input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>`;

    // Завдання 2: Текст завдання та відформатована дата
    // Завдання 5: Хрестик для видалення праворуч
    li.innerHTML = `
      <div class="task-left">
        ${checkboxHtml}
        <div class="task-content">
          <span class="task-text">${escapeHtml(task.text)}</span>
          <span class="task-date"><i class="fa-regular fa-clock"></i> ${task.createdAt}</span>
        </div>
      </div>
      <button class="delete-btn" title="Видалити завдання">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    // Подія 1: Перемикання чекбокса
    const checkbox = li.querySelector('.task-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', () => toggleTaskStatus(task.id));
    }

    // Завдання 6: Подвійний клік (dblclick) по тексту для редагування
    const taskTextEl = li.querySelector('.task-text');
    taskTextEl.addEventListener('dblclick', () => enableEditMode(li, task));

    // Подія 2: Видалення при кліку на хрестик (Завдання 5)
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    taskList.appendChild(li);
  });

  updateCounters();
}

// Захист від XSS ін'єкцій
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

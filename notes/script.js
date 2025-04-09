let notes = [];
let currentNoteIndex = null;
let sortBy = "importance";
let sortDirection = "asc";
let filterImportance = "all";

// Назначение обработчиков событий
document.getElementById("add-note").addEventListener("click", () => {
  openModal();
});

document.getElementById("save-note").addEventListener("click", () => {
  saveNote();
});

document.getElementById("cancel-note").addEventListener("click", () => {
  closeModal();
});

document.getElementById("confirm-yes").addEventListener("click", () => {
  deleteNote(currentNoteIndex);
  closeConfirmModal();
});

document.getElementById("confirm-no").addEventListener("click", () => {
  closeConfirmModal();
});

// Назначение обработчиков для фильтров и сортировки
document.getElementById("sort-by").addEventListener("change", (e) => {
  sortBy = e.target.value;
  renderNotes();
});

document.getElementById("sort-direction").addEventListener("change", (e) => {
  sortDirection = e.target.value;
  renderNotes();
});

document.getElementById("filter-importance").addEventListener("change", (e) => {
  filterImportance = e.target.value;
  renderNotes();
});

document.querySelectorAll('input[name="status"]').forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    renderNotes();
  });
});

document.getElementById("search").addEventListener("input", (e) => {
  renderNotes(e.target.value);
});

/**
 * Получает список выбранных статусов из чекбоксов фильтрации
 * @returns {string[]} Массив выбранных статусов (active/completed/cancelled)
 */
function getSelectedStatuses() {
  const checkboxes = document.querySelectorAll('input[name="status"]:checked');
  return Array.from(checkboxes).map((cb) => cb.value);
}

/**
 * Открывает модальное окно для создания/редактирования заметки
 * @param {number|null} index - Индекс редактируемой заметки (null для новой заметки)
 */
function openModal(index = null) {
  const modal = document.getElementById("note-modal");
  const modalTitle = document.getElementById("modal-title");
  const noteText = document.getElementById("note-text");
  const noteImportance = document.getElementById("note-importance");
  const noteStatus = document.getElementById("note-status");

  if (index !== null) {
    modalTitle.textContent = "Редактировать заметку";
    noteText.value = notes[index].text;
    noteImportance.value = notes[index].importance;
    noteStatus.value = notes[index].status;
    currentNoteIndex = index;
  } else {
    modalTitle.textContent = "Новая заметка";
    noteText.value = "";
    noteImportance.value = "high";
    noteStatus.value = "active";
    currentNoteIndex = null;
  }

  modal.style.display = "flex";
}

/**
 * Закрывает модальное окно создания/редактирования заметки
 */
function closeModal() {
  const modal = document.getElementById("note-modal");
  modal.style.display = "none";
}

/**
 * Открывает модальное окно подтверждения удаления заметки
 * @param {number} index - Индекс удаляемой заметки
 */
function openConfirmModal(index) {
  const modal = document.getElementById("confirm-modal");
  currentNoteIndex = index;
  modal.style.display = "flex";
}

/**
 * Закрывает модальное окно подтверждения удаления
 */
function closeConfirmModal() {
  const modal = document.getElementById("confirm-modal");
  modal.style.display = "none";
}

/**
 * Сохраняет заметку (создает новую или обновляет существующую)
 */
function saveNote() {
  const noteText = document.getElementById("note-text").value;
  const noteImportance = document.getElementById("note-importance").value;
  const noteStatus = document.getElementById("note-status").value;

  if (noteText.trim() === "") {
    alert("Заметка не может быть пустой");
    return;
  }

  const note = {
    text: noteText,
    importance: noteImportance,
    status: noteStatus,
    time: new Date().toLocaleString(),
  };

  if (currentNoteIndex !== null) {
    notes[currentNoteIndex] = note;
  } else {
    notes.push(note);
  }

  closeModal();
  renderNotes();
}

/**
 * Удаляет заметку по индексу
 * @param {number} index - Индекс удаляемой заметки
 */
function deleteNote(index) {
  notes.splice(index, 1);
  renderNotes();
}

/**
 * Фильтрует заметки по поисковому запросу
 * @param {Object[]} notes - Массив заметок для фильтрации
 * @param {string} searchText - Текст для поиска
 * @returns {Object[]} Отфильтрованный массив заметок
 */
function filterNotesBySearch(notes, searchText) {
  if (!searchText) return notes;
  return notes.filter((note) =>
    note.text.toLowerCase().includes(searchText.toLowerCase())
  );
}

/**
 * Фильтрует заметки по важности
 * @param {Object[]} notes - Массив заметок для фильтрации
 * @returns {Object[]} Отфильтрованный массив заметок
 */
function filterNotesByImportance(notes) {
  if (filterImportance === "all") return notes;
  return notes.filter((note) => note.importance === filterImportance);
}

/**
 * Фильтрует заметки по выбранным статусам
 * @param {Object[]} notes - Массив заметок для фильтрации
 * @returns {Object[]} Отфильтрованный массив заметок
 */
function filterNotesByStatus(notes) {
  const selectedStatuses = getSelectedStatuses();
  if (selectedStatuses.length === 0) return notes;
  return notes.filter((note) => selectedStatuses.includes(note.status));
}

/**
 * Сортирует заметки по выбранному критерию и направлению
 * @param {Object[]} notes - Массив заметок для сортировки
 * @returns {Object[]} Отсортированный массив заметок
 */
function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (sortBy === "importance") {
      const importanceOrder = { high: 3, medium: 2, low: 1 };
      return sortDirection === "asc"
        ? importanceOrder[a.importance] - importanceOrder[b.importance]
        : importanceOrder[b.importance] - importanceOrder[a.importance];
    }

    if (sortBy === "status") {
      const statusOrder = { active: 3, completed: 2, cancelled: 1 };
      return sortDirection === "asc"
        ? statusOrder[a.status] - statusOrder[b.status]
        : statusOrder[b.status] - statusOrder[a.status];
    }

    // Сортировка по времени
    return sortDirection === "asc"
      ? new Date(a.time) - new Date(b.time)
      : new Date(b.time) - new Date(a.time);
  });
}

/**
 * Создает DOM-элемент для отображения заметки
 * @param {Object} note - Объект заметки
 * @param {number} index - Индекс заметки в массиве
 * @returns {HTMLElement} Созданный элемент заметки
 */
function createNoteElement(note, index) {
  const noteElement = document.createElement("div");
  noteElement.classList.add("note", note.importance);
  noteElement.innerHTML = `
      <div>${note.text}</div>
      <div class="time">Создано: ${note.time}</div>
      <div class="status ${note.status}">${note.status}</div>
      <button onclick="openModal(${index})">Редактировать</button>
      <button onclick="openConfirmModal(${index})">Удалить</button>
  `;
  return noteElement;
}

/**
 * Отрисовывает заметки на странице с учетом всех фильтров и сортировки
 * @param {string} [searchText=''] - Текст для поиска (по умолчанию пустая строка)
 */
function renderNotes(searchText = "") {
  const notesList = document.getElementById("notes-list");
  notesList.innerHTML = "";

  // Пошаговая фильтрация и сортировка
  let filteredNotes = filterNotesBySearch(notes, searchText);
  filteredNotes = filterNotesByImportance(filteredNotes);
  filteredNotes = filterNotesByStatus(filteredNotes);
  const sortedNotes = sortNotes(filteredNotes);

  // Создание и добавление заметок
  sortedNotes.forEach((note, index) => {
    notesList.appendChild(createNoteElement(note, index));
  });
}

document.querySelector(".close").addEventListener("click", closeModal);

window.addEventListener("click", (e) => {
  const modal = document.getElementById("note-modal");
  const confirmModal = document.getElementById("confirm-modal");
  if (e.target === modal) {
    closeModal();
  }
  if (e.target === confirmModal) {
    closeConfirmModal();
  }
});

// Первоначальная отрисовка заметок
renderNotes();

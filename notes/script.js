let notes = [];
let currentNoteIndex = null;
let sortBy = "importance";
let sortDirection = "asc";
let filterImportance = "0";

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
 * @returns {number[]} Массив выбранных статусов (3/2/1)
 */
function getSelectedStatuses() {
  const checkboxes = document.querySelectorAll('input[name="status"]:checked');
  return Array.from(checkboxes).map((cb) => parseInt(cb.value));
}

/**
 * Открывает модальное окно для создания/редактирования заметки
 * @param {number | null} index - индекс редактируемой заметки (null для новой заметки)
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
    noteImportance.value = "3"; // Высокая важность по умолчанию
    noteStatus.value = "3"; // Активный статус по умолчанию
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
 * @param {number} index - индекс удаляемой заметки
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
  const noteImportance = parseInt(document.getElementById("note-importance").value);
  const noteStatus = parseInt(document.getElementById("note-status").value);

  if (!noteText.trim().length) {
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
 * @param {number} index - индекс удаляемой заметки
 */
function deleteNote(index) {
  notes.splice(index, 1);
  renderNotes();
}


/**
 * Фильтрует заметки по поисковому запросу
 */
function filterNotesBySearch(notes, searchText) {
  if (!searchText) return notes;
  return notes.filter((note) =>
    note.text.toLowerCase().includes(searchText.toLowerCase())
  );
}

/**
 * Фильтрует заметки по важности
 */
function filterNotesByImportance(notes) {
  if (filterImportance === "0") return notes;
  return notes.filter((note) => note.importance.toString() === filterImportance);
}

/**
 * Фильтрует заметки по выбранным статусам
 */
function filterNotesByStatus(notes) {
  const selectedStatuses = getSelectedStatuses();
  if (selectedStatuses.length === 0) return notes;
  return notes.filter((note) => selectedStatuses.includes(note.status));
}

/**
 * Сортирует заметки по выбранному критерию и направлению
 */
function sortNotes(notes) {
  return [...notes].sort((a, b) => {
    if (sortBy === "importance") {
      return sortDirection === "asc"
        ? a.importance - b.importance
        : b.importance - a.importance;
    }

    if (sortBy === "status") {
      return sortDirection === "asc"
        ? a.status - b.status
        : b.status - a.status;
    }

    // Сортировка по времени
    return sortDirection === "asc"
      ? new Date(a.time) - new Date(b.time)
      : new Date(b.time) - new Date(a.time);
  });
}

/**
 * Преобразует код важности в CSS-класс
 */
function getImportanceClass(importance) {
  switch(importance) {
    case 3: return 'high';
    case 2: return 'medium';
    case 1: return 'low';
    default: return '';
  }
}

/**
 * Преобразует код статуса в CSS-класс и текст
 */
function getStatusInfo(status) {
  switch(status) {
    case 3: return { class: 'active', text: 'Активная' };
    case 2: return { class: 'completed', text: 'Завершённая' };
    case 1: return { class: 'cancelled', text: 'Отменённая' };
    default: return { class: '', text: '' };
  }
}

/**
 * Создает DOM-элемент для отображения заметки
 */
function createNoteElement(note, index) {
  const noteElement = document.createElement("div");
  const importanceClass = getImportanceClass(note.importance);
  const statusInfo = getStatusInfo(note.status);

  noteElement.classList.add("note", importanceClass);
  noteElement.innerHTML = `
      <div>${note.text}</div>
      <div class="time">Создано: ${note.time}</div>
      <div class="status ${statusInfo.class}">${statusInfo.text}</div>
      <button onclick="openModal(${index})">Редактировать</button>
      <button onclick="openConfirmModal(${index})">Удалить</button>
  `;
  return noteElement;
}

/**
 * Отрисовывает заметки на странице
 */
function renderNotes(searchText = "") {
  const notesList = document.getElementById("notes-list");
  notesList.innerHTML = "";

  let filteredNotes = filterNotesBySearch(notes, searchText);
  filteredNotes = filterNotesByImportance(filteredNotes);
  filteredNotes = filterNotesByStatus(filteredNotes);
  const sortedNotes = sortNotes(filteredNotes);

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

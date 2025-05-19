let notes = [];
let currentNoteId = null;
let sortBy = "importance";
let sortDirection = "asc";
let filterImportance = "0";

const API_URL = 'http://localhost:3000/items';

/**
 * Выполняет HTTP-запрос к API
 * @async
 * @param {string} url - URL для запроса
 * @param {string} [method='GET'] - HTTP метод (GET, POST, PUT, DELETE)
 * @param {Object|null} [data=null] - Данные для отправки
 * @returns {Promise<Object>} Ответ сервера в формате JSON
 * @throws {Error} Ошибка при выполнении запроса
 */
async function fetchData(url, method = 'GET', data = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

/**
 * Загружает заметки с сервера и отображает их
 * @async
 * @returns {Promise<void>}
 */
async function loadNotes() {
  try {
    notes = await fetchData(API_URL);
    renderNotes();
  } catch (error) {
    console.error('Ошибка при загрузке заметок:', error);
    // Можно добавить уведомление для пользователя
  }
}

// Назначение обработчиков событий
document.getElementById("add-note").addEventListener("click", () => {
  openModal();
});

document.getElementById("save-note").addEventListener("click", async () => {
  await saveNote();
});

document.getElementById("cancel-note").addEventListener("click", () => {
  closeModal();
});

document.getElementById("confirm-yes").addEventListener("click", async () => {
  await deleteNote(currentNoteId);
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
 * @param {number|null} id - ID редактируемой заметки (null для новой заметки)
 */
function openModal(id = null) {
  const modal = document.getElementById("note-modal");
  const modalTitle = document.getElementById("modal-title");
  const noteText = document.getElementById("note-text");
  const noteImportance = document.getElementById("note-importance");
  const noteStatus = document.getElementById("note-status");

if (id !== null) {
  const note = notes.find(n => n.id === id);
  if (note) {
    modalTitle.textContent = "Редактировать заметку";
    noteText.value = note.text;
    noteImportance.value = note.importance;
    noteStatus.value = note.status;
    currentNoteId = id;
  }
  } else {
    modalTitle.textContent = "Новая заметка";
    noteText.value = "";
    noteImportance.value = "3";
    noteStatus.value = "3";
    currentNoteId = null;
  }

  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("note-modal");
  modal.style.display = "none";
}


/**
 * Открывает модальное окно подтверждения удаления заметки
 * @param {number} id - ID удаляемой заметки
 */
function openConfirmModal(id) {
  const modal = document.getElementById("confirm-modal");
  currentNoteId = id;
  modal.style.display = "flex";
}

function closeConfirmModal() {
  const modal = document.getElementById("confirm-modal");
  modal.style.display = "none";
}

/**
 * Сохраняет заметку на сервере (создает новую или обновляет существующую)
 * @async
 * @returns {Promise<void>}
 */
async function saveNote() {
  const noteText = document.getElementById("note-text").value;
  const noteImportance = parseInt(document.getElementById("note-importance").value);
  const noteStatus = parseInt(document.getElementById("note-status").value);

  if (!noteText.trim().length) {
    alert("Заметка не может быть пустой");
    return;
  }

  const noteData = {
    text: noteText,
    importance: noteImportance,
    status: noteStatus,
    time: new Date().toLocaleString(),
  };

  try {
    if (currentNoteId !== null) {
      // Обновление существующей заметки
      await fetchData(`${API_URL}/${currentNoteId}`, 'PUT', noteData);
    } else {
      // Создание новой заметки
      await fetchData(API_URL, 'POST', noteData);
    }
    
    closeModal();
    await loadNotes(); // Перезагружаем заметки после сохранения
  } catch (error) {
    console.error('Ошибка при сохранении заметки:', error);
    alert('Не удалось сохранить заметку');
  }
}

/**
 * Удаляет заметку с сервера по ID
 * @async
 * @param {number} id - ID удаляемой заметки
 * @returns {Promise<void>}
 */
async function deleteNote(id) {
  try {
    await fetchData(`${API_URL}/${id}`, 'DELETE');
    await loadNotes(); // Перезагружаем заметки после удаления
  } catch (error) {
    console.error('Ошибка при удалении заметки:', error);
    alert('Не удалось удалить заметку');
  }
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
    <button onclick="openModal(${note.id})">Редактировать</button>
    <button onclick="openConfirmModal(${note.id})">Удалить</button>
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

// Загружаем заметки при загрузке страницы
document.addEventListener('DOMContentLoaded', loadNotes);

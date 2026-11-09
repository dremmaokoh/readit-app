/**
 * ============================================================================
 * ReadIT — Material Design 3 Book Tracker Controller
 * Vanilla JavaScript with Web Storage (localStorage) Persistence
 * ============================================================================
 */

// Storage Key
const STORAGE_KEY = 'readit_books_data';

// Default Seed Data
const defaultLibrary = [
  {
    id: 'book-1',
    title: 'Atomic Habits',
    author: 'James Clear',
    status: 'Read',
    createdAt: Date.now() - 3600000 * 24 * 7
  },
  {
    id: 'book-2',
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    status: 'Read',
    createdAt: Date.now() - 3600000 * 24 * 3
  },
  {
    id: 'book-3',
    title: 'Deep Work',
    author: 'Cal Newport',
    status: 'Not Read',
    createdAt: Date.now() - 3600000 * 24
  }
];

// App State
let books = [];
let searchQuery = '';
let activeStatusFilter = 'all'; // 'all' | 'Read' | 'Not Read'
let pendingDeleteId = null;
let isCompactView = false;
let snackbarTimer = null;

// DOM Elements
const bookForm = document.getElementById('bookForm');
const editBookId = document.getElementById('editBookId');
const bookTitle = document.getElementById('bookTitle');
const bookAuthor = document.getElementById('bookAuthor');
const bookStatus = document.getElementById('bookStatus');
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const submitBtn = document.getElementById('submitBtn');
const submitBtnText = document.getElementById('submitBtnText');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const formHeaderIcon = document.getElementById('formHeaderIcon');

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const resetSearchBtn = document.getElementById('resetSearchBtn');
const filterChips = document.querySelectorAll('.filter-chips-row .chip');
const activeFilterNote = document.getElementById('activeFilterNote');

const booksList = document.getElementById('booksList');
const emptyState = document.getElementById('emptyState');
const noResultsState = document.getElementById('noResultsState');

const totalCount = document.getElementById('totalCount');
const readCount = document.getElementById('readCount');
const unreadCount = document.getElementById('unreadCount');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const segmentedBtns = document.querySelectorAll('.segmented-btn');

// Dialog Elements
const deleteDialogScrim = document.getElementById('deleteDialogScrim');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const dialogDesc = document.getElementById('dialogDesc');

// Snackbar Elements
const snackbar = document.getElementById('snackbar');
const snackbarText = document.getElementById('snackbarText');
const snackbarIcon = document.getElementById('snackbarIcon');

/* ── Lifecycle & Initialization ─────────────────────────────────────────── */
function init() {
  loadBooks();
  bindEvents();
  render();
}

/* ── Storage ────────────────────────────────────────────────────────────── */
function loadBooks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    try {
      books = JSON.parse(saved);
    } catch (e) {
      books = [...defaultLibrary];
      saveBooks();
    }
  } else {
    books = [...defaultLibrary];
    saveBooks();
  }
}

function saveBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

/* ── Metrics ────────────────────────────────────────────────────────────── */
function updateMetrics() {
  const total = books.length;
  const read = books.filter(b => b.status === 'Read').length;
  const unread = total - read;

  totalCount.textContent = total;
  readCount.textContent = read;
  unreadCount.textContent = unread;
}

/* ── Segmented Button (Status selector in Form) ─────────────────────────── */
function setFormStatus(status) {
  bookStatus.value = status;
  segmentedBtns.forEach(btn => {
    const isTarget = btn.getAttribute('data-status') === status;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-checked', isTarget ? 'true' : 'false');
  });
}

/* ── Render Function ────────────────────────────────────────────────────── */
function render() {
  updateMetrics();

  const query = searchQuery.trim().toLowerCase();

  // Filter by search & active status chip
  const filtered = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query);

    const matchesStatus = 
      activeStatusFilter === 'all' || 
      book.status === activeStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Update Section Note
  if (activeStatusFilter === 'all') {
    activeFilterNote.textContent = query ? `Filtered results` : `Showing all (${books.length})`;
  } else {
    activeFilterNote.textContent = `Showing ${activeStatusFilter.toLowerCase()} books (${filtered.length})`;
  }

  // Handle Empty States
  if (books.length === 0) {
    booksList.innerHTML = '';
    emptyState.style.display = 'block';
    noResultsState.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';

  if (filtered.length === 0) {
    booksList.innerHTML = '';
    noResultsState.style.display = 'block';
    return;
  }

  noResultsState.style.display = 'none';

  // Render Material Cards
  booksList.innerHTML = filtered.map(book => {
    const isRead = book.status === 'Read';
    const cardClass = isRead ? 'is-read' : 'is-unread';
    const badgeClass = isRead ? 'badge-read' : 'badge-unread';
    const badgeIcon = isRead ? 'check_circle' : 'schedule';
    const toggleIcon = isRead ? 'history' : 'done';
    const toggleText = isRead ? 'Mark as Unread' : 'Mark as Read';

    return `
      <article class="book-card ${cardClass}" data-id="${escapeHtml(book.id)}">
        <div class="book-main-content">
          <div class="book-cover-avatar" aria-hidden="true">
            <span class="material-symbols-outlined">${isRead ? 'done_outline' : 'menu_book'}</span>
          </div>
          <div class="book-text-info">
            <h3 class="book-item-title">${escapeHtml(book.title)}</h3>
            <p class="book-item-author">
              <span class="material-symbols-outlined" style="font-size:16px;">edit_note</span>
              ${escapeHtml(book.author)}
            </p>
            <div class="book-badge-wrapper">
              <span class="m3-badge ${badgeClass}">
                <span class="material-symbols-outlined">${badgeIcon}</span>
                ${escapeHtml(book.status)}
              </span>
            </div>
          </div>
        </div>

        <div class="book-card-actions">
          <button type="button" class="m3-assist-btn" onclick="toggleBookStatus('${book.id}')" title="Toggle status">
            <span class="material-symbols-outlined">${toggleIcon}</span>
            <span>${toggleText}</span>
          </button>
          <button type="button" class="m3-assist-btn" onclick="startEditBook('${book.id}')" title="Edit book">
            <span class="material-symbols-outlined">edit</span>
            <span>Edit</span>
          </button>
          <button type="button" class="m3-assist-btn delete" onclick="openDeleteDialog('${book.id}')" title="Delete book">
            <span class="material-symbols-outlined">delete</span>
            <span>Delete</span>
          </button>
        </div>
      </article>
    `;
  }).join('');
}

/* ── Form Actions (Add & Edit) ─────────────────────────────────────────── */
function handleFormSubmit(e) {
  e.preventDefault();

  const title = bookTitle.value.trim();
  const author = bookAuthor.value.trim();
  const status = bookStatus.value;
  const editId = editBookId.value;

  if (!title || !author) {
    showSnackbar('Please fill in both title and author.', 'warning');
    if (!title) bookTitle.focus();
    else bookAuthor.focus();
    return;
  }

  if (editId) {
    // Update existing book
    const index = books.findIndex(b => b.id === editId);
    if (index !== -1) {
      books[index] = {
        ...books[index],
        title,
        author,
        status
      };
      showSnackbar(`Updated "${title}"`, 'check_circle');
    }
    resetForm();
  } else {
    // Add new book
    const newBook = {
      id: 'book-' + Date.now(),
      title,
      author,
      status,
      createdAt: Date.now()
    };
    books.unshift(newBook);
    showSnackbar(`Added "${title}" to your library`, 'bookmark_added');
    resetForm();
  }

  saveBooks();
  render();
}

window.startEditBook = function(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  editBookId.value = book.id;
  bookTitle.value = book.title;
  bookAuthor.value = book.author;
  setFormStatus(book.status);

  // Update Form UI for Edit Mode
  formTitle.textContent = 'Edit Book';
  formSubtitle.textContent = `Update details for "${book.title}"`;
  submitBtnText.textContent = 'Save Changes';
  submitBtn.querySelector('.btn-icon').textContent = 'save';
  cancelEditBtn.style.display = 'inline-flex';
  formHeaderIcon.style.backgroundColor = 'var(--md-sys-color-secondary-container)';
  formHeaderIcon.style.color = 'var(--md-sys-color-on-secondary-container)';

  // Smooth scroll into view and focus
  bookForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  bookTitle.focus();
};

function resetForm() {
  editBookId.value = '';
  bookForm.reset();
  setFormStatus('Not Read');

  formTitle.textContent = 'Add Book';
  formSubtitle.textContent = 'Enter the title, author and status of your book';
  submitBtnText.textContent = 'Add Book';
  submitBtn.querySelector('.btn-icon').textContent = 'add';
  cancelEditBtn.style.display = 'none';
  formHeaderIcon.style.backgroundColor = 'var(--md-sys-color-primary-container)';
  formHeaderIcon.style.color = 'var(--md-sys-color-on-primary-container)';
}

/* ── Toggle Read Status ─────────────────────────────────────────────────── */
window.toggleBookStatus = function(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  book.status = book.status === 'Read' ? 'Not Read' : 'Read';

  // If this book is open in edit mode, sync the form status
  if (editBookId.value === id) {
    setFormStatus(book.status);
  }

  saveBooks();
  render();
  showSnackbar(`"${book.title}" marked as ${book.status}`, 'sync');
};

/* ── M3 Delete Confirmation Dialog ─────────────────────────────────────── */
window.openDeleteDialog = function(id) {
  const book = books.find(b => b.id === id);
  if (!book) return;

  pendingDeleteId = id;
  dialogDesc.textContent = `Are you sure you want to remove "${book.title}" by ${book.author}? This action cannot be undone.`;
  deleteDialogScrim.classList.add('open');
  deleteDialogScrim.setAttribute('aria-hidden', 'false');
};

function closeDeleteDialog() {
  pendingDeleteId = null;
  deleteDialogScrim.classList.remove('open');
  deleteDialogScrim.setAttribute('aria-hidden', 'true');
}

function confirmDelete() {
  if (!pendingDeleteId) return;

  const targetId = pendingDeleteId;
  const book = books.find(b => b.id === targetId);
  const bookTitleText = book ? book.title : 'Book';

  // If the book being deleted is currently in the edit form, reset form
  if (editBookId.value === targetId) {
    resetForm();
  }

  books = books.filter(b => b.id !== targetId);
  saveBooks();
  closeDeleteDialog();
  render();

  showSnackbar(`Deleted "${bookTitleText}"`, 'delete_forever');
}

/* ── M3 Snackbar (Toast) ────────────────────────────────────────────────── */
function showSnackbar(message, iconName = 'info') {
  if (snackbarTimer) {
    clearTimeout(snackbarTimer);
  }

  snackbarText.textContent = message;
  snackbarIcon.textContent = iconName;
  snackbar.classList.add('show');

  snackbarTimer = setTimeout(() => {
    snackbar.classList.remove('show');
  }, 3200);
}

/* ── Security / HTML Escaping ───────────────────────────────────────────── */
function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Event Bindings ─────────────────────────────────────────────────────── */
function bindEvents() {
  // Form submit & cancel
  bookForm.addEventListener('submit', handleFormSubmit);
  cancelEditBtn.addEventListener('click', resetForm);

  // Status segmented button selector
  segmentedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setFormStatus(btn.getAttribute('data-status'));
    });
  });

  // Search input & clear
  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
    render();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    searchInput.focus();
    render();
  });

  resetSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    activeStatusFilter = 'all';
    updateFilterChipUI();
    render();
  });

  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      activeStatusFilter = chip.getAttribute('data-filter');
      updateFilterChipUI();
      render();
    });
  });

  // Delete dialog events
  cancelDeleteBtn.addEventListener('click', closeDeleteDialog);
  confirmDeleteBtn.addEventListener('click', confirmDelete);

  deleteDialogScrim.addEventListener('click', e => {
    if (e.target === deleteDialogScrim) {
      closeDeleteDialog();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && deleteDialogScrim.classList.contains('open')) {
      closeDeleteDialog();
    }
  });

  // Compact layout toggle
  themeToggleBtn.addEventListener('click', () => {
    isCompactView = !isCompactView;
    booksList.classList.toggle('compact', isCompactView);
    themeToggleBtn.querySelector('.material-symbols-outlined').textContent = 
      isCompactView ? 'view_list' : 'view_agenda';
    showSnackbar(isCompactView ? 'Switched to grid view' : 'Switched to list view', 'grid_view');
  });
}

function updateFilterChipUI() {
  filterChips.forEach(c => {
    const isSelected = c.getAttribute('data-filter') === activeStatusFilter;
    c.classList.toggle('active', isSelected);
    const checkIcon = c.querySelector('.chip-check');
    if (checkIcon) {
      checkIcon.style.display = isSelected ? 'inline-block' : 'none';
    }
  });
}

// Kick off when DOM is ready
document.addEventListener('DOMContentLoaded', init);

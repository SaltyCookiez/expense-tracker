// public/js/categories.js
// Categories page: list + add + edit + delete (name & type only)

import i18n from './i18n.js';
import { ApiService } from './api.js';

const api = new ApiService();

let _render;
let _editingId = null;

/** Build a table row for a category (no color/icon) */
function rowHTML(cat) {
  const editLabel = i18n.t('edit') || 'Edit';
  const delLabel  = i18n.t('delete') || 'Delete';
  return `
    <tr data-id="${cat.id}">
      <td>${cat.name || ''}</td>
      <td class="text-capitalize">${cat.type || ''}</td>
      <td class="text-end">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-secondary" data-action="edit">${editLabel}</button>
          <button class="btn btn-outline-danger" data-action="delete">${delLabel}</button>
        </div>
      </td>
    </tr>
  `;
}

/** Render the categories table from state */
function renderTable(state) {
  const tbody = document.querySelector('#categoriesTable tbody');
  if (!tbody) return;

  const list = Array.isArray(state.categories) ? state.categories : [];

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="3" class="text-center text-muted">
          ${i18n.t('noResults') || 'No results found'}
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = list.map(rowHTML).join('');
}

/** Open modal in Add mode */
function openAddModal(modalEl) {
  _editingId = null;
  modalEl.querySelector('#categoryModalLabel').textContent =
    i18n.t('addCategory') || 'Add Category';
  const submitBtn = modalEl.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = i18n.t('save') || 'Save';

  const form = modalEl.querySelector('#categoryForm');
  if (form) form.reset();

  // defaults
  const typeEl = modalEl.querySelector('#type');
  if (typeEl) typeEl.value = 'expense';
}

/** Open modal in Edit mode, prefill by id */
function openEditModal(modalEl, state, catId) {
  const cat = (state.categories || []).find(c => String(c.id) === String(catId));
  if (!cat) return;

  _editingId = cat.id;

  modalEl.querySelector('#categoryModalLabel').textContent =
    i18n.t('editCategory') || 'Edit Category';
  const submitBtn = modalEl.querySelector('button[type="submit"]');
  if (submitBtn) submitBtn.textContent = i18n.t('saveChanges') || i18n.t('save') || 'Save';

  // fill fields
  const nameEl = modalEl.querySelector('#name');
  const typeEl = modalEl.querySelector('#type');

  if (nameEl) nameEl.value = cat.name || '';
  if (typeEl) typeEl.value = cat.type || 'expense';

  const instance = window.bootstrap.Modal.getOrCreateInstance(modalEl);
  instance.show();
}

/** Validate form and build payload (name + type only) */
function readForm(modalEl) {
  const nameEl = modalEl.querySelector('#name');
  const typeEl = modalEl.querySelector('#type');

  const name = (nameEl?.value || '').trim();
  const type = typeEl?.value;

  if (!name) {
    alert(i18n.t('error.required') || 'This field is required');
    nameEl?.focus();
    return null;
  }
  if (!type) {
    alert(i18n.t('error.invalidType') || 'Please select a valid type');
    typeEl?.focus();
    return null;
  }

  // Only name & type
  return { name, type };
}

/** Public entry for the page */
export async function initCategories() {
  const app = (window.app ||= {});
  const state = (app.state ||= { categories: [], transactions: [], settings: {} });

  // Load categories if needed
  try {
    if (!state.categories?.length) {
      state.categories = await api.getCategories();
    }
  } catch (e) {
    console.warn('Failed to load categories via API.', e);
  }

  _render = () => renderTable(state);
  _render();

  // Re-render when language changes (button labels)
  i18n.onLanguageChange(() => _render());

  // Table actions (Edit/Delete)
  const tbody = document.querySelector('#categoriesTable tbody');
  const categoryModalEl = document.getElementById('categoryModal');
  const deleteModalEl = document.getElementById('deleteCategoryModal');

  if (tbody) {
    tbody.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const tr = btn.closest('tr');
      const id = tr?.getAttribute('data-id');
      const action = btn.getAttribute('data-action');

      if (action === 'edit') {
        if (categoryModalEl) openEditModal(categoryModalEl, state, id);
        return;
      }

      if (action === 'delete') {
        if (!deleteModalEl) return;
        const confirmBtn = deleteModalEl.querySelector('#confirmDelete');
        const instance = window.bootstrap.Modal.getOrCreateInstance(deleteModalEl);
        instance.show();

        const handler = async () => {
          confirmBtn.removeEventListener('click', handler);
          try {
            await api.deleteCategory(id);
            state.categories = (state.categories || []).filter(c => String(c.id) !== String(id));
            _render();
          } catch (err) {
            console.error(err);
            alert(i18n.t('error.deleteCategory') || 'Failed to delete category');
          } finally {
            instance.hide();
          }
        };
        confirmBtn.addEventListener('click', handler);
      }
    });
  }

  // Add button → Add modal
  const addBtn = document.getElementById('addCategoryBtn');
  if (addBtn && categoryModalEl) {
    addBtn.addEventListener('click', () => openAddModal(categoryModalEl));
  }

  // Modal submit (Add or Edit)
  if (categoryModalEl) {
    const form = categoryModalEl.querySelector('#categoryForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = readForm(categoryModalEl);
        if (!data) return;

        try {
          if (_editingId) {
            // UPDATE
            if (typeof api.updateCategory === 'function') {
              const updated = await api.updateCategory(_editingId, data);
              // apply to state (prefer server response)
              state.categories = state.categories.map(c =>
                String(c.id) === String(_editingId) ? { ...c, ...(updated || data) } : c
              );
            } else {
              // fallback if API lacks update: replace locally
              state.categories = state.categories.map(c =>
                String(c.id) === String(_editingId) ? { ...c, ...data } : c
              );
            }
          } else {
            // ADD
            const saved = await api.addCategory(data);
            const item = saved || { ...data, id: crypto.randomUUID ? crypto.randomUUID() : Date.now() };
            state.categories = [...(state.categories || []), item];
          }

          _render();

          const m = window.bootstrap.Modal.getOrCreateInstance(categoryModalEl);
          m.hide();
          form.reset();
          _editingId = null;
        } catch (err) {
          console.error('Save category failed:', err);
          alert(i18n.t('error.saveSettings') || 'Failed to save category');
        }
      });
    }
  }
}

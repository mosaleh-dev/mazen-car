import {
  checkAdminLogin,
  setupAdminLayoutListeners,
  showToast,
  validateForm,
  resetFormValidation,
} from '../utils/helpers.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../modules/users.js';

let userFormModalInstance = null;
let deleteConfirmModalInstance = null;
let userToDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
  checkAdminLogin();
  setupAdminLayoutListeners();

  const userFormModalEl = document.getElementById('userFormModal');
  if (userFormModalEl) {
    userFormModalInstance = new bootstrap.Modal(userFormModalEl);
    userFormModalEl.addEventListener('hidden.bs.modal', () => {
      resetUserForm();
    });
  }

  const deleteConfirmModalEl = document.getElementById(
    'deleteUserConfirmModal'
  );
  if (deleteConfirmModalEl) {
    deleteConfirmModalInstance = new bootstrap.Modal(deleteConfirmModalEl);
  }

  document
    .getElementById('user-form')
    ?.addEventListener('submit', handleUserFormSubmit);
  document
    .getElementById('users-table-body')
    ?.addEventListener('click', handleTableActionClick);
  document
    .getElementById('confirmDeleteUserButton')
    ?.addEventListener('click', handleConfirmDelete);

  loadUsersTable();
});

function loadUsersTable() {
  const tableBody = document.getElementById('users-table-body');
  const noUsersMessage = document.getElementById('no-users-message');
  if (!tableBody || !noUsersMessage) return;

  const users = getUsers();
  tableBody.innerHTML = '';

  if (users.length === 0) {
    noUsersMessage.classList.remove('d-none');
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No users found.</td></tr>`;
    return;
  }

  noUsersMessage.classList.add('d-none');
  const fragment = document.createDocumentFragment();

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${user.id ? user.id.substring(0, 8) : 'N/A'}...</td>
            <td>${user.firstName || ''} ${user.lastName || ''} ${user.isAdmin ? '<span class="badge bg-info ms-1">Admin</span>' : ''}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.phoneNumber || 'N/A'}</td>
            <td class="text-center">
                <div class="form-check form-switch d-inline-block">
                    <input class="form-check-input verified-toggle" type="checkbox" role="switch" data-id="${user.id}" ${user.verified ? 'checked' : ''} title="Toggle Verified Status">
                </div>
            </td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-info edit-button" data-id="${user.id}" title="Edit User">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-button" data-id="${user.id}" data-info="${user.firstName || ''} ${user.lastName || ''} (${user.email || 'N/A'})" title="Delete User" ${user.isAdmin ? 'disabled' : ''}> <!-- Prevent deleting admin -->
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
    fragment.appendChild(row);
  });

  tableBody.appendChild(fragment);
}

function handleTableActionClick(event) {
  const target = event.target;
  if (!target) return;

  const userId = target.getAttribute('data-id');

  if (target.classList.contains('edit-button')) {
    const buttonUserId = target.closest('button')?.getAttribute('data-id');
    if (buttonUserId) handleEditUserClick(buttonUserId);
  } else if (target.classList.contains('delete-button')) {
    const button = target.closest('button');
    const buttonUserId = button?.getAttribute('data-id');
    const userInfo = button?.getAttribute('data-info');
    if (buttonUserId && !button.disabled)
      handleDeleteUserClick(buttonUserId, userInfo);
  } else if (target.classList.contains('verified-toggle')) {
    if (userId) handleToggleVerifiedClick(userId, target.checked);
  }
}

function handleEditUserClick(userId) {
  const user = getUserById(userId);
  if (!user || !userFormModalInstance) return;

  resetUserForm();

  document.getElementById('userId').value = user.id;
  document.getElementById('userFirstName').value = user.firstName || '';
  document.getElementById('userLastName').value = user.lastName || '';
  document.getElementById('userEmail').value = user.email || '';
  document.getElementById('userPhone').value = user.phoneNumber || '';
  document.getElementById('userVerified').checked = user.verified === true;

  document.getElementById('userFormModalLabel').textContent = 'Edit User';
  document.getElementById('saveUserButton').textContent = 'Save Changes';

  userFormModalInstance.show();
}

function handleUserFormSubmit(event) {
  event.preventDefault();
  event.stopPropagation();

  const form = event.target;
  if (!validateForm(form) || !userFormModalInstance) {
    showToast(
      'Please fill in all required fields correctly.',
      'warning',
      'admin-toast'
    );
    return;
  }

  const userData = {
    id: document.getElementById('userId').value,
    firstName: document.getElementById('userFirstName').value.trim(),
    lastName: document.getElementById('userLastName').value.trim(),
    email: document.getElementById('userEmail').value.trim(),
    phoneNumber: document.getElementById('userPhone').value.trim(),
    verified: document.getElementById('userVerified').checked,
    // Intentionally not including password, nationalId, isAdmin from the form
  };

  if (!userData.id) {
    showToast('Cannot update user without an ID.', 'error', 'admin-toast');
    return;
  }

  try {
    const updated = updateUser(userData);
    if (updated) {
      showToast(
        `User "${updated.firstName} ${updated.lastName}" updated successfully.`,
        'success',
        'admin-toast'
      );
      userFormModalInstance.hide();
      loadUsersTable();
    } else {
      showToast(
        'Failed to update user. User not found?',
        'error',
        'admin-toast'
      );
    }
  } catch (error) {
    console.error('Error saving user:', error);
    showToast(`Error saving user: ${error.message}`, 'error', 'admin-toast');
  }
}

function handleToggleVerifiedClick(userId, isChecked) {
  if (!userId) return;

  try {
    const updated = updateUser({ id: userId, verified: isChecked });
    if (updated) {
      showToast(
        `User ${userId.substring(0, 8)}... verified status set to ${isChecked}.`,
        'success',
        'admin-toast'
      );
    } else {
      showToast(
        'Failed to update verification status.',
        'error',
        'admin-toast'
      );
      const checkbox = document.querySelector(
        `.verified-toggle[data-id="${userId}"]`
      );
      if (checkbox) checkbox.checked = !isChecked;
    }
  } catch (error) {
    console.error('Error toggling verification:', error);
    showToast(`Error: ${error.message}`, 'error', 'admin-toast');
    const checkbox = document.querySelector(
      `.verified-toggle[data-id="${userId}"]`
    );
    if (checkbox) checkbox.checked = !isChecked;
  }
}

function handleDeleteUserClick(userId, userInfo) {
  if (!userId) return;
  const user = getUserById(userId);
  if (user && user.isAdmin) {
    showToast('Cannot delete an admin user.', 'warning', 'admin-toast');
    return;
  }

  userToDeleteId = userId;
  document.getElementById('deleteUserInfo').textContent =
    userInfo || 'this user';
  if (deleteConfirmModalInstance) deleteConfirmModalInstance.show();
}

function handleConfirmDelete() {
  if (!userToDeleteId || !deleteConfirmModalInstance) return;

  const user = getUserById(userToDeleteId);
  if (user && user.isAdmin) {
    showToast('Cannot delete an admin user.', 'error', 'admin-toast');
    deleteConfirmModalInstance.hide();
    userToDeleteId = null;
    return;
  }

  try {
    const success = deleteUser(userToDeleteId);
    if (success) {
      showToast('User deleted successfully.', 'success', 'admin-toast');
      loadUsersTable();
    } else {
      showToast(
        'Failed to delete user. User might not exist.',
        'warning',
        'admin-toast'
      );
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showToast(`Error deleting user: ${error.message}`, 'error', 'admin-toast');
  } finally {
    deleteConfirmModalInstance.hide();
    userToDeleteId = null;
  }
}

function resetUserForm() {
  const form = document.getElementById('user-form');
  if (form) {
    form.reset();
    document.getElementById('userId').value = '';
    resetFormValidation(form);
  }
}

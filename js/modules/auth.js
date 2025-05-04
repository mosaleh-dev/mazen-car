import { getUsers, addUser } from './users';
const CURRENT_USER_STORAGE_KEY = 'currentUser';

/**
 * Logs in a user by checking credentials against stored users.
 * @param {string} email User's email.
 * @param {string} password User's password (plain text - insecure demo).
 * @returns {Promise<{success: boolean, isAdmin?: boolean, error?: string}>} Result object.
 */
export async function login(email, password) {
  try {
    const users = getUsers();
    const user = users.find((u) => u.email === email);
    if (user && user.password === password) {
      // Store only necessary, non-sensitive info for the session
      const currentUserData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        verified: user.verified,
      };
      localStorage.setItem(
        CURRENT_USER_STORAGE_KEY,
        JSON.stringify(currentUserData)
      );
      return { success: true, isAdmin: user.isAdmin };
    } else {
      return { success: false, isAdmin: false };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Registers a new user.
 * @param {Object} data User data (firstName, lastName, email, password, passwordConfirm, phoneNumber, nationalId).
 * @returns {Promise<{success: boolean, error?: string}>} Result object.
 */
export async function signup(data) {
  try {
    const {
      email,
      password,
      passwordConfirm,
      phoneNumber,
      nationalId,
      firstName,
      lastName,
    } = data;
    if (
      !email ||
      !password ||
      !passwordConfirm ||
      !phoneNumber ||
      !nationalId ||
      !firstName ||
      !lastName
    ) {
      throw new Error('All fields are required for signup.');
    }
    if (password !== passwordConfirm) {
      throw new Error('Password and confirm password do not match.');
    }
    const users = getUsers();
    const isEmailOrPhoneUsed = users.some(
      (user) =>
        user.email === email ||
        user.phoneNumber === phoneNumber ||
        user.nationalId === nationalId
    );
    if (isEmailOrPhoneUsed) {
      throw new Error('Email, phone number, or National ID is already used.');
    }

    const newUser = {
      id: `user${Date.now()}${Math.random().toString(16).slice(2)}`, // Simple unique ID
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      nationalId: nationalId,
      isAdmin: false,
      verified: false,
    };

    await addUser(newUser);

    // Automatically log in the new user since there is no email/phone verification
    await login(email, password);
    return { success: true };
  } catch (error) {
    console.error('Signup failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Logs out the current user by removing their data from session storage.
 */
export function logout() {
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
  // Redirect only if currently on an admin page after logout
  if (window.location.pathname.startsWith('/admin-')) {
    window.location.href = '/';
  }
}

/**
 * Retrieves the currently logged-in user's data.
 * @returns {Object|null} User data or null if not logged in.
 */
export function getCurrentUser() {
  const userData = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
  try {
    return userData ? JSON.parse(userData) : null;
  } catch (e) {
    console.error('Error parsing current user data:', e);
    localStorage.removeItem(CURRENT_USER_STORAGE_KEY); // Clear corrupted data
    return null;
  }
}

/**
 * Checks if a user is currently logged in.
 * @returns {boolean} True if a user is logged in, false otherwise.
 */
export function isLoggedIn() {
  return !!localStorage.getItem(CURRENT_USER_STORAGE_KEY);
}

/**
 * Checks if the currently logged-in user is an admin.
 * @returns {boolean} True if the user is an admin, false otherwise or if not logged in.
 */
export function isAdmin() {
  const user = getCurrentUser();
  return user ? user.isAdmin === true : false;
}

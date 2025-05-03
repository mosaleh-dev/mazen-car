export const USERS_STORAGE_KEY = 'usersData';
function _initMockUsers() {
  const mockUsers = [
    {
      id: 'user-admin',
      email: 'admin@test.com',
      password: 'adminpassword',
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      nationalId: '12345678901234',
      phoneNumber: '01012345678',
      isAdmin: true,
      verified: true,
    },
    {
      id: 'user-a',
      email: 'a@test.com',
      password: 'passwordpassword',
      firstName: 'Ali',
      lastName: 'Hassan',
      nationalId: '23456789012345',
      phoneNumber: '01023456789',
      isAdmin: false,
      verified: false,
    },
    {
      id: 'user-b',
      email: 'b@test.com',
      password: 'passwordpassword',
      firstName: 'Mahmoud',
      lastName: 'Ibrahim',
      nationalId: '34567890123456',
      phoneNumber: '01034567890',
      isAdmin: false,
      verified: false,
    },
    {
      id: 'user-c',
      email: 'c@test.com',
      password: 'passwordpassword',
      firstName: 'Youssef',
      lastName: 'Ahmed',
      nationalId: '45678901234567',
      phoneNumber: '01045678901',
      isAdmin: false,
      verified: true,
    },
  ];
  _saveUsers(mockUsers);
  return mockUsers;
}
/**
 * Retrieves all users from local storage. Initializes if needed.
 * @returns {Array<Object>} Array of user objects.
 */
function _getAllStoredUsers() {
  try {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersData) {
      return _initMockUsers();
    }
    return JSON.parse(usersData);
  } catch (e) {
    console.error('Error getting users from local storage:', e);
    return _initMockUsers();
  }
}
/**
 * Saves the full user list to local storage.
 * @param {Array<Object>} users Array of user objects.
 */
function _saveUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users to local storage:', e);
  }
}

/**
 * Retrieves all users (for admin panel). Filters out passwords.
 * @returns {Array<Object>} Array of user objects without passwords.
 */
export function getUsers() {
  return _getAllStoredUsers();
  // TODO:this should be handeled
  // Return a copy without the password field
  // return users.map(
  //   ({ password, ...userWithoutPassword }) => userWithoutPassword
  // );
}

/**
 * Retrieves a single user by ID (for admin panel). Filters out password.
 * @param {string} id The ID of the user to retrieve.
 * @returns {Object|null} User object without password, or null if not found.
 */
export function getUserById(id) {
  const users = _getAllStoredUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
/**
 * Adds a new user to the storage.
 * @param {Object} user User data (id, email, password, firstName, lastName, phoneNumber, nationalId, isAdmin, verified).
 * @returns {Promise<void>}
 */
export async function addUser(user) {
  const users = getUsers();
  users.push(user);
  _saveUsers(users);
}

/**
 * Updates user data (for admin panel).
 * @param {Object} userData Object containing the user ID and fields to update (e.g., { id: '...', firstName: 'New', verified: true }).
 * @returns {Object|null} The updated user object (without password) or null if not found.
 */
export function updateUser(userData) {
  if (!userData || !userData.id) {
    throw new Error('User ID is required for update.');
  }
  const users = _getAllStoredUsers();
  const userIndex = users.findIndex((u) => u.id === userData.id);

  if (userIndex === -1) {
    console.error(`User with ID ${userData.id} not found for update.`);
    return null;
  }

  const { password, ...updateFields } = userData;
  users[userIndex] = { ...users[userIndex], ...updateFields };

  _saveUsers(users);

  const { password: _, ...updatedUserWithoutPassword } = users[userIndex];
  return updatedUserWithoutPassword;
}

/**
 * Deletes a user by ID (for admin panel).
 * @param {string} id The ID of the user to delete.
 * @returns {boolean} True if deletion was successful, false otherwise.
 */
export function deleteUser(id) {
  if (!id) {
    throw new Error('User ID is required for deletion.');
  }
  let users = _getAllStoredUsers();
  const initialLength = users.length;
  users = users.filter((u) => u.id !== id);

  if (users.length < initialLength) {
    console.warn(`User with ID ${id} not found for deletion.`);
    return false;
  }
}

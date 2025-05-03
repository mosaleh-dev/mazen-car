function _initMockUsers() {
  const mockUsers = [
    {
      email: 'admin@test.com',
      password: 'adminpassword',
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      nationalId: '12345678901234',
      phoneNumber: '01012345678',
      isAdmin: true,
    },
    {
      email: 'a@test.com',
      password: 'passwordpassword',
      firstName: 'Ali',
      lastName: 'Hassan',
      nationalId: '23456789012345',
      phoneNumber: '01023456789',
      isAdmin: false,
    },
    {
      email: 'b@test.com',
      password: 'passwordpassword',
      firstName: 'Mahmoud',
      lastName: 'Ibrahim',
      nationalId: '34567890123456',
      phoneNumber: '01034567890',
      isAdmin: false,
    },
    {
      email: 'c@test.com',
      password: 'passwordpassword',
      firstName: 'Youssef',
      lastName: 'Ahmed',
      nationalId: '45678901234567',
      phoneNumber: '01045678901',
      isAdmin: false,
    },
    {
      email: 'd@test.com',
      password: 'passwordpassword',
      firstName: 'Ibrahim',
      lastName: 'Ali',
      nationalId: '56789012345678',
      phoneNumber: '01056789012',
      isAdmin: false,
    },
    {
      email: 'f@test.com',
      password: 'passwordpassword',
      firstName: 'Khaled',
      lastName: 'Mahmoud',
      nationalId: '67890123456789',
      phoneNumber: '01067890123',
      isAdmin: false,
    },
  ];
  _saveUsers(mockUsers);
  return mockUsers;
}

function _getUsers() {
  try {
    const usersData = localStorage.getItem('users');
    if (!usersData) {
      return _initMockUsers();
    }
    return JSON.parse(usersData);
  } catch (e) {
    console.error('Error getting users from local storage:', e);
    return _initMockUsers();
  }
}

function _saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

export async function login(email, password) {
  try {
    const users = _getUsers();
    const user = users.find(
      (user) => user.email === email && user.password === password
    );
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, isAdmin: user.isAdmin };
    } else {
      return { success: false, isAdmin: false };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function signup(data) {
  try {
    const { email, password, passwordConfirm, phoneNumber } = data;
    if (!email || !password || !passwordConfirm || !phoneNumber) {
      throw new Error(
        'Email, password, confirm password, and phoneNumber are required.'
      );
    }
    if (password !== passwordConfirm) {
      throw new Error('Password and confirm password do not match.');
    }
    const users = _getUsers();
    const isEmailOrPhoneUsed = users.some(
      (user) => user.email === email || user.phoneNumber === phoneNumber
    );
    if (isEmailOrPhoneUsed) {
      throw new Error('Email or phoneNumber is already used.');
    }
    users.push(data);
    _saveUsers(users);
    await login(email, password);
    return { success: true };
  } catch (error) {
    console.error('Signup failed:', error);
    return { success: false, error: error.message };
  }
}

export function logout() {
  localStorage.removeItem('currentUser');
  if (location.href == '/admin-dashboard.html') {
    window.location.href = '/';
  }
}

export function getCurrentUser() {
  return JSON.parse(localStorage.getItem('currentUser'));
}

export function isLoggedIn() {
  return !!localStorage.getItem('currentUser');
}

export function isAdmin() {
  const user = getCurrentUser();
  return user ? user.isAdmin : false;
}

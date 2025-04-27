import pb from './pocketbase.js';

export async function login(email, password) {
  try {
    const authData = await pb
      .collection('users')
      .authWithPassword(email, password);
    return { success: true, isAdmin: authData.record.isAdmin };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function signup(data) {
  delete data.isAdmin;
  try {
    await pb.collection('users').create(data);
    //  Log the user in immediately after signup (we donot have emeail verification yet)
    await login(data.email, data.password);
    return { success: true };
  } catch (error) {
    console.error('Signup failed:', error);
    return { success: false, error: error.message };
  }
}

export function logout() {
  pb.authStore.clear();
  // console.log('Logged out');
}

export function getCurrentUser() {
  return pb.authStore.model;
}
export function isLoggedIn() {
  return pb.authStore.isValid;
}
export function isAdmin() {
  const user = getCurrentUser();
  return user ? user.isAdmin : false;
}

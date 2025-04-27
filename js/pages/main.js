import pb from './modules/pocketbase.js';
import { isLoggedIn, isAdmin, getCurrentUser, logout } from './modules/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const app = document.querySelector('#app');
  console.log(await pb.health.check());
  if (app) {
    app.innerHTML += '<p>JavaScript is working!</p>';
    app.innerHTML += `<p>pb health:${JSON.stringify(await pb.health.check())}</p>`;
    app.innerHTML += `<p>isLoggedIn:${isLoggedIn()}</p>`;
    app.innerHTML += `<p>isAdmin:${isAdmin()}</p>`;
    app.innerHTML += `<p>auth state:${JSON.stringify(getCurrentUser())}</p>`;
    if (isLoggedIn()) {
      app.innerHTML += `<button id="logOut" >logOut</button>`;
    }
    document.getElementById('logOut').addEventListener('click', () => {
      logout();
      location.reload();
    });
  } else {
    console.log('#app element not found initially.');
  }
});

document.addEventListener('DOMContentLoaded', () => {});

import 'bootstrap/dist/css/bootstrap.min.css';
import PocketBase from 'pocketbase';
let pb;
try {
  pb = new PocketBase('http://127.0.0.1:8090');
  window.pb = pb;
  console.log('PocketBase SDK initialized.', pb);
} catch (error) {
  console.error('Failed to initialize PocketBase:', error);
}

document.addEventListener('DOMContentLoaded', async () => {
  const app = document.querySelector('#app');
  console.log(await pb.health.check());
  if (app) {
    app.innerHTML += '<p>JavaScript is working!</p>';
    app.innerHTML += `<p>pb health:${JSON.stringify(await pb.health.check())}</p>`;
  } else {
    console.log('#app element not found initially.');
  }
});

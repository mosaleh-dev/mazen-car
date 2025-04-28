import PocketBase from 'pocketbase';

export const POCKETBASE_URL =
  import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';

const pb = new PocketBase(POCKETBASE_URL);

// pb.authStore.onChange(() => {
// }, true);

export default pb;

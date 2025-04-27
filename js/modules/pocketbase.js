import PocketBase from 'pocketbase';

const POCKETBASE_URL = 'http://127.0.0.1:8090';

const pb = new PocketBase(POCKETBASE_URL);

// pb.authStore.onChange(() => {
// }, true);

export default pb;

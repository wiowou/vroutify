import { createApp } from 'vue';
import App from './App.vue';
import router from './myrouter';

createApp(App)
  .use(router)
  .mount('#app');

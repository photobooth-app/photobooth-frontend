import { defineBoot } from '#q-app/wrappers';
import VueSSE from 'vue-sse';

// "async" is optional;
// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default defineBoot(({ app }) => {
  // something to do

  app.use(VueSSE);
  //app.config.globalProperties.$sse = VueSSE;
});

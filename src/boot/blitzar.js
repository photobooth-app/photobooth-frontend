import { boot } from "quasar/wrappers";
import { BlitzForm, BlitzListForm } from "blitzar";
import ColorPicker from "../components/ColorPicker.vue";

// more info on params: https://v2.quasar.dev/quasar-cli/boot-files
export default boot(async ({ app }) => {
  app.component("BlitzForm", BlitzForm);
  app.component("BlitzListForm", BlitzListForm);
  app.component("ColorPicker", ColorPicker);
});

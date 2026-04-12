import { createApp } from "vue";
import App from "./App.vue";

createApp(App, { basePath: "/", embedded: false }).mount("#taskbolt");

import { createRouter, createWebHashHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";
import DesktopView from "../views/DesktopView.vue";


const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "login",
            component: LoginView
        },
        {
            path: "/desktop",
            name: "desktop",
            component: DesktopView
        }
    ],
});

export default router;

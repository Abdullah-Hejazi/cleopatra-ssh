import { createRouter, createWebHashHistory } from "vue-router";
import LoginView from "../views/LoginView.vue";


const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "login",
            component: LoginView,
            meta: {
                requiresAuth: false,
                title: 'Login'
            }
        }
    ],
});

export default router;

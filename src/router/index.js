import { createRouter, createWebHashHistory } from "vue-router"
import LoginView from "../views/LoginView.vue"
import DesktopView from "../views/DesktopView.vue"

import SSHClient from '@/services/ssh'


const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: "/",
            name: "login",
            component: LoginView,
            meta: {
                requiresAuth: false
            }
        },
        {
            path: "/desktop",
            name: "desktop",
            component: DesktopView,
            meta: {
                requiresAuth: true
            }
        }
    ],
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth) {
        if (SSHClient.GetConnection() === null) {
            next('/')
            return
        }
    }
    next()
})


export default router;

<template>
    <div class="title-bar surface-overlay px-1 flex justify-content-between">
        <div class="flex align-items-center flex-grow-1">
            <div class="flex align-items-center">
                <img alt="logo" src="@/assets/logo2.png" height="34" class="mx-3">
                <Button icon="pi pi-home" class="p-button-text p-button-plain" :label="$t('general.home')" @click="Home" />
                <Button icon="pi pi-cog" class="p-button-plain p-button-text ml-1" :label="$t('general.settings')" @click="settings" />
                <Button icon="pi pi-power-off" class="p-button-plain p-button-text ml-1" :label="$t('general.logout')" @click="Logout" />
            </div>
            <div class="text-500 drag-bar flex-grow-1">
                &nbsp;
            </div>
        </div>

        <div class="flex align-items-center py-2">
            <Button icon="pi pi-minus" class="p-button-text p-button-plain" @click="Minimize" />
            <Button icon="pi pi-window-maximize" class="p-button-text p-button-plain" @click="Maximize" />
            <Button icon="pi pi-times" class="p-button-text p-button-plain" @click="Close" />
        </div>
    </div>
</template>

<script>

import { ipcRenderer } from "electron"

export default {
    name: 'TitleBar',

    props: [
        'settings'
    ],

    methods: {
        Minimize() {
            ipcRenderer.send('minimize-app')
        },

        Maximize() {
            ipcRenderer.send('maximize-app')
        },

        Close() {
            ipcRenderer.send('close-app')
        },

        Logout() {
            this.$router.push('/');
        },

        Home () {
        }
    }
}
</script>

<style>
    .title-bar {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .drag-bar {
        -webkit-app-region: drag;
        height: 100%;
    }
</style>
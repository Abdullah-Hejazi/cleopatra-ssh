<template>
    <div class="desktop-background flex flex-column align-content-center flex-wrap justify-content-end" :style="{backgroundImage: 'url(' + backgroundImage + ')'}">
        <div v-for="process in processes" :key="process.id">
            <KeepAlive>
                <component :is="process.name" v-bind="GetProcessProps(process.id)" v-if="process.visible" />
            </KeepAlive>
        </div>

        <div style="z-index: 9999;">
            <TaskBar :onOpen="OpenProcess" :onActiveApps="ToggleActiveApps" />
        </div>

        <ContextMenu ref="processmanagermenu" :model="Object.entries(processes)">
            <template #item="{item}">
                <div class="flex cursor-pointer align-items-center px-2">
                    <div class="flex flex-row align-items-center py-2" @click="ToggleMinimize(item[0])">
                        <img :src="icons[item[1].name]" width="20">
                        <div class="ml-2">
                            {{ item[1].title }}
                        </div>
                    </div>

                    <div class="ml-auto">
                        <Button class="p-button-raised p-button-rounded p-button-danger p-button-rounded p-button-sm p-0" style="width: 22px; height: 22px;" icon="pi pi-times" @click="CloseProcess(item[1].id)"></Button>
                    </div>
                </div>
            </template>
        </ContextMenu>
    </div>
</template>

<script>
import TaskBar from '@/components/TaskBar'
import FolderBrowser from '@/components/windows/FolderBrowser'
import Editor from '@/components/windows/Editor'
import FileDialog from '@/components/windows/FileDialog'
import ImageViewer from '@/components/windows/ImageViewer'
import Terminal from '@/components/windows/Terminal'
import Settings from '@/components/windows/Settings'

import IconItem from '@/components/IconItem'

import Helpers from '@/services/helpers'

const { ipcRenderer } = require('electron')

export default {
    name: 'DesktopView',

    components: {
        TaskBar,
        FolderBrowser,
        Editor,
        FileDialog,
        IconItem,
        ImageViewer,
        Terminal,
        Settings
    },

    data () {
        return {
            processes: {},

            icons: {
                Editor: '/texteditor.png',
                FolderBrowser: '/folder.png',
                Terminal: '/terminal.png',
                ImageViewer: '/imageviewer.png',
                Settings: '/settings.png'
            },

            currentZIndex: 1500,

            refreshIndex: 0, // Used to refresh processes intentionally (e.g when a folder has a new file, it requires all other folders to refresh)

            backgroundImage: '/background.jpg'
        }
    },

    mounted () {
        let img = localStorage.getItem('desktopBackground')

        this.backgroundImage = img ? img : '/background.jpg'
    },

    methods: {
        OpenProcess (process, file='') {
            let uid = Helpers.GetRandomString()

            this.processes[uid] = {
                id: uid,
                name: process,
                title: this.$t('general.' + process),
                zIndex: this.currentZIndex++,
                visible: true,
                file: file
            }
        },

        GetProcessProps (id) {
            return {
                zIndex: this.processes[id].zIndex,
                onClose: () => this.CloseProcess(id),
                onMinimize: () => this.MinimizeProcess(id),
                onZIndexChange: () => this.onZIndexChange(id),
                file: this.processes[id].file,
                ...this.GetPorcessSpecificProps(id)
            }
        },

        GetPorcessSpecificProps (id) {
            if (this.processes[id].name === 'FolderBrowser') {
                return {
                    onOpenProcess: this.OpenProcess,
                    refreshIndex: this.refreshIndex,
                    OnRefreshUpdate: this.OnRefreshUpdate
                }
            }

            if (this.processes[id].name === 'Settings') {
                return {
                    onChangeBackground: this.ChangeBackground,
                    onRemoveBackground: this.RemoveBackground
                }
            }

            return {}
        },

        CloseProcess (id) {
            delete this.processes[id]
        },

        MinimizeProcess (id) {
            this.processes[id].visible = false
        },

        ToggleMinimize (id) {
            this.processes[id].visible = !this.processes[id].visible
        },

        ToggleActiveApps (event) {
            if (Object.keys(this.processes).length === 0) {
                return
            }

            this.$refs.processmanagermenu.toggle(event)
        },

        GetMinimizedApps () {
            let minimizedApps = []

            for (let process in this.processes) {
                if (!this.processes[process].visible) {
                    minimizedApps.push(this.processes[process])
                }
            }

            return minimizedApps
        },

        onZIndexChange (id) {
            if (this.processes[id])
                this.processes[id].zIndex = this.currentZIndex++
        },

        SelectImagePath () {
            let files = ipcRenderer.sendSync('select-image')

            if (files && files.length) {
                this.changeImageDialog.path = files[0]
            }
        },

        SetBackgroundImage(path) {
            this.backgroundImage = path
        },

        ChangeBackground (img) {
            this.SetBackgroundImage(img)
        },

        RemoveBackground () {
            this.SetBackgroundImage('/background.jpg')
        },

        OnRefreshUpdate () {
            this.refreshIndex++
        }
    }
}

</script>

<style>
    .desktop-background {
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        height: calc(100vh - 55px);
        width: 100%;
    }
</style>
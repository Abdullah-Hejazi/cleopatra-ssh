<template>
    <div class="desktop-background flex flex-column align-content-center flex-wrap justify-content-end" @contextmenu="OnDesktopContextMenu" :style="{backgroundImage: 'url(' + backgroundImage + ')'}">
        <ContextMenu ref="desktopmenu" :model="desktopContextMenu" style="width: 250px;" />

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
        
        <Dialog :header="$t('desktop.changebackground')" v-model:visible="changeImageDialog.visible" style="width: 500px" :modal="true">
            <div class="mt-2 flex">
                <span class="p-input-icon-left flex-grow-1">
                    <i class="pi pi-sort-alt" />
                    <Dropdown @change="changeImageDialog.path = ''" v-model="changeImageDialog.type" :options="backgroundTypes" optionLabel="name" class="w-full" />
                </span>
            </div>

            <div class="mt-3 flex" v-if="changeImageDialog.type.value === 'file'">
                <span class="p-input-icon-left flex-grow-1">
                    <i class="pi pi-folder" />
                    <InputText :placeholder="$t('desktop.imagepath')" disabled type="text" v-model="changeImageDialog.path" class="w-full input-bg" />
                </span>

                <Button icon="pi pi-folder" class="p-button-text ml-2" @click="SelectImagePath" />
            </div>

            <div class="mt-3 flex" v-if="changeImageDialog.type.value === 'url'">
                <span class="p-input-icon-left flex-grow-1">
                    <i class="pi pi-link" />
                    <InputText :placeholder="$t('desktop.imageurl')" type="text" v-model="changeImageDialog.path" class="w-full input-bg" />
                </span>
            </div>

            <template #footer>
                <div class="flex justify-content-center mt-2">
                    <Button :label="$t('desktop.removebackground')" class="p-button-text p-button-secondary" @click="RemoveBackground" />
                    <Button :label="$t('desktop.changebackground')" @click="ChangeBackground" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script>
import TaskBar from '@/components/TaskBar'
import FolderBrowser from '@/components/windows/FolderBrowser'
import Editor from '@/components/windows/Editor'
import FileDialog from '@/components/windows/FileDialog'
import ImageViewer from '@/components/windows/ImageViewer'
import Terminal from '@/components/windows/Terminal'

import IconItem from '@/components/IconItem'

import Helpers from '@/services/helpers'

const { ipcRenderer } = require('electron')

const fs = require('fs')

export default {
    name: 'DesktopView',

    components: {
        TaskBar,
        FolderBrowser,
        Editor,
        FileDialog,
        IconItem,
        ImageViewer,
        Terminal
    },

    data () {
        return {
            processes: {},

            icons: {
                Editor: '/texteditor.png',
                FolderBrowser: '/folder.png',
                Terminal: '/terminal.png',
                ImageViewer: '/imageviewer.png'
            },

            currentZIndex: 1500,

            changeImageDialog: {
                visible: false,
                path: '',
                type: {
                    name: this.$t('desktop.fromfile'),
                    value: "file"
                },
            },

            backgroundTypes: [
                {
                    name: this.$t('desktop.fromfile'),
                    value: "file"
                },
                {
                    name: this.$t('desktop.fromurl'),
                    value: "url"
                }
            ],

            desktopContextMenu: [
                {
					label: this.$t('desktop.changebackground'),
					icon: 'pi pi-image',
                    command: () => {
                        this.changeImageDialog.visible = true
                    }
                },
            ],

            processManagerContextMenu: [
                {
					label: this.$t('desktop.changebackground'),
					icon: 'pi pi-image',
                    command: () => {
                        this.changeImageDialog.visible = true
                    }
                },
            ],

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
            if (this.processes[id].name === 'FolderBrowser') {
                return {
                    zIndex: this.processes[id].zIndex,
                    onClose: () => this.CloseProcess(id),
                    onMinimize: () => this.MinimizeProcess(id),
                    onZIndexChange: () => this.onZIndexChange(id),
                    onOpenProcess: this.OpenProcess
                }
            }

            return {
                zIndex: this.processes[id].zIndex,
                onClose: () => this.CloseProcess(id),
                onMinimize: () => this.MinimizeProcess(id),
                onZIndexChange: () => this.onZIndexChange(id),
                file: this.processes[id].file
            }
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

        OnDesktopContextMenu (event) {
            if (event.target === this.$el) {
                this.$refs.desktopmenu.show(event)
            }
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

        ChangeBackground () {
            if (this.changeImageDialog.path.length === 0) return

            let img = this.changeImageDialog.type.value === 'url' ?
                        this.changeImageDialog.path :
                        'data:image/jpeg;base64,' + fs.readFileSync(this.changeImageDialog.path).toString('base64') 

            localStorage.setItem('desktopBackground', img)

            this.SetBackgroundImage(img)

            this.changeImageDialog.visible = false
        },

        RemoveBackground () {
            localStorage.removeItem('desktopBackground')

            this.SetBackgroundImage('/background.jpg')

            this.changeImageDialog.visible = false
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
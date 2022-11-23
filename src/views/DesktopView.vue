<template>
    <div class="desktop-background flex flex-column align-content-center flex-wrap justify-content-end">
        <div v-for="process in processes" :key="process.id">
            <KeepAlive>
                <component :is="process.name" v-bind="GetProcessProps(process.id)" v-if="process.visible" />
            </KeepAlive>
        </div>

        <div class="active-apps mb-3" v-if="showActiveApps">
            <p class="mt-1 mb-3 text-center">{{ $t('general.minimizedprocesses') }}</p>
            <div class="flex mb-3">
                <div v-for="process in GetMinimizedApps()" :key="process.id" class="mx-1">
                    <div v-if="!process.visible">
                        <IconItem :name="process.title" :icon="icons[process.name]" width="20" @click="process.visible = true" />
                    </div>
                </div>
            </div>

            <div class="mb-3 text-center" v-if="! GetMinimizedApps().length">
                {{ $t('general.noprocesses') }}
            </div>
        </div>

        <div style="z-index: 9999;">
            <TaskBar :onOpen="OpenProcess" :onActiveApps="ToggleActiveApps" />
        </div>
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
            showActiveApps: false,

            icons: {
                Editor: '/texteditor.png',
                FolderBrowser: '/folder.png',
                Terminal: '/terminal.png',
                ImageViewer: '/imageviewer.png'
            },

            currentZIndex: 1500
        }
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

        ToggleActiveApps () {
            this.showActiveApps = !this.showActiveApps
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
        }
    }
}

</script>

<style>
    .desktop-background {
        background-image: url("/src/assets/background.jpg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        height: calc(100vh - 65px);
        width: 100%;
    }

    .active-apps {
        background-color: #00000088;
        border-radius: 10px;
        padding: 0px 10px 0px 10px;
        z-index: 9999;
        max-width: 385px;
        overflow-x: auto;
    }
</style>
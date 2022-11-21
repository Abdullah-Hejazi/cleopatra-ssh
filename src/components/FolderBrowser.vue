<template>
    <Window title="Folder Browser" icon="/folder.png">
        <div class="path-bar"></div>
        <div class="folder-browser-window flex">
            <div class="side-bar col-3">
                <div v-for="folder in root" :key="folder.name" :class="'side-bar-item ' + (folder.selected ? 'bg-primary' : '')" @click="SelectSideBarItem(folder)">
                    <i :class="folder.icon" style="font-size: 1rem"></i>
                    <span class="ml-2">{{ folder.name }}</span>
                </div>
            </div>

            <div class="main-content-list col-9 mr-2">
                <ScrollPanel style="width: 100%; height: 100%">
                    <div v-for="folder in files" :key="folder.name" v-tooltip.bottom="folder.name" @click="SelectItem(folder)" @keyup.enter="LoadItem(folder)" v-on:dblclick="LoadItem(folder)">
                        <div :class="'main-content-item-list ' + (folder.selected ? 'bg-primary' : '')" >
                            <i :class="(folder.directory) ? 'pi pi-folder' : 'pi pi-file'" style="font-size: 1rem"></i>
                            <span class="ml-2 main-content-item-text-list">{{ folder.name }}</span>
                        </div>
                    </div>
                </ScrollPanel>
            </div>
        </div>
    </Window>
</template>

<script>
import SSHClient from '@/services/ssh'
import Helpers from '@/services/helpers'

import Window from '@/components/Window'

export default {
    name: 'FolderBrowser',

    components: {
        Window
    },

    data () {
        return {
            files: [],
            root: [
                {
                    name: 'Home',
                    icon: 'pi pi-home',
                    path: Helpers.GetHomeDirectory(),
                    selected: true
                },
                {
                    name: 'Root',
                    icon: 'pi pi-folder',
                    path: '/',
                    selected: false
                },
            ],

            currentPath: Helpers.GetHomeDirectory(),

            loading: false
        }
    },

    mounted () {
        this.Load(Helpers.GetHomeDirectory())
    },

    methods: {
        Load (path) {
            this.loading = true

            SSHClient.List(path).then((result) => {
                this.files = Helpers.ParseDirectory(result)
                this.currentPath = path
            }).catch((err) => {
                console.log(err)
            }).finally(() => {
                this.loading = false
            })
        },

        SelectSideBarItem (item) {
            this.root.forEach((rootItem) => {
                rootItem.selected = false
            })

            item.selected = true

            this.Load(item.path)
        },

        SelectItem (item) {
            this.files.forEach((file) => {
                file.selected = false
            })

            item.selected = true
        },

        LoadItem (item) {
            if (item.directory) {
                let path = this.currentPath

                if (path.endsWith('/')) {
                    path += item.name
                } else {
                    path += '/' + item.name
                }

                if (item.directory) {
                    this.Load(path)
                }
            }
            
        }
    }
}
</script>

<style>
    .folder-browser-window {
        height: calc(100% - 40px);
    }

    .side-bar {
        margin-top: 10px;
        border-right: 1px solid rgba(100, 100, 100, 0.329);
    }

    .side-bar-item {
        padding: 5px;
        margin-bottom: 5px;
        border-radius: 4px;
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.021);
        transition: all 0.15s ease-in-out;
    }

    .side-bar-item:hover {
        background-color: rgba(255, 255, 255, 0.055);
    }

    .main-content {
        width: calc(100% - 250px);
        margin-top: 10px;
    }

    .main-content-item {
        display: inline-block;
        padding: 5px;
        margin-bottom: 5px;
        border-radius: 4px;
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.021);
        transition: all 0.15s ease-in-out;

        width: 100px;
        height: 70px;
        margin-right: 10px;
    }

    .main-content-item:hover {
        background-color: rgba(255, 255, 255, 0.055);
    }

    .main-content-item-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: clip;
        max-width: 90px;
        text-align: center;
    }

    .main-content-item-list {
        display: inline-block;
        padding: 5px;
        margin-bottom: 5px;
        border-radius: 4px;
        cursor: pointer;
        background-color: rgba(255, 255, 255, 0.021);
        transition: all 0.15s ease-in-out;

        width: 100%;
    }

    .main-content {
        width: calc(100% - 280px);
    }

    .main-content-item-list:hover {
        background-color: rgba(255, 255, 255, 0.055);
    }
</style>
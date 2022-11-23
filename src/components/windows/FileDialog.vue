<template>
    <Window :onClose="Cancel" :noMinimize="true" :title="$t('filedialog.title')" icon="/folder.png" :defaultSize="{width: 650, height: 400}" defaultLocation="center">
        <div class="path-bar">
            <div class="path flex">
                <Button icon="pi pi-angle-left" class="mx-1 p-button-text" @click="GoBack"></Button>
                <div class="flex-grow-1 p-0 mr-3">
                    <InputText spellcheck="false" @focus="pathFocused = true" @blur="pathFocused = false" type="text" v-model="pathInput" class="path-input w-full" @change="Load(pathInput)" />
                </div>
            </div>
        </div>

        <div class="folder-browser-window flex unselectable-text">
            <div class="side-bar col-3">
                <div v-for="folder in root" :key="folder.name" :class="'side-bar-item pl-2 ' + (folder.selected ? 'bg-primary' : '')" @click="SelectSideBarItem(folder)">
                    <i :class="folder.icon" style="font-size: 1rem"></i>
                    <span class="ml-2">{{ folder.name }}</span>
                </div>
            </div>

            <div class="main-content-list col-9 mr-2" v-if="!loading && !error && files.length">
                <ScrollPanel style="width: 100%; height: 100%">
                    <div v-for="folder, index in files" :key="folder.name" v-tooltip.bottom="folder.name" @click="SelectItem(index)" @keyup.enter="LoadItem(folder)" v-on:dblclick="LoadItem(folder)">
                        <div :class="'main-content-item-list ' + (IsSelected(index) ? 'bg-primary' : '')" >
                            <i :class="(folder.directory) ? 'pi pi-folder' : 'pi pi-file'" style="font-size: 1rem"></i>
                            <span class="ml-2 main-content-item-text-list">{{ folder.name }}</span>
                        </div>
                    </div>
                </ScrollPanel>
            </div>

            <div class="w-full text-center flex " v-if="loading">
                <ProgressSpinner class="h-full" />
            </div>

            <div class="w-full text-center text-lg mt-5 text-gray-300" v-if="files.length === 0 && !loading && !error">
                {{ $t('folder.emptyfolder') }}
            </div>
        </div>

        <div class="file-confirm flex justify-content-between p-2">
            <Button :label="$t('filedialog.cancel')" class="p-button-text p-button-sm" @click="Cancel"></Button>
            <Button :label="$t('filedialog.select')" class="p-button-sm" @click="Select"></Button>
        </div>
    </Window>
</template>

<script>
import SSHClient from '@/services/ssh'
import Helpers from '@/services/helpers'

import Window from '@/components/windows/Window'

export default {
    name: 'FileDialog',

    components: {
        Window
    },

    props: {
        multiple: {
            type: Boolean,
            default: false
        },
        
        type: {
            type: String,
            default: 'files'
        },

        Finish: {
            type: Function,
            default: () => {}
        },

        Cancel: {
            type: Function,
            default: () => {}
        }
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
                    icon: 'pi pi-server',
                    path: '/',
                    selected: false
                },
            ],

            currentPath: Helpers.GetHomeDirectory(),

            loading: false,
            error: '',
            pathInput: Helpers.GetHomeDirectory(),
            pathFocused: false,

            selected: []
        }
    },

    mounted () {
        this.Load(Helpers.GetHomeDirectory())
    },

    methods: {
        Load (path) {
            this.loading = true
            this.error = ''

            this.selected = []

            SSHClient.List(path).then((result) => {
                let data = Helpers.ParseDirectory(result).sort((a, b) => {
                    if (a.directory && !b.directory)        return -1
                    else if (!a.directory && b.directory)   return 1

                    return 0
                })

                this.files = (this.type === 'folders') ? data.filter((item) => {
                    return item.directory
                }) : data


                this.currentPath = path
                this.UpdateSideBarItem()
            }).catch((err) => {
                this.error = err
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

        UpdateSideBarItem () {
            this.root.forEach((rootItem) => {
                if (rootItem.path === this.currentPath) {
                    rootItem.selected = true
                } else {
                    rootItem.selected = false
                }
            })

            if (this.pathFocused === false) {
                this.pathInput = this.currentPath
            }
        },

        SelectItem (index) {
            if (window.event.ctrlKey && this.multiple) {
                if (this.selected.includes(index)) {
                    this.selected.splice(this.selected.indexOf(index), 1)
                } else {
                    this.selected.push(index)
                }
                return
            }

            if (window.event.shiftKey && this.multiple) {
                if (this.selected.length === 0) {
                    this.selected.push(index)
                    return
                }

                const lastSelected = this.selected[this.selected.length - 1]

                if (lastSelected < index) {
                    for (let i = lastSelected; i <= index; i++) {
                        if (!this.selected.includes(i)) {
                            this.selected.push(i)
                        }
                    }
                } else {
                    for (let i = lastSelected; i >= index; i--) {
                        if (!this.selected.includes(i)) {
                            this.selected.push(i)
                        }
                    }
                }

                return
            }

            this.selected = [index]
        },

        ClearSelected () {
            this.selected = []
        },

        IsSelected (index) {
            return this.selected.includes(index)
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
            
        },

        GoBack () {
            let path = this.currentPath

            if (path.endsWith('/')) {
                path = path.substring(0, path.length - 1)
            }

            path = path.split('/')
            path.pop()

            if (path.length <= 1) {
                path = '/'
            } else {
                path = path.join('/')
            }

            this.Load(path)
        },

        Select () {
            if (this.selected.length === 0) {
                this.Finish(this.currentPath)
                return
            }

            if (! this.multiple) {
                this.Finish(this.files[this.selected[0]])
                return
            }

            let output = []

            this.selected.forEach((index) => {
                output.push(this.files[index])
            })

            this.Finish(output)
            return
        }
    }
}
</script>

<style scoped>
    .unselectable-text {
        user-select: none;
    }

    .folder-browser-window {
        height: calc(100% - 150px);
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

    .path-bar {
        padding-top: 5px;
    }

    .path-input {
        background-color: #00000049 !important;
        color: white;
        font-size: 1rem;
    }

    .file-confirm {
        background-color: #00000049 !important;
        border-bottom-left-radius: 5px;
        border-bottom-right-radius: 5px;
    }
</style>
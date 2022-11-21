<template>
    <Window :title="$t('folder.browser')" icon="/folder.png">
        <div class="path-bar">
            <div class="path flex">
                <Button icon="pi pi-angle-left" class="mx-1 p-button-text" @click="GoBack"></Button>
                <div class="flex-grow-1 p-0 mr-3">
                    <InputText spellcheck="false" @focus="pathFocused = true" @blur="pathFocused = false" type="text" v-model="pathInput" class="path-input w-full" @change="Load(pathInput)" />
                </div>

                <div class="path-controls p-0">
                    <Button icon="pi pi-plus" class="mr-1 p-button-text" @click="NewFile" v-tooltip.bottom="$t('folder.newfile')"></Button>
                    <Button icon="pi pi-refresh" class="mr-1 p-button-text" @click="Load(currentPath)" v-tooltip.bottom="$t('folder.refresh')"></Button>
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
                    <div v-for="folder in files" :key="folder.name" v-tooltip.bottom="folder.name" @click="SelectItem(folder)" @keyup.enter="LoadItem(folder)" v-on:dblclick="LoadItem(folder)">
                        <div @contextmenu="OnContextMenu($event, folder)" :class="'main-content-item-list ' + (folder.selected ? 'bg-primary' : '')" >
                            <i :class="(folder.directory) ? 'pi pi-folder' : 'pi pi-file'" style="font-size: 1rem"></i>
                            <span class="ml-2 main-content-item-text-list">{{ folder.name }}</span>
                        </div>
                    </div>
                </ScrollPanel>

                <ContextMenu ref="foldermenu" :model="folderContextMenuItems" />
                <ContextMenu ref="filemenu" :model="fileContextMenuItems" />
            </div>

            <div class="w-full text-center flex " v-if="loading">
                <ProgressSpinner class="h-full" />
            </div>

            <div class="w-full text-center text-lg mt-5 text-gray-300" v-if="files.length === 0 && !loading && !error">
                {{ $t('folder.emptyfolder') }}
            </div>

            <div class="w-full text-center text-lg mt-5 text-gray-300" v-if="error">
                {{ error }} . <span class="text-primary cursor-pointer" @click="Load(currentPath)">{{ $t('folder.clear') }}</span>
            </div>
        </div>

        <Dialog :header="$t('folder.newfile')" v-model:visible="newFile.visible" class="display-name-dialog" :modal="true">
            <div class="p-text-secondary">
                <InputText :placeholder="$t('folder.filename')" v-model="newFile.name" class="w-full mt-3" />

                <Checkbox v-model="newFile.directory" :binary="true" class="mt-3" />
                <span class="ml-2">{{ $t('folder.directory') }}</span>
            </div>

            <template #footer>
                <div class="flex justify-content-center">
                    <Button :label="$t('folder.create')" @click="CreateFile" />
                </div>
            </template>
        </Dialog>
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

            newFile: {
                visible: false,
                name: '',
                directory: false
            },

            folderContextMenuItems: [
                {
					label: this.$t('folder.open'),
					icon: 'pi pi-folder-open'
                },
                {
					label: this.$t('folder.rename'),
					icon: 'pi pi-pencil'
                },
                {
					label: this.$t('folder.delete'),
					icon: 'pi pi-trash'
                },
                {
					label: this.$t('folder.properties'),
					icon: 'pi pi-cog'
                }
            ],

            fileContextMenuItems: [
                {
					label: this.$t('folder.edit'),
					icon: 'pi pi-file'
                },
                {
					label: this.$t('folder.execute'),
					icon: 'pi pi-dollar'
                },
                {
					label: this.$t('folder.download'),
					icon: 'pi pi-download'
                },
                {
					label: this.$t('folder.rename'),
					icon: 'pi pi-pencil'
                },
                {
					label: this.$t('folder.delete'),
					icon: 'pi pi-trash'
                },
                {
					label: this.$t('folder.properties'),
					icon: 'pi pi-cog'
                }
            ]
        }
    },

    mounted () {
        this.Load(Helpers.GetHomeDirectory())
    },

    methods: {
        Load (path) {
            this.loading = true
            this.error = ''

            SSHClient.List(path).then((result) => {
                this.files = Helpers.ParseDirectory(result)
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
            
        },

        GoBack() {
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

        NewFile () {
            this.newFile.name = ''
            this.newFile.visible = true
        },

        CreateFile () {
            if (this.newFile.name.length === 0) {
                return
            }

            let file = this.currentPath + '/' + this.newFile.name

            if (this.newFile.directory) {
                SSHClient.CreateDirectory(file).then(() => {
                    this.Load(this.currentPath)
                }).catch((err) => {
                    this.error = err
                }).finally(() => {
                    this.newFile.visible = false
                })
            } else {
                SSHClient.FileExists(file).then((res) => {
                    if (res == 1) {
                        this.error = this.$t('folder.exists')
                        this.newFile.visible = false
                    } else {
                        this.ExecuteCreateFile(file)
                    }
                }).catch((err) => {
                    this.error = err
                })
            }
        },

        ExecuteCreateFile(file) {
            SSHClient.CreateFile(file).then(() => {
                this.Load(this.currentPath)
            }).catch((err) => {
                this.error = err
            }).finally(() => {
                this.newFile.visible = false
            })
        },

        OnContextMenu(event, folder) {
            this.SelectItem(folder)
            
            if (folder.directory) {
                this.$refs.filemenu.hide()
                this.$refs.foldermenu.show(event)
            } else {
                this.$refs.foldermenu.hide()
                this.$refs.filemenu.show(event)
            }
        }
    }
}
</script>

<style>
    .unselectable-text {
        user-select: none;
    }

    .folder-browser-window {
        height: calc(100% - 85px);
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

    .path-bar {
        padding-top: 5px;
    }

    .path-input {
        background-color: #00000049 !important;
        color: white;
        font-size: 1rem;
    }
</style>
<template>
    <Window :title="$t('folder.browser')" icon="/folder.png">
        <div class="path-bar">
            <div class="path flex">
                <Button icon="pi pi-angle-left" class="mx-1 p-button-text" @click="GoBack"></Button>
                <div class="flex-grow-1 p-0 mr-3">
                    <InputText spellcheck="false" @focus="pathFocused = true" @blur="pathFocused = false" type="text" v-model="pathInput" class="path-input w-full" @change="Load(pathInput)" />
                </div>

                <div class="path-controls p-0">
                    <Button icon="pi pi-cog" class="mr-1 p-button-text" @click="Options" v-tooltip.bottom="$t('folder.options')"></Button>
                    <ContextMenu ref="optionsmenu" :model="optionsContextMenuItems" />
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
                        <div @contextmenu="OnContextMenu($event, index)" :class="'main-content-item-list ' + (IsSelected(index) ? 'bg-primary' : '')" >
                            <i :class="(folder.directory) ? 'pi pi-folder' : 'pi pi-file'" style="font-size: 1rem"></i>
                            <span class="ml-2 main-content-item-text-list">{{ folder.name }}</span>
                        </div>
                    </div>
                </ScrollPanel>

                <ContextMenu ref="foldermenu" :model="folderContextMenuItems" />
                <ContextMenu ref="filemenu" :model="fileContextMenuItems" />
                <ContextMenu ref="multimenu" :model="multiFileContextMenuItems" />
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

        <Dialog :header="$t('folder.downloading')" v-model:visible="download.visible" class="display-name-dialog" :modal="true">
            <ScrollPanel style="width: 350px;  height: 150px; padding: 5px;" v-if="Object.keys(download.items).length">
                <template v-for="downloadItem in download.items">
                    <div  class="my-2" v-if="downloadItem">
                        <div class="mb-1">{{ downloadItem.name }}</div>
                        <ProgressBar :value="downloadItem.value" :showValue="false" />
                    </div>
                </template>
            </ScrollPanel>

            <div class="p-5 text-center text-primary" v-else>
                <div class="pi pi-check-circle" style="font-size: 3rem"></div>
                <div class="mt-3">{{ $t('folder.downloaded') }}</div>
            </div>
        </Dialog>

        <Dialog :header="$t('folder.uploading')" v-model:visible="upload.visible" class="display-name-dialog" :modal="true">
            <ScrollPanel style="width: 350px;  height: 150px; padding: 5px;" v-if="Object.keys(upload.items).length">
                <template v-for="uploadItem in upload.items">
                    <div  class="my-2" v-if="uploadItem">
                        <div class="mb-1">{{ uploadItem.name }}</div>
                        <ProgressBar :value="uploadItem.value" :showValue="false" />
                    </div>
                </template>
            </ScrollPanel>

            <div class="p-5 text-center text-primary" v-else>
                <div class="pi pi-check-circle" style="font-size: 3rem"></div>
                <div class="mt-3">{{ $t('folder.uploaded') }}</div>
            </div>
        </Dialog>

        <Dialog :header="$t('folder.rename')" v-model:visible="rename.visible" class="display-name-dialog" :modal="true">
            <div class="p-text-secondary">
                <InputText :placeholder="files[rename.index].name" v-model="rename.name" class="w-full mt-3" />
            </div>

            <template #footer>
                <div class="flex justify-content-center">
                    <Button :label="$t('folder.rename')" @click="Rename" />
                </div>
            </template>
        </Dialog>
    </Window>
</template>

<script>
import SSHClient from '@/services/ssh'
import Helpers from '@/services/helpers'
import Clipboard from '@/services/clipboard'

const { ipcRenderer } = require('electron')
var pathLib = require('path')

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
					icon: 'pi pi-folder-open',
                    command: () => this.LoadItem(this.files[this.selected[0]])
                },
                {
					label: this.$t('folder.download'),
					icon: 'pi pi-download',
                    command: this.Download
                },
                {
                    separator: true
                },
                {
					label: this.$t('folder.copy'),
					icon: 'pi pi-copy',
                    command: this.Copy
                },
                {
					label: this.$t('folder.cut'),
					icon: 'pi pi-clone',
                    command: this.Cut
                },
                {
                    separator: true
                },
                {
					label: this.$t('folder.rename'),
					icon: 'pi pi-pencil',
                    command: this.RenameDialog
                },
                {
					label: this.$t('folder.delete'),
					icon: 'pi pi-trash',
                    command: this.DeleteConfirm
                },
                {
					label: this.$t('folder.permissions'),
					icon: 'pi pi-cog'
                }
            ],

            fileContextMenuItems: [
                {
					label: this.$t('folder.edit'),
					icon: 'pi pi-file'
                },
                {
					label: this.$t('folder.download'),
					icon: 'pi pi-download',
                    command: this.Download
                },
                {
					label: this.$t('folder.execute'),
					icon: 'pi pi-dollar'
                },
                {
                    separator: true
                },
                {
					label: this.$t('folder.copy'),
					icon: 'pi pi-copy',
                    command: this.Copy
                },
                {
					label: this.$t('folder.cut'),
					icon: 'pi pi-clone',
                    command: this.Cut
                },
                {
                    separator: true
                },
                {
					label: this.$t('folder.rename'),
					icon: 'pi pi-pencil',
                    command: this.RenameDialog
                },
                {
					label: this.$t('folder.delete'),
					icon: 'pi pi-trash',
                    command: this.DeleteConfirm
                },
                {
					label: this.$t('folder.permissions'),
					icon: 'pi pi-cog'
                }
            ],

            multiFileContextMenuItems: [
                {
					label: this.$t('folder.copy'),
					icon: 'pi pi-copy',
                    command: this.Copy
                },
                {
					label: this.$t('folder.cut'),
					icon: 'pi pi-clone',
                    command: this.Cut
                },
                {
					label: this.$t('folder.download'),
					icon: 'pi pi-download',
                    command: this.Download
                },
                {
					label: this.$t('folder.delete'),
					icon: 'pi pi-trash',
                    command: this.DeleteConfirm
                }
            ],

            optionsContextMenuItems: [
                {
                    label: this.$t('folder.newfile'),
                    icon: 'pi pi-file',
                    command: () => this.NewFile(false)
                },
                {
                    label: this.$t('folder.upload'),
                    icon: 'pi pi-upload',
                    items: [
                        {
                            label: this.$t('folder.uploadfolder'),
                            icon: 'pi pi-folder-open',
                            command: () => this.Upload(true)
                        },
                        {
                            label: this.$t('folder.uploadfile'),
                            icon: 'pi pi-file',
                            command: () => this.Upload(false)
                        },
                    ]
                },
                {
                    label: this.$t('folder.refresh'),
                    icon: 'pi pi-refresh',
                    command: () => this.Load(this.currentPath)
                },
                {
                    label: this.$t('folder.paste'),
                    icon: 'pi pi-copy',
                    command: this.Paste
                }
            ],

            selected: [],

            download: {
                visible: false,
                items: {}
            },

            upload: {
                visible: false,
                items: {}
            },

            rename: {
                visible: false,
                name: '',
                index: 0
            },

            copying: 0,
            deleting: 0,
            moving: 0
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
                this.files = Helpers.ParseDirectory(result).sort((a, b) => {
                    if (a.directory && !b.directory)        return -1
                    else if (!a.directory && b.directory)   return 1

                    return 0
                })

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
            if (window.event.ctrlKey) {
                if (this.selected.includes(index)) {
                    this.selected.splice(this.selected.indexOf(index), 1)
                } else {
                    this.selected.push(index)
                }
                return
            }

            if (window.event.shiftKey) {
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

        ExecuteCreateFile (file) {
            SSHClient.CreateFile(file).then(() => {
                this.Load(this.currentPath)
            }).catch((err) => {
                this.error = err
            }).finally(() => {
                this.newFile.visible = false
            })
        },

        OnContextMenu (event, index) {
            if (! this.selected.includes(index)) {
                this.ClearSelected()
                this.SelectItem(index)
            }

            if (this.selected.length > 1) {
                this.$refs.multimenu.show(event)
                return
            }
            
            if (this.files[index].directory) {
                this.$refs.filemenu.hide()
                this.$refs.foldermenu.show(event)
            } else {
                this.$refs.foldermenu.hide()
                this.$refs.filemenu.show(event)
            }
        },

        Download () {
            let file = ipcRenderer.sendSync('select-folder')

            if (! file) return

            this.selected.forEach((index) => {
                let localPath = file + '/' + this.files[index].name

                if (this.files[index].directory) {
                    this.DownloadDirectory(this.files[index].name, localPath)
                } else {
                    this.DownloadFile(this.files[index].name, localPath)
                }

                
            })
        },

        DownloadFile (file, destination) {
            let source = this.currentPath + '/' + file

            let uid = Helpers.GetRandomString()

            this.download.visible = true

            this.download.items[uid] = {
                name: file,
                value: 0
            }

            SSHClient.Download(source, destination, {
                step: (transferred, chunk, total) => {
                    if (this.download.items[uid]) {
                        this.download.items[uid].value = (transferred * 100) / total
                    }
                }
            })
            .catch((err) => {
                this.$toast.add({severity:'error', summary: this.$t('folder.downloadfailed') + ': ' + source, detail: err, life: 6000});
            })
            .finally(() => {
                delete this.download.items[uid]
            })
        },

        async DownloadDirectory(directory, destination) {
            let result = await SSHClient.ListNested(this.currentPath + '/' + directory)

            if (! result) return

            let files = result.split('\n').sort((a, b) => {
                let isDirectoryA = a.substring(0, 1) === 'd'
                let isDirectoryB = b.substring(0, 1) === 'd'

                if (isDirectoryA && ! isDirectoryB) return -1
                if (! isDirectoryA && isDirectoryB) return 1

                return 0
            })
            
            files.forEach((file) => {
                let isDirectory = file.substring(0, 1) === 'd'
                let filename = file.substring(2)

                if (! filename) return

                if (isDirectory) {
                    Helpers.MakeDirectory(destination + '/' + filename)
                } else {
                    this.DownloadFile(directory + '/' + filename, destination + '/' + filename)
                }
            })
        },

        UploadContextMenu (event) {
            this.$refs.uploadmenu.show(event)
        },

        Upload (directory) {
            let files = null

            if (directory) {
                files = ipcRenderer.sendSync('select-multi-directory')
            } else {
                files = ipcRenderer.sendSync('select-multi-file')
            }

            if (! files) return

            files.forEach((file) => {
                let destination = pathLib.basename(file)

                if (directory) {
                    this.UploadDirectory(Helpers.ListDirectory(file), destination)
                } else {
                    this.UploadFile(file, destination)
                }
            })
        },

        UploadFile (source, file) {
            let destination = this.currentPath + '/' + file

            let uid = Helpers.GetRandomString()

            this.upload.visible = true

            this.upload.items[uid] = {
                name: file,
                value: 0
            }

            SSHClient.Upload(source, destination, {
                step: (transferred, chunk, total) => {
                    if (this.upload.items[uid]) {
                        this.upload.items[uid].value = (transferred * 100) / total
                    }
                }
            })
            .catch((err) => {
                this.$toast.add({severity:'error', summary: this.$t('folder.uploadfailed') + ': ' + source, detail: err, life: 6000});
            })
            .finally(() => {
                delete this.upload.items[uid]

                if (Object.keys(this.upload.items).length === 0) {
                    this.Load(this.currentPath)
                }
            })
        },

        UploadDirectory (items, file) {
            SSHClient.CreateDirectory(this.currentPath + '/' + file).then(() => {
                items.forEach((item) => {
                    if (item.directory) {
                        this.UploadDirectory(item.items, file + '/' + item.name)
                    } else {
                        this.UploadFile(item.path, file + '/' + item.name)
                    }
                })
            }).catch((err) => {
                this.$toast.add({severity:'error', summary: this.$t('folder.uploadfailed') + ': ' + file, detail: err, life: 6000});
            })
        },

        RenameDialog () {
            if (this.selected.length !== 1) return

            this.rename.name = ''
            this.rename.visible = true
            this.rename.index = this.selected[0]
        },

        Rename () {
            let file = this.files[this.rename.index].name

            if (file === this.rename.name) {
                this.rename.visible = false
                return
            }

            SSHClient.Move(this.currentPath + '/' + file, this.currentPath + '/' + this.rename.name).then(() => {
                this.Load(this.currentPath)
            }).catch((err) => {
                this.$toast.add({severity:'error', summary: this.$t('folder.renamefailed') + ': ' + file, detail: err, life: 6000});
            }).finally(() => {
                this.rename.visible = false
            })
        },

        DeleteConfirm () {
            if (this.selected.length === 0) return

            this.$confirm.require({
                message: this.$t('folder.deleteconfirmtext') + this.selected.length + this.$t('folder.deletefiles'),
                header: this.$t('folder.deleteconfirmtitle'),
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.Delete()
                }
            });
        },

        Delete () {
            this.deleting = this.selected.length
            this.selected.forEach((index) => {
                let file = this.files[index].name

                this.DeleteFile(file)
            })
        },

        DeleteFile(file) {
            SSHClient.Delete(this.currentPath + '/' + file)
            .catch((err) => {
                this.$toast.add({severity:'error', summary: this.$t('folder.deletefailed') + ': ' + file, detail: err, life: 6000});
            }).finally(() => {
                this.deleting--

                if (this.deleting === 0) {
                    this.Load(this.currentPath)
                }
            })
        },

        Options (event) {
            this.$refs.optionsmenu.show(event)
        },

        Copy () {
            if (this.selected.length === 0) return

            this.clipboardData = {
                type: 'copy',
                path: this.currentPath,
                files: []
            }
            

            this.selected.forEach((index) => {
                let file = this.files[index]

                this.clipboardData.files.push({
                    name: file.name,
                    directory: file.directory
                })
            })

            Clipboard.Set(this.clipboardData)
        },

        CopyFile (clipBoardData, file) {
            SSHClient.Copy(clipBoardData.path + '/' + file.name, this.currentPath + '/' + file.name, file.directory)
            .catch((err) => {
                this.$toast.add({severity:'error', summary: this.$t('folder.copyfailed') + ': ' + file.name, detail: err, life: 6000});
            }).finally(() => {
                this.copying--

                if (this.copying === 0) {
                    this.Load(this.currentPath)
                }
            })
        },

        Cut () {
            if (this.selected.length === 0) return

            this.clipboardData = {
                type: 'cut',
                path: this.currentPath,
                files: []
            }
            

            this.selected.forEach((index) => {
                let file = this.files[index]

                this.clipboardData.files.push({
                    name: file.name,
                    directory: file.directory
                })
            })

            Clipboard.Set(this.clipboardData)
        },

        CutFile (clipBoardData, file) {
            SSHClient.Move(clipBoardData.path + '/' + file.name, this.currentPath + '/' + file.name)
            .catch((err) => {
                this.$toast.add({severity:'error', summary: this.$t('folder.cutfailed') + ': ' + file.name, detail: err, life: 6000});
            }).finally(() => {
                this.moving--

                if (this.moving === 0) {
                    this.Load(this.currentPath)
                }
            })
        },

        Paste () {
            let clipBoardData = Clipboard.Get()

            if (Clipboard.IsEmpty()) {
                this.$toast.add({severity:'error', summary: this.$t('folder.clipboardempty'), life: 6000});
                return
            }

            if (clipBoardData.path === this.currentPath) {
                this.$toast.add({severity:'error', summary: this.$t('folder.pasteerror'), detail: this.$t('folder.clipboardsamedir'), life: 6000});
                return
            }

            if (clipBoardData.action === 'copy') {
                this.copying = clipBoardData.files.length
            } else {
                this.moving = clipBoardData.files.length
            }

            clipBoardData.files.forEach((file) => {
                if (clipBoardData.action === 'copy') {
                    this.CopyFile(clipBoardData, file)
                } else {
                    this.CutFile(clipBoardData, file)
                }
            })
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
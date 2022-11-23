<template>
    <div>
        <Window :onZIndexChange="onZIndexChange" :zIndex="zIndex" :onClose="onClose" :onMinimize="onMinimize" :title="$t('editor.title')" icon="/texteditor.png" :defaultSize="{width: 700, height: 450}">
            <div class="flex justify-content-center">
                <div class="path-bar">
                    <div class="path flex">
                        <div class="ml-2 py-1 px-2 text-gray-200">{{ $t('editor.file') }}</div>
                        <div class="text-primary file-name py-1 px-2 flex-grow-1">{{ currentFile ? currentFile : $t('editor.newfile') }}</div>

                        <Button icon="pi pi-angle-down" class="mr-1 p-button-text py-1" :label="$t('editor.filemenu')" @click="Options"></Button>

                        <ContextMenu ref="optionsmenu" :model="optionsContextMenuItems" />
                    </div>
                </div>
            </div>

            <div class="flex justify-content-center h-full">
                <div class="editor-container flex" @contextmenu="Options">
                    <div class="w-full text-center flex " v-if="loading">
                        <ProgressSpinner class="h-full" />
                    </div>

                    <div class="line-numbers" v-show="!loading">
                        <div v-for="_, index in text.split('\n')" :key="index" class="line-number">{{ index + 1}}</div>
                    </div>
                    <div class="editor flex-grow-1" v-show="!loading">
                        <textarea ref="editor" spellcheck="false" class="text-editor w-full h-full" v-model="text" @keyup="OnKeyUp"></textarea>
                    </div>
                </div>
            </div>
        </Window>

        <Modal :header="$t('editor.saveas')" v-model="saveAs.visible" class="p-5">
            <div class="px-3">
                <div class="p-text-secondary">
                    <InputText :placeholder="$t('editor.name')" v-model="saveAs.name" class="w-full mt-3 input-bg" />
                </div>

                <div class="mt-2 flex">
                    <span class="p-input-icon-left flex-grow-1">
                        <i class="pi pi-folder" />
                        <InputText disabled type="text" v-model="saveAs.path" class="w-full input-bg" />
                    </span>

                    <Button icon="pi pi-folder" class="p-button-text ml-2" @click="saveAs.fileDialog = true" />
                </div>

                <div class="flex justify-content-center mt-2">
                    <Button :label="$t('editor.save')" @click="SaveAs" />
                </div>
            </div>
        </Modal>

        <FileDialog v-if="saveAs.fileDialog" type="folders" :Finish="SetPath" :Cancel="CancelDialog" />
    </div>
</template>

<script>
import SSHClient from '@/services/ssh'

import Helpers from '@/services/helpers'

import Window from '@/components/windows/Window'
import FileDialog from '@/components/windows/FileDialog'
import Modal from '@/components/windows/Modal'

export default {
    name: 'Editor',

    components: {
        Window,
        FileDialog,
        Modal
    },

    props: {
        file: {
            type: String,
            default: ''
        },

        onClose: {
            type: Function,
            default: () => {}
        },

        onMinimize: {
            type: Function,
            default: () => {}
        },

        zIndex: {
            type: Number,
            default: 1500
        },

        onZIndexChange: {
            type: Function,
            default: () => {}
        }
    },

    data () {
        return {
            text: '',

            loading: true,

            currentFile: '',

            optionsContextMenuItems: [
                {
                    label: this.$t('editor.save'),
                    icon: 'pi pi-save',
                    command: this.Save
                },
                {
                    label: this.$t('editor.saveas'),
                    icon: 'pi pi-clone',
                    command: this.SaveAsDialog
                }
            ],

            changed: false,

            saveAs: {
                visible: false,
                name: '',
                path: Helpers.GetHomeDirectory(),
                fileDialog: false
            }
        }
    },

    mounted () {
        if (this.file) {
            this.Read(this.file)
        }

        this.loading = false
        this.$refs.editor.addEventListener('scroll', this.OnScroll)
    },

    beforeDestroy () {
        this.$refs.editor.removeEventListener('scroll', this.OnScroll)
    },

    methods: {
        Read (path) {
            this.loading = true

            SSHClient.ReadFile(path).then((result) => {
                this.currentFile = path
                this.text = result
            }).catch((err) => {
                this.currentFile = ''
                this.$toast.add({ severity: 'error', summary: this.$t('editor.error') + path, detail: err, life: 3000 })
            }).finally(() => {
                this.loading = false
            })

        },

        Options (event) {
            this.$refs.optionsmenu.toggle(event)
        },

        Save () {
            if (! this.currentFile) {
                this.SaveAsDialog()
                return
            }

            if (! this.changed) return

            this.loading = true

            SSHClient.WriteFile(this.currentFile, this.text)
            .then(() => {
                this.changed = false
                this.$toast.add({ severity: 'success', summary: this.$t('editor.saveconfirm'), life: 3000 })
            })
            .catch((err) => {
                this.$toast.add({ severity: 'error', summary: this.$t('editor.saveerror') + this.currentFile, detail: err, life: 6000 })
            }).finally(() => {
                this.loading = false
            })
        },

        OnScroll (e) {
            const editor = this.$refs.editor
            const lineNumbers = this.$el.querySelector('.line-numbers')

            lineNumbers.scrollTop = editor.scrollTop
        },

        OnKeyUp (e) {
            this.changed = true

            if (e.ctrlKey && e.key === 's') {
                this.Save()
            }
        },

        SaveAsDialog () {
            this.saveAs.visible = true
        },

        SetPath (result) {
            this.saveAs.path = result.path + '/' + result.name
            this.saveAs.fileDialog = false
        },

        CancelDialog () {
            this.saveAs.fileDialog = false
        },

        SaveAs () {
            if (! this.saveAs.name) {
                return
            }

            this.loading = true
            this.saveAs.visible = false

            SSHClient.WriteFile(this.saveAs.path + '/' + this.saveAs.name, this.text)
            .then(() => {
                this.$toast.add({ severity: 'success', summary: this.$t('editor.saveconfirm'), life: 3000 })
                this.currentFile = this.saveAs.path + '/' + this.saveAs.name
                this.changed = false
            })
            .catch((err) => {
                this.$toast.add({ severity: 'error', summary: this.$t('editor.saveerror') + this.saveAs.path + '/' + this.saveAs.name, detail: err, life: 6000 })
            }).finally(() => {
                this.loading = false
            })
        }
    }
}
</script>

<style>
    .unselectable-text {
        user-select: none;
    }

    .path-bar {
        margin: 5px;
        padding: 5px;
        background-color: #00000049 !important;
        border-radius: 5px;
        width: 98%;
    }

    .editor-container {
        background-color: #0000008a !important;
        border-radius: 5px;
        width: 98%;
        height: calc(100% - 100px);
    }

    .file-name {
        background-color: #00000049 !important;
        border-radius: 5px;
    }

    .line-numbers {
        background-color: #00000049 !important;
        border-radius: 5px;
        width: 35px;
        overflow: hidden;
        padding-bottom: 20px;
    }

    .line-number {
        margin-bottom: 4px;
        text-align: center;
        margin-top: 2px;
        color: #6d6d6d;
    }

    .text-editor {
        background-color: #00000049 !important;
        border-radius: 5px;
        border: none;
        font-size: 1rem;
        line-height: 25px;
        white-space: nowrap;
        resize: none;
        scroll-padding: 50px 0 0 50px;
    }

    .text-editor:focus {
        outline: none;
    }

    .input-bg {
        background-color: #000000a1 !important;
        border-radius: 5px;
    }

    ::-webkit-scrollbar {
        margin-top: 50px;
        width: 10px;
    }

    ::-webkit-scrollbar-track {
        background: #303030; 
    }

    ::-webkit-scrollbar-thumb {
        background: rgb(87, 87, 87); 
    }

    ::-webkit-scrollbar-thumb:hover {
        background: #555; 
    }

    ::-webkit-resizer {
        background-color: transparent !important;
    }
</style>
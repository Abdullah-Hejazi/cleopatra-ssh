<template>
    <Window :title="$t('editor.title')" icon="/texteditor.png" :defaultSize="{width: 700, height: 450}">
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
            <div class="text-editor" @contextmenu="Options" @keydown="OnKeyDown">
                <PrismEditor @input="changed = true" :tabSize="4" class="text-area" v-model="text" :highlight="HighLight" lineNumbers />
            </div>
        </div>
    </Window>
</template>

<script>
import SSHClient from '@/services/ssh'

import Window from '@/components/windows/Window'

import { PrismEditor } from 'vue-prism-editor'
import 'vue-prism-editor/dist/prismeditor.min.css'


export default {
    name: 'Editor',

    components: {
        Window,
        PrismEditor
    },

    props: {
        file: {
            type: String,
            default: ''
        }
    },

    data () {
        return {
            text: '',

            loading: true,
            error: '',

            currentFile: '',

            optionsContextMenuItems: [
                {
                    label: this.$t('editor.save'),
                    icon: 'pi pi-save',
                    command: this.Save
                },
                {
                    label: this.$t('editor.saveas'),
                    icon: 'pi pi-clone'
                }
            ],

            changed: false

        }
    },

    mounted () {
        if (this.file) {
            this.currentFile = this.file
            this.Read(this.currentFile)
        }
    },

    methods: {
        Read (path) {
            this.loading = true
            this.error = ''

            SSHClient.ReadFile(path).then((result) => {
                this.text = result
            }).catch((err) => {
                this.error = err
            }).finally(() => {
                this.loading = false
            })

        },

        OnKeyDown (e) {
            if (e.ctrlKey && e.key === 's') {
                this.Save()
            }
        },

        HighLight (text) {
            return '<div style="color: white;">' + text + '</div>'
        },

        Options (event) {
            this.$refs.optionsmenu.toggle(event)
        },

        Save () {
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

    .text-editor {
        background-color: #0000008a !important;
        border-radius: 5px;
        width: 98%;
        padding: 10px;
        height: calc(100% - 100px);
    }

    .prism-editor__container {
        height: 100%;
    }

    .prism-editor__textarea {
        height: 100%;
        resize: vertical;
    }

    .prism-editor__textarea:focus {
        outline: none;
    }

    .file-name {
        background-color: #00000049 !important;
        border-radius: 5px;
    }

    .prism-editor__line-number {
        color: #7a7a7a;
    }
</style>
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
            <div class="editor-container flex" @contextmenu="Options">
                <div class="line-numbers">
                    <div v-for="_, index in text.split('\n')" :key="index" class="line-number">{{ index + 1}}</div>
                </div>
                <div class="editor flex-grow-1">
                    <textarea ref="editor" spellcheck="false" class="text-editor w-full h-full" v-model="text" @input="onInput"></textarea>
                </div>
            </div>
        </div>
    </Window>
</template>

<script>
import SSHClient from '@/services/ssh'

import Window from '@/components/windows/Window'

export default {
    name: 'Editor',

    components: {
        Window
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

        this.$refs.editor.focus()
        this.$refs.editor.addEventListener('scroll', this.onScroll)
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
        },

        onScroll (e) {
            const editor = this.$refs.editor
            const lineNumbers = this.$el.querySelector('.line-numbers')

            lineNumbers.scrollTop = editor.scrollTop
        },
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
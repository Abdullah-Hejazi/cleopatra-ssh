<template>
    <Window :title="$t('editor.title')" icon="/texteditor.png" :defaultSize="{width: 700, height: 450}">
        <div class="flex justify-content-center">
            <div class="path-bar">
                <div class="path flex">
                    <div class="ml-2">{{ $t('editor.file') }}</div>
                    <div class="ml-2 text-primary">{{ file ? file : $t('editor.newfile') }}</div>
                </div>
            </div>
        </div>

        <div class="text-editor w-full h-full text-center">
            <div class="h-full text-editor-area text-left flex">
                <div class="line-numbers">
                    <div v-for="_, index in text.split('\n')" :key="index" class="line-number">
                        {{ index + 1 }}
                    </div>
                </div>

                <div contenteditable="true" class="w-full h-full" ref="editable" @input="onInput"></div>

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
        openFile: {
            type: String,
            default: ''
        }
    },

    data () {
        return {
            text: '',

            loading: true,
            error: '',

            file: ''
        }
    },

    mounted () {
        if (this.openFile) {
            this.Read(this.openFile)
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

        onInput (e) {
            console.log(e.target.innerText)
            this.text = e.target.innerText
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

    .text-editor-area {
        margin: 5px;
        background-color: #0000008a !important;
        border-radius: 5px;
        resize: none;
        resize: vertical;
        max-height: 200px;
        min-height: 200px;
        width: 98%;
        border: none;
        padding: 10px 10px 10px 25px;
        gap: 10px;
        line-height: 21px;
    }

    .text-editor-area:focus {
        outline: none;
    }

    .line-numbers {
        width: 20px;
    }
</style>
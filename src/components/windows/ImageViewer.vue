<template>
    <div>
        <Window :onZIndexChange="onZIndexChange" :zIndex="zIndex" :onClose="onClose" :onMinimize="onMinimize" :title="$t('general.ImageViewer')" icon="/imageviewer.png" :defaultSize="{width: 800, height: 550}">
            <div class="flex justify-content-center">
                <div class="path-bar">
                    <div class="path flex">
                        <div class="ml-2 py-1 px-2 text-gray-200">{{ $t('editor.file') }}</div>
                        <div class="text-primary file-name py-1 px-2 flex-grow-1">{{ currentFile ? currentFile : $t('image.noimage') }}</div>

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

                    <div class="w-full text-center" style="padding-top: 80px;" v-if="!loading && !currentFile">
                        <Button icon="pi pi-image" :label="$t('image.select')" @click="SelectImageDialog" />
                    </div>

                    <div class="w-full text-center flex justify-content-center" v-if="!loading && currentFile">
                        <img :src="image" />
                    </div>
                </div>
            </div>
        </Window>

        <FileDialog v-if="openDialog" type="images" :Finish="SetPath" :Cancel="CancelDialog" />
    </div>
</template>

<script>
import SSHClient from '@/services/ssh'

import Window from '@/components/windows/Window'
import FileDialog from '@/components/windows/FileDialog'

export default {
    name: 'ImageViewer',

    components: {
        Window,
        FileDialog
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
            loading: false,
            image: '',

            currentFile: '',

            optionsContextMenuItems: [
                {
                    label: this.$t('image.open'),
                    icon: 'pi pi-folder',
                    command: () => this.SelectImageDialog()
                }
            ],

            openDialog: false
        }
    },

    mounted () {
        if (this.file) {
            this.LoadImage(this.file)
        }
    },

    methods: {
        LoadImage (path) {
            this.loading = true
            this.currentFile = ''

            SSHClient.Open(path).then((result) => {
                this.image = 'data:image/png;base64,' + result
                this.currentFile = path
            }).catch((err) => {
                this.currentFile = ''
                this.$toast.add({ severity: 'error', summary: this.$t('image.error') + path, detail: err, life: 3000 })
            }).finally(() => {
                this.loading = false
            })

        },

        Options (event) {
            this.$refs.optionsmenu.toggle(event)
        },

        SelectImageDialog () {
            this.openDialog = true
        },

        CancelDialog () {
            this.openDialog = false
        },

        SetPath (file) {
            this.openDialog = false
            this.LoadImage(file.path + '/' + file.name)
        }
    }
}
</script>

<style scoped>
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
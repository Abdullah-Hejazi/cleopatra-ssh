<template>
    <div>
        <Window defaultLocation="center" :noMaximize="true" :onZIndexChange="onZIndexChange" :zIndex="zIndex" :onClose="onClose" :onMinimize="onMinimize" :title="$t('general.Settings')" icon="/settings.png" :defaultSize="{width: 450, height: 280}">
            <div class="p-3">
                <div class="text-lg text-center"> {{ $t('desktop.changebackground')}} </div>
                <div class="mt-2 flex">
                    <span class="p-input-icon-left flex-grow-1">
                        <i class="pi pi-sort-alt" />
                        <Dropdown @change="changeImageDialog.path = ''" v-model="changeImageDialog.type" :options="backgroundTypes" optionLabel="name" class="w-full" />
                    </span>
                </div>

                <div class="mt-3 flex" v-if="changeImageDialog.type.value === 'file'">
                    <span class="p-input-icon-left flex-grow-1">
                        <i class="pi pi-folder" />
                        <InputText :placeholder="$t('desktop.imagepath')" disabled type="text" v-model="changeImageDialog.path" class="w-full input-bg" />
                    </span>

                    <Button icon="pi pi-folder" class="p-button-text ml-2" @click="SelectImagePath" />
                </div>

                <div class="mt-3 flex" v-if="changeImageDialog.type.value === 'url'">
                    <span class="p-input-icon-left flex-grow-1">
                        <i class="pi pi-link" />
                        <InputText :placeholder="$t('desktop.imageurl')" type="text" v-model="changeImageDialog.path" class="w-full input-bg" />
                    </span>
                </div>

                <div class="mt-4">
                    <div class="flex justify-content-center mt-2">
                        <Button :label="$t('desktop.removebackground')" class="p-button-text p-button-secondary" @click="RemoveBackground" />
                        <Button :label="$t('desktop.changebackground')" @click="ChangeBackground" />
                    </div>
                </div>
            </div>
        </Window>
    </div>
</template>

<script>
import Window from '@/components/windows/Window'

const { ipcRenderer } = require('electron')
const fs = require('fs')

export default {
    name: 'Settings',

    components: {
        Window
    },

    props: {
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
        },

        onChangeBackground: {
            type: Function,
            default: () => {}
        },

        onRemoveBackground: {
            type: Function,
            default: () => {}
        },
    },

    data () {
        return {
            changeImageDialog: {
                path: '',
                type: {
                    name: this.$t('desktop.fromfile'),
                    value: "file"
                },
            },

            backgroundTypes: [
                {
                    name: this.$t('desktop.fromfile'),
                    value: "file"
                },
                {
                    name: this.$t('desktop.fromurl'),
                    value: "url"
                }
            ],
            
        }
    },

    methods: {
        ChangeBackground () {
            if (this.changeImageDialog.path.length === 0) return

            let img = this.changeImageDialog.type.value === 'url' ?
                        this.changeImageDialog.path :
                        'data:image/jpeg;base64,' + fs.readFileSync(this.changeImageDialog.path).toString('base64') 

            localStorage.setItem('desktopBackground', img)

            this.onChangeBackground(img)
        },

        SelectImagePath () {
            let files = ipcRenderer.sendSync('select-image')

            if (files && files.length) {
                this.changeImageDialog.path = files[0]
            }
        },

        RemoveBackground () {
            localStorage.removeItem('desktopBackground')
            this.onRemoveBackground()
        }
    }
}
</script>

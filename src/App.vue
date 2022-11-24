<template>
    <div>
        <ConfirmDialog />
        <Toast position="bottom-left" />

        <TitleBar :settings="OpenSettings" />


        <p id="cleopatra-ssh-loading-module">
            <ProgressSpinner strokeWidth="3" class="cleopatra-ssh-loading-module-spinner" />
        </p>

        <div>
            <div class="topbar-placeholder"></div>
            <RouterView />
        </div>

        <Dialog class="settings-dialog" :header="$t('general.settings')" v-model:visible="settings" :modal="true">
            <div>
                <div class="mt-0">
                    <p class="mb-1">{{ $t('general.language') }}</p>
                    <Dropdown :placeholder="$t('general.language')" class="w-full" v-model="language" :options="$i18n.availableLocales" @change="SelectLanguage" />
                </div>
            </div>

            <Divider class="my-5" />

            <div class="text-center">
                <div>
                    Developed with love by <a class="text-primary" href="https://twitter.com/AbdullahHejazi6" target="_blank">Abdullah Hejazi</a>
                </div>

                <div class="flex justify-content-center mt-5">
                    <a href="https://twitter.com/AbdullahHejazi6" target="_blank" class="text-primary mx-3">
                        <span class="pi pi-twitter text-3xl"></span>
                    </a>

                    <a href="https://github.com/Abdullah-Hejazi" target="_blank" class="text-primary mx-3">
                        <span class="pi pi-github text-3xl"></span>
                    </a>

                    <a href="https://www.facebook.com/a.m.a.hejazi/" target="_blank" class="text-primary mx-3">
                        <span class="pi pi-facebook text-3xl"></span>
                    </a>
                </div>
            </div>
        </Dialog>
    </div>
</template>

<script>

import TitleBar from '@/components/TitleBar'

export default {
    name: 'Cleopatra SSH',

    data() {
        return {
            settings: false,

            language: ''
        }
    },

    components: {
        TitleBar
    },

    methods: {
        SelectLanguage() {
            if (this.language) {
                this.$i18n.locale = this.language;
                localStorage.setItem('language', this.language);
            }
        },

        OpenSettings() {
            this.settings = true
        }
    },

    created() {
        let language = localStorage.getItem('language')

        if (language) {
            this.language = localStorage.getItem('language');
            this.SelectLanguage()
        }
    }
}

</script>

<style>
body {
    background-color: var(--surface-ground);
    font-family: var(--font-family);
    font-weight: 400;
    color: var(--text-color);
    margin: 0px;
    overflow: hidden;
}

.settings-dialog {
    width: 400px;
    max-width: 90vw;
}

#cleopatra-ssh-loading-module {
    position: fixed;
    width: 100vw;
    height: 100vh;
    top: 55px;
    left: 0px;
    margin: 0px;
    padding: 0px;
    background-color: rgba(0, 0, 0, 0.493);
    z-index: 9998;
    display: none;
}

.cleopatra-ssh-loading-module-spinner {
    position: fixed;
    z-index: 9999;
    top: calc(50vh - 50px);
    left: calc(50vw - 50px);
}


.scrollbar-themed {
    margin-top: 55px;
    width: 100%;
    height: calc(100vh - 63px);
}

.p-scrollpanel-content {
    padding: 0px;
}

.topbar-placeholder {
    height: 55px;
    width: 100px;
}

</style>

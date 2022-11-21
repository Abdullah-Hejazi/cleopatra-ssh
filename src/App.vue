<script>

import TitleBar from '@/components/TitleBar'

export default {
    name: 'Cleopatra SSH',

    data() {
        return {
            themes: [
                "arya-blue",
                "arya-green",
                "arya-orange",
                "arya-purple",
                "bootstrap4-dark-blue",
                "bootstrap4-dark-purple",
                "bootstrap4-light-blue",
                "bootstrap4-light-purple",
                "fluent-light",
                "lara-dark-blue",
                "lara-dark-indigo",
                "lara-dark-purple",
                "lara-dark-teal",
                "lara-light-blue",
                "lara-light-indigo",
                "lara-light-purple",
                "lara-light-teal",
                "luna-amber",
                "luna-blue",
                "luna-green",
                "luna-pink",
                "md-dark-deeppurple",
                "md-dark-indigo",
                "md-light-deeppurple",
                "md-light-indigo",
                "mdc-dark-deeppurple",
                "mdc-dark-indigo",
                "mdc-light-deeppurple",
                "mdc-light-indigo",
                "nova",
                "nova-accent",
                "nova-alt",
                "nova-vue",
                "rhea",
                "saga-blue",
                "saga-green",
                "saga-orange",
                "saga-purple",
                "tailwind-light",
                "vela-blue",
                "vela-green",
                "vela-orange",
                "vela-purple"
            ],

            settings: false,
            about: false,

            theme: '',
            language: ''
        }
    },

    components: {
        TitleBar
    },

    methods: {
        async SelectTheme() {
            this.themes.forEach(theme => {
                document.getElementById(theme).rel = '';
            })

            document.getElementById(this.theme).rel = 'stylesheet';

            localStorage.setItem('theme', this.theme);
        },

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
        // load language
        let language = localStorage.getItem('language')

        if (language) {
            this.language = localStorage.getItem('language');
            this.SelectLanguage()
        }

        this.themes.forEach(theme => {
            let link = document.createElement('link');
            link.rel = "";
            link.id = theme;
            link.href = '/themes/' + theme + '.css';
            document.head.appendChild(link);
        })

        let link = document.createElement('link');
        link.rel = "stylesheet";
        link.href = 'primeicons.css';
        document.head.appendChild(link);

        this.theme = localStorage.getItem('theme') ?? 'arya-blue';
        this.SelectTheme()
    }
}

</script>

<template>
    <div>
        <ConfirmDialog />
        <Toast position="bottom-left" />

        <TitleBar :settings="OpenSettings" :about="() => about = true" />


        <p id="cleopatra-ssh-loading-module">
            <ProgressSpinner strokeWidth="3" class="cleopatra-ssh-loading-module-spinner" />
        </p>

        <ScrollPanel class="scrollbar-themed">
            <div>
                <RouterView />
            </div>
        </ScrollPanel>

        <Dialog class="settings-dialog" :header="$t('general.settings')" v-model:visible="settings" :modal="true">
            <div>
                <div>
                    <p class="my-1">{{ $t('general.themes') }}</p>
                    <Dropdown :placeholder="$t('general.themes')" class="w-full" v-model="theme" :options="themes" @change="SelectTheme" />
                </div>

                <div class="mt-5">
                    <p class="mb-1">{{ $t('general.language') }}</p>
                    <Dropdown :placeholder="$t('general.language')" class="w-full" v-model="language" :options="$i18n.availableLocales" @change="SelectLanguage" />
                </div>
            </div>
        </Dialog>

        <Dialog class="settings-dialog" :header="$t('general.about') + ' Cleopatra SSH'" v-model:visible="about" :modal="true">
            <div>
                <div class="mb-5">
                    Cleopatra SSH is a visual SSH Client.
                </div>
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

<style>
body {
    background-color: var(--surface-ground);
    font-family: var(--font-family);
    font-weight: 400;
    color: var(--text-color);
    margin: 0px;
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

</style>

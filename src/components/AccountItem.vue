<template>
    <div class="p-4 border-round surface-overlay mb-3 hover:surcace-ground shadow-2">
        <div class="flex justify-content-between">
            <div class="flex align-items-center cursor-pointer hover:text-primary" @click="load(index)">
                <div class="mr-3">
                    <i class="pi pi-server text-xl"></i>
                </div>
                <div>
                    <div class="text-lg">{{ account.displayName }}</div>
                    <div class="text-xs">
                        {{ account.username }}@{{ account.host }}<span class="text-gray-500">:{{ account.port }}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        {{ authenticationType }} {{ $t('login.authentication') }}
                    </div>
                </div>
            </div>
            <div>
                <Button icon="pi pi-pencil" class="p-button-text p-button-rounded p-button-warning" @click="(editModal = true)" />
                <Button icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger" @click="remove(index)" />
            </div>
        </div>

        <Dialog v-model:visible="editModal" :modal="true" :closable="false" :dismissableMask="true" :showHeader="false" :baseZIndex="10000">
            <div class="account-item-card mx-auto surface-card pt-5">
                <div class="text-center mb-5">
                    <img src="@/assets/logo2.png" alt="Cleopatra SSH" width="50" class="mb-3">
                    <div class="text-900 text-3xl font-medium mb-3">{{ $t('login.editaccount') }}</div>
                </div>

                <div>
                    <div class="col-12">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-pencil"></i>
                            </span>
                            <InputText :placeholder="$t('login.displayName')" v-model="loginData.displayName" />
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-user"></i>
                            </span>
                            <InputText :placeholder="$t('login.username')" v-model="loginData.username" />
                        </div>
                    </div>

                    <div class="col">
                        <div>
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-server"></i>
                                </span>
                                <InputText :placeholder="$t('login.host')" v-model="loginData.host"
                                    v-tooltip.right="$t('login.defaultsTo') + ': localhost'" />
                            </div>
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-sort-alt"></i>
                            </span>
                            <InputNumber :placeholder="$t('login.port')" v-model="loginData.port" mode="decimal" :use-grouping="false"
                                v-tooltip.right="$t('login.defaultsTo') + ': 22'" />
                        </div>
                    </div>

                    <div class="col-12">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-caret-down"></i>
                            </span>
                            <Dropdown v-model="loginData.authType" :options="authenticationTypes" optionLabel="name" />
                        </div>
                    </div>

                    <div class="scalein" v-if="loginData.authType.value === 'password'">
                        <div class="col-12">
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-lock"></i>
                                </span>
                                <Password :placeholder="$t('login.password')" v-model="loginData.password" toggle-mask :feedback="false" />
                            </div>
                        </div>
                    </div>

                    <div class="scalein" v-if="loginData.authType.value === 'privatekey'">
                        <div class="col-12 flex">
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-lock"></i>
                                </span>
                                <InputText :placeholder="$t('login.keypath')" v-model="loginData.privateKey" disabled />
                            </div>
                            <Button class="ml-2 p-button-text" icon="pi pi-folder-open" @click="SelectPrivateKeyPath" />
                        </div>

                        <div class="col-12 flex">
                            <div class="p-inputgroup">
                                <span class="p-inputgroup-addon">
                                    <i class="pi pi-key"></i>
                                </span>
                                <InputText type="password" :placeholder="$t('login.passphrase')" v-model="loginData.passPhrase" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="flex justify-content-between col">
                    <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="(editModal = false)" />
                    <Button label="Save" icon="pi pi-check" @click="Save" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script>

const { ipcRenderer } = require('electron')

export default {
    name: 'AccountItem',

    props : [
        'index',
        'account',
        'remove',
        'load',
        'edit'
    ],

    mounted () {
        this.loginData = this.account
    },

    data () {
        return {
            editModal: false,

            loginData: {
                username: '',
                password: '',
                host: '',
                port: null,
                displayName: '',
                authType: {
                    name: 'Password',
                    value: 'password'
                },
                privateKey: '',
                passPhrase: ''
            },
            authenticationTypes: [
                {
                    name: 'Password',
                    value: 'password'
                },
                {
                    name: 'Private Key',
                    value: 'privatekey'
                }
            ],
        }
    },

    computed: {
        authenticationType() {
            if (this.account.authType.value === 'password') {
                return 'Password'
            } else if (this.account.authType.value === 'privatekey') {
                return 'Private Key'
            }
            
            return 'Unknown'
        }
    },

    methods: {
        Save () {
            this.edit(this.index, this.loginData)
            this.editModal = false
        },

        SelectPrivateKeyPath () {
            let file = ipcRenderer.sendSync('select-file')

            if (! file) return

            this.loginData.privateKey = file[0]
        }
    }
}
</script>

<style>
    .account-item-card {
        width: 350px;
        max-width: 90%;
    }
</style>
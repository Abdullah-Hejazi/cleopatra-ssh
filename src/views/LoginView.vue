<template>
    <div class="login">
        <div class="loginData-card loginData-margin mx-auto surface-card p-4 shadow-2 border-round">
            <div class="text-center mb-5">
                <img src="@/assets/logo2.png" alt="Cleopatra SSH" width="50" class="mb-3">
                <div class="text-900 text-3xl font-medium mb-3">{{ $t('login.title') }}</div>
            </div>

            <InlineMessage severity="error" v-if="error" class="mb-3 w-full scalein">
                {{ error }}
            </InlineMessage>

            <div>
                <div class="col-12">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-user"></i>
                        </span>
                        <InputText :placeholder="$t('login.username')" v-model="loginData.username" />
                    </div>
                </div>

                <div class="flex">
                    <div class="col-9">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-server"></i>
                            </span>
                            <InputText :placeholder="$t('login.host')" v-model="loginData.host"
                                v-tooltip.right="$t('login.defaultsTo') + ': localhost'" />
                        </div>
                    </div>

                    <div class="col-3">
                        <div class="p-inputgroup">
                            <span class="p-inputgroup-addon">
                                <i class="pi pi-sort-alt"></i>
                            </span>
                            <InputNumber :placeholder="$t('login.port')" v-model="loginData.port" mode="decimal" :use-grouping="false"
                                v-tooltip.right="$t('login.defaultsTo') + ': 22'" />
                        </div>
                    </div>
                </div>

                <div class="col-12">
                    <div class="p-inputgroup">
                        <span class="p-inputgroup-addon">
                            <i class="pi pi-sort-alt"></i>
                        </span>
                        <Dropdown v-model="loginData.authType" :options="authenticationTypes" optionLabel="name" placeholder="Select Authentication Type" />
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
                            <InputText :placeholder="$t('login.passphrase')" v-model="loginData.passPhrase" />
                        </div>
                    </div>
                </div>

                <div class="text-center mt-3">
                    <Button :label="$t('login.login')" class="login-button" @click="Login" />
                    
                    <div class="flex justify-content-between">
                        <Button
                            :label="$t('login.saveAccount')"
                            class="p-button-text p-button-plain"
                            @click="displayNameDialog = true"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div class="loginData-card mx-auto surface-card pt-3 shadow-2 border-round mt-3">
            <div class="text-center">
                <div class="text-600 text-2xl font-medium">{{ $t('login.savedAccounts') }}</div>
            </div>

            <div class="px-5">
                <Divider />
            </div>

            <div class="p-3">
                <AccountItem
                    v-for="(account, index) in savedAccounts"
                    :key="index"
                    :account="account"
                    :index="index"
                    :remove="RemoveAccount"
                    :load="SelectAccount"
                />

                <div class="text-center text-600 mb-3" v-if="savedAccounts.length == 0">
                    {{ $t('login.noSavedAccounts') }}
                </div>
            </div>
        </div>

        <Dialog :header="$t('login.saveAccount')" v-model:visible="displayNameDialog" class="display-name-dialog" :modal="true">
            <div>
                <InputText :placeholder="$t('login.displayName')" v-model="loginData.displayName" class="w-full mt-3" />
            </div>

            <div class="mt-3" v-if="loginData.authType.value === 'password'">
                <Checkbox v-model="savePassword" :binary="true" class="mr-1" />
                {{ $t('login.savePassword') }} ?
            </div>

            <div class="p-text-secondary" v-if="savePassword && loginData.authType.value === 'password'">
                <p class="mb-0">
                    <b>{{ $t('login.passwordNote') }}</b>: {{ $t('login.passwordNoteText') }}
                </p>
            </div>

            <template #footer>
                <div class="flex justify-content-between">
                    <Button
                        :label="$t('general.cancel')"
                        @click="displayNameDialog = false"
                        class="p-button-text"
                    />
                    <Button :label="$t('general.save')" @click="SaveAccount" />
                </div>
            </template>
        </Dialog>

        <Dialog :header="$t('login.typePassword')" v-model:visible="selectedAccount" class="display-name-dialog" :modal="true">
            <div class="p-text-secondary">
                <InputText type="password" :placeholder="$t('login.password')" v-model="selectedAccountPassword" class="w-full mt-3" />
            </div>

            <template #footer>
                <div class="flex justify-content-between">
                    <Button
                        :label="$t('general.cancel')"
                        @click="selectedAccount = false"
                        class="p-button-text"
                    />
                    <Button :label="$t('login.login')" @click="LoadAccount" />
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script>
import AccountItem from '@/components/AccountItem'
import SSHClient from '@/services/ssh'

const { ipcRenderer } = require('electron')

export default {
    name: 'LoginView',

    components: {
        AccountItem
    },

    data() {
        return {
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
            error: '',
            displayNameDialog: false,
            savedAccounts: [],
            selectedAccount: false,
            selectedAccountIndex: 0,
            selectedAccountPassword: '',
            savePassword: false
        }
    },

    async mounted () {
        this.savedAccounts = localStorage.getItem('savedAccounts') ? JSON.parse(localStorage.getItem('savedAccounts')) : []
    },

    methods: {
        async Login() {
            this.PerformLogin(this.loginData)
        },

        SaveAccount() {
            let data = {
                host: this.loginData.host == '' ? 'localhost' : this.loginData.host,
                port: this.loginData.port == null ? 22 : this.loginData.port,
                authType: this.loginData.authType,
                username: this.loginData.username,
                displayName: this.loginData.displayName,
                savePassword: (this.loginData.authType.value === 'password') ? this.savePassword : false,
                privateKey: this.loginData.privateKey,
                passPhrase: this.loginData.passPhrase
            }

            if (this.savePassword && this.loginData.authType.value === 'password') {
                data.password = this.loginData.password
            }

            this.savedAccounts.push(data)
            localStorage.setItem('savedAccounts', JSON.stringify(this.savedAccounts))

            this.displayNameDialog = false
        },

        RemoveAccount(index) {
            this.savedAccounts.splice(index, 1);
            localStorage.setItem('savedAccounts', JSON.stringify(this.savedAccounts))
        },

        async PerformLogin(account) {
            SSHClient.ClearConnection()
            this.$loading.show()

            this.error = ''

            SSHClient.EstablishConnection(account)
            .then(() => {
                this.$router.push('/desktop')
            })
            .catch((error) => {
                this.error = error
                SSHClient.ClearConnection()
            }).finally(() => {
                this.$loading.hide()
            })
        },

        async LoadAccount() {
            this.selectedAccount = false

            let account = JSON.parse(JSON.stringify(this.savedAccounts[this.selectedAccountIndex]))
            
            if (! account.savePassword && account.authType.value === 'password') {
                account.password = this.selectedAccountPassword
            }

            await this.PerformLogin(account)
        },

        async SelectAccount(index) {
            this.selectedAccountIndex = index
            this.selectedAccountPassword = ''

            if (this.savedAccounts[index].authType.value !== 'password') {
                await this.LoadAccount()
                return
            }

            if (this.savedAccounts[index].savePassword) {
                await this.LoadAccount()
                return
            }
            
            this.selectedAccount = true
        },

        SelectPrivateKeyPath () {
            let file = ipcRenderer.sendSync('select-file')

            if (! file) return

            this.loginData.privateKey = file[0]
        }
    },
}

</script>


<style>
.login {
    height: 100vh;
    overflow-y: auto;
}

.loginData-card {
    width: 550px;
    max-width: 90vw;
}

.login-button {
    width: 200px;
    max-width: 100%;
}

.loginData-margin {
    margin-top: 70px;
}

.display-name-dialog {
    width: 400px;
}
</style>

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
                        {{ authenticationType }} Authentication
                    </div>
                </div>
            </div>
            <div>
                <Button icon="pi pi-trash" class="p-button-text p-button-rounded  p-button-danger" @click="remove(index)" />
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AccountItem',

        props : [
            'index',
            'account',
            'remove',
            'load'
        ],

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
    }
</script>
<template>
    <div class="taskbar flex">
        <IconItem :name="$t('general.processes')" icon="/apps.png" width="48" @click="onActiveApps" />
        <IconItem v-for="item in taskbarItems" :key="item.name" :name="item.name" :icon="item.icon" width="48" @click="onOpen(item.process)" />
    </div>
</template>

<script>
import IconItem from '@/components/IconItem'

export default {
    name: 'TaskBar',

    props: [
        'onOpen',
        'onActiveApps'
    ],

    components: {
        IconItem
    },

    data() {
        return {
            taskbarItems: [
                {
                    name: this.$t('folder.browser'),
                    icon: '/folder.png',
                    process: 'FolderBrowser'
                },
                {
                    name: this.$t('terminal.title'),
                    icon: '/terminal.png',
                    process: 'Terminal'
                },
                {
                    name: this.$t('editor.title'),
                    icon: '/texteditor.png',
                    process: 'Editor'
                }
            ]
        }
    }
}
</script>

<style>
    .taskbar{
        background-color: #0000006e;
        border-radius: 20px;
        padding: 5px 30px 5px 30px;
        margin-bottom: 10px;
        z-index: 9999;
    }
</style>
<template>
    <div class="taskbar flex">
        <IconItem :name="$t('general.processes')" icon="/apps.png" width="48" @click="onActiveApps" />
        <IconItem v-for="item in taskbarItems" :key="item.process" :name="GetProcessName(item.process)" :icon="item.icon" width="48" @click="onOpen(item.process)" />
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
                    icon: '/folder.png',
                    process: 'FolderBrowser'
                },
                {
                    icon: '/terminal.png',
                    process: 'Terminal'
                },
                {
                    icon: '/texteditor.png',
                    process: 'Editor'
                },
                {
                    icon: '/imageviewer.png',
                    process: 'ImageViewer'
                },
                {
                    icon: '/settings.png',
                    process: 'Settings'
                }
            ]
        }
    },

    methods: {
        GetProcessName(name) {
            return this.$t('general.' + name)
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
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
</style>
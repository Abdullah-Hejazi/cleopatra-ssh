<template>
    <div class="taskbar flex">
        <IconItem v-for="item in taskbarItems" :key="item.name" :name="item.name" :icon="item.icon" width="48" />
    </div>
</template>

<script>
import IconItem from '@/components/IconItem'

export default {
    name: 'TaskBar',

    components: {
        IconItem
    },

    data() {
        return {
            taskbarItems: [
                {
                    name: 'Folder Browser',
                    icon: '/folder.png'
                },
                {
                    name: 'Terminal',
                    icon: '/terminal.png'
                },
                {
                    name: 'Text Editor',
                    icon: '/texteditor.png'
                }
            ]
        }
    }
}
</script>

<style>
    .taskbar{
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2));
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border:1px solid rgba(0, 0, 0, 0.062);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        border-radius: 20px;
        padding: 5px 30px 5px 30px;
        margin-bottom: 10px;
    }
</style>
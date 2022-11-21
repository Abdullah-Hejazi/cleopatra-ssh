<template>
    <div class="desktop-background flex align-content-end flex-wrap justify-content-center">
        <FolderBrowser />

        <div>
            <TaskBar />
        </div>
    </div>
</template>

<script>
import TaskBar from '@/components/TaskBar'
import FolderBrowser from '@/components/FolderBrowser'

export default {
    name: 'DesktopView',

    components: {
        TaskBar,
        FolderBrowser
    },

    methods: {}
}

</script>

<style>
    .desktop-background {
        background-image: url("/src/assets/background.jpg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        height: calc(100vh - 65px);
        width: 100%;
    }
</style>
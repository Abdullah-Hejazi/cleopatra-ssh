<template>
    <div class="desktop-background flex align-content-end flex-wrap justify-content-center">
        <Window title="Folder Browser" />

        <div class="">
            <TaskBar />
        </div>
    </div>
</template>

<script>
import TaskBar from '@/components/TaskBar'
import Window from '@/components/Window'

export default {
    name: 'DesktopView',

    components: {
        TaskBar,
        Window
    },

    methods: {}
}

</script>

<style>
    .desktop-background {
        background-image: url('https://images.unsplash.com/photo-1614850716626-873413eb7c1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
        height: calc(100vh - 65px);
        width: 100%;
    }
</style>
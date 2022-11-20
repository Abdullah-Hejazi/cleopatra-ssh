<script>
    export default {
        name: 'IconItem',

        props : [
            'name',
            'icon',
            'width'
        ]
    }
</script>

<template>
    <div class="icon-item mx-2">
        <div class="text-center">
            <img :src="icon" :width="width">
            <p class="m-0 text-xs">{{ name }}</p>
        </div>
    </div>
</template>

<style>
    .icon-item{
        padding: 2px;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        border-radius: 5px;
    }

    .icon-item:hover {
        border-bottom: 2px solid #ebdede;
    }
</style>
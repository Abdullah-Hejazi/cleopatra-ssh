<template>
    <Window :onMinimize="onMinimize" v-if="modelValue" style="z-index: 2000;" :onClose="Close" :noMinimize="true" :noMaximize="true" :title="header" :defaultSize="size ? size : {width: 450, height: 200}" defaultLocation="center">
        <slot></slot>
    </Window>
</template>

<script>
import Window from '@/components/windows/Window'

export default {
    name: 'Modal',

    components: {
        Window
    },

    emits: ['update:modelValue'],

    props: [
        'modelValue',
        'header',
        'size',
        'onMinimize'
    ],

    methods: {
        Close () {
            this.$emit('update:modelValue', false)
        },
    }
}
</script>
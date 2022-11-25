<template>
    <div class="window" :style="windowStyle" @click="onZIndexChange">
        <div class="window-title-bar flex justify-content-between">
            <div class="window-title-bar-text flex-grow-1" @mousedown="OnRePositionMouseDown" @mouseup="OnRePositionMouseUp">
                <img v-if="icon" :src="icon" class="window-title-bar-icon" />
                <span class="m-2">{{ title }}</span>
            </div>
            <div class="window-title-bar-controls flex">
                <div v-if="!noMinimize" class="window-title-bar-control bg-yellow-500 hover:bg-yellow-400" @click="onMinimize" />
                <div v-if="!noMaximize" class="window-title-bar-control bg-green-500 hover:bg-green-400" @click="Maximize" />
                <div class="window-title-bar-control bg-red-500 hover:bg-red-400" @click="onClose" />
            </div>
        </div>

        <div class="window-content">
            <slot></slot>
        </div>

        <div class="window-resize-control" @mousedown="OnReSizeMouseDown" @mouseup="OnReSizeMouseUp" />
    </div>
</template>

<script>

export default {
    name: 'Window',

    props: [
        'title',
        'icon',
        'defaultSize',
        'defaultLocation',
        'defaultPosition',
        'onClose',
        'onMinimize',
        'noMinimize',
        'noMaximize',
        'zIndex',
        'onZIndexChange'
    ],

    data () {
        return {
            position: {
                top: 55 + 10,
                left: 20
            },

            previousPosition: {
                top: 58,
                left: 58
            },

            mouseX: 50,
            mouseY: 50,

            mouseDistance: {
                x: 0,
                y: 0
            },

            draggable: false,
            maximized: false,

            size: {
                width: 400,
                height: 400,
                unit: 'px'
            },

            previousSize: {
                width: 720,
                height: 400,
                unit: 'px'
            }
        }
    },

    computed: {
        windowStyle () {
            return {
                top: this.position.top + 'px',
                left: this.position.left + 'px',
                width: this.size.width + this.size.widthUnit,
                height: this.size.height + this.size.heightUnit,
                'z-index': this.zIndex
            }
        }
    },

    mounted () {
        if (this.defaultSize) {
            this.size = {
                width: this.defaultSize.width > window.innerWidth - 50 ? window.innerWidth - 50 : this.defaultSize.width,
                height: this.defaultSize.height > window.innerHeight - 50 ? window.innerHeight - 50 : this.defaultSize.height,
                widthUnit: 'px',
                heightUnit: 'px',
            }

            this.previousSize = {
                width: this.defaultSize.width,
                height: this.defaultSize.height,
                widthUnit: 'px',
                heightUnit: 'px',
            }
        }

        if (this.defaultLocation === 'center') {
            this.position = {
                top: (window.innerHeight / 2) - (this.size.height / 2),
                left: (window.innerWidth / 2) - (this.size.width / 2)
            }

            this.previousPosition = this.position
        } else {
            if (this.defaultPosition) {
                this.position = this.defaultPosition
                this.previousPosition = this.defaultPosition
            }
        }
    },

    activated() {
        window.addEventListener("mousemove", this.OnMouseMove)

        window.addEventListener("resize", this.OnWindowResize)

        window.addEventListener("mouseup", this.OnMouseUp)
    },

    deactivated() {
        window.removeEventListener("mousemove", this.OnMouseMove)

        window.removeEventListener("resize", this.OnWindowResize)

        window.removeEventListener("mouseup", this.OnMouseUp)
    },

    beforeDestroy () {
        window.removeEventListener("mousemove", this.OnMouseMove)
        window.removeEventListener("mouseup", this.OnRePositionMouseUp)
        window.removeEventListener("mouseup", this.OnReSizeMouseUp)
    },

    methods: {
        OnRePositionMouseDown () {
            if (this.maximized) return

            this.draggable = true;
            this.mouseDistance = {
                x: this.mouseX - this.position.left,
                y: this.mouseY - this.position.top
            }
        },

        OnRePositionMouseUp () {
            this.draggable = false
        },

        OnReSizeMouseDown () {
            if (this.maximized) return

            this.resize = true
        },

        OnMouseUp () {
            this.OnRePositionMouseUp()
            this.OnReSizeMouseUp()
        },

        OnReSizeMouseUp () {
            this.resize = false
        },

        OnMouseMove (event) {
            this.mouseX = event.clientX
            this.mouseY = event.clientY

            if (this.draggable && !this.maximized) {
                this.resize = false

                this.position = {
                    left: this.mouseX - this.mouseDistance.x,
                    top: this.mouseY - this.mouseDistance.y
                }

                this.CheckRepositioningConstraints()

                return
            }

            if (this.resize && !this.maximized) {
                this.size = {
                    width: this.mouseX - this.position.left + 15,
                    height: this.mouseY - this.position.top + 15,
                    widthUnit: 'px',
                    heightUnit: 'px'
                }

                this.CheckResizingConstraints()

                return
            }
            
        },

        CheckRepositioningConstraints () {
            if (this.mouseX - this.mouseDistance.x < 0) {
                this.position.left = 0
            } else if (this.mouseX - this.mouseDistance.x > window.innerWidth - this.size.width) {
                this.position.left = window.innerWidth - this.size.width
            }

            if (this.mouseY - this.mouseDistance.y < 55) {
                this.position.top = 55
            } else if (this.mouseY - this.mouseDistance.y > window.innerHeight - this.size.height) {
                this.position.top = window.innerHeight - this.size.height
            }

            this.OnWindowResize()
        },

        CheckResizingConstraints () {
            if (this.mouseX - this.position.left < 400 + 15) {
                this.size.width = 400 + 15
            } else if (this.mouseX - this.position.left > window.innerWidth - this.position.left) {
                this.size.width = window.innerWidth - this.position.left
            }

            if (this.mouseY - this.position.top < 350) {
                this.size.height = 350
            } else if (this.mouseY - this.position.top > window.innerHeight - this.position.top) {
                this.size.height = window.innerHeight - this.position.top
            }
        },

        Maximize () {
            this.draggable = false
            this.maximized = !this.maximized

            if (this.maximized) {
                this.previousPosition = {
                    top: this.position.top,
                    left: this.position.left
                }

                this.previousSize = {
                    width: this.size.width,
                    height: this.size.height,
                    widthUnit: this.size.widthUnit,
                    heightUnit: this.size.heightUnit
                }

                this.position = {
                    left: 0,
                    top: 55
                }

                this.size = {
                    width: 100,
                    height: 92,
                    widthUnit: 'vw',
                    heightUnit: 'vh'
                }
            } else {
                this.size = {
                    width: this.previousSize.width,
                    height: this.previousSize.height,
                    widthUnit: 'px',
                    heightUnit: 'px'
                }

                this.position = {
                    left: this.previousPosition.left,
                    top: this.previousPosition.top
                }
            }
        },

        OnWindowResize () {
            if (this.maximized) return

            if (this.size.width > window.innerWidth) {
                this.size.width = window.innerWidth - 15
            }

            if (this.size.height > window.innerHeight) {
                this.size.height = window.innerHeight - 15
            }

            if (this.size.width < 400) {
                this.size.width = 400
            }

            if (this.size.height < 350) {
                this.size.height = 350
            }

            if (this.position.left + this.size.width > window.innerWidth) {
                this.position.left = window.innerWidth - this.size.width
            }

            if (this.position.top + this.size.height > window.innerHeight) {
                this.position.top = window.innerHeight - this.size.height
            }

            if (this.position.left < 0) {
                this.position.left = 0
            }

            if (this.position.top < 55) {
                this.position.top = 55
            }

        }
    }
}
</script>

<style>
    .window {
        position: absolute;
        width: 720px;
        height: 440px;

        background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2));
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border:1px solid rgba(0, 0, 0, 0.062);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        border-radius: 10px;
        padding: 0px;

        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }

    .window-title-bar {
        height: 40px;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2));
        border-bottom: 2px solid rgba(255, 255, 255, 0.192);
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    .window-title-bar-icon {
        width: 20px;
        height: 20px;
        position: relative;
        top: 4px;
    }

    .window-title-bar-text {
        margin-left: 12px;
        position: relative;
        top: 5px;
        cursor: grab;
    }

    .window-title-bar-controls {
        margin-right: 20px;
        position: relative;
        top: 8px;
    }

    .window-title-bar-control {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        cursor: pointer;
        margin-left: 5px;
    }

    .window-resize-control {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 25px;
        height: 25px;
        cursor: nwse-resize;
    }

    .window-content {
        height: 100%;
    }
</style>
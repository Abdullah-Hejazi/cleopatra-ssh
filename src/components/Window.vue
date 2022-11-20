<template>
    <div class="window" :style="windowStyle">
        <div class="window-title-bar flex justify-content-between">
            <div class="window-title-bar-text flex-grow-1" @mousedown="OnRePositionMouseDown" @mouseup="OnRePositionMouseUp">
                {{ title }}
            </div>
            <div class="window-title-bar-controls flex">
                <div class="window-title-bar-control bg-yellow-500 hover:bg-yellow-400" />
                <div class="window-title-bar-control bg-green-500 hover:bg-green-400" @click="Maximize" />
                <div class="window-title-bar-control bg-red-500 hover:bg-red-400" />
            </div>
        </div>

        <div class="window-resize-control" @mousedown="OnReSizeMouseDown" @mouseup="OnReSizeMouseUp" />
    </div>
</template>

<script>

export default {
    name: 'Window',

    props: [
        'title'
    ],

    data () {
        return {
            position: {
                top: 50,
                left: 50
            },

            previousPosition: {
                top: 50,
                left: 50
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
                width: 600,
                height: 400,
                unit: 'px'
            },

            previousSize: {
                width: 600,
                height: 400,
                unit: 'px'
            },

            items: [
                {
					label:'Quit',
					icon:'pi pi-fw pi-power-off'
                }
            ]
        }
    },

    computed: {
        windowStyle () {
            return {
                top: this.position.top + 'px',
                left: this.position.left + 'px',
                width: this.size.width + this.size.widthUnit,
                height: this.size.height + this.size.heightUnit
            }
        }
    },

    mounted () {
        document.addEventListener("mousemove", (event) => {
            this.mouseX = event.clientX
            this.mouseY = event.clientY

            this.OnMouseMove()
        })

        document.addEventListener("mouseup", () => {
            this.OnRePositionMouseUp()
            this.OnReSizeMouseUp()
        })
    },

    methods: {
        OnRePositionMouseDown() {
            if (this.maximized) return

            this.draggable = true;
            this.mouseDistance = {
                x: this.mouseX - this.position.left,
                y: this.mouseY - this.position.top
            }
        },

        OnRePositionMouseUp() {
            this.draggable = false
        },

        OnReSizeMouseDown() {
            if (this.maximized) return

            this.resize = true
        },

        OnReSizeMouseUp() {
            this.resize = false
        },

        OnMouseMove() {
            if (this.draggable && !this.maximized) {
                this.resize = false

                this.position = {
                    left: this.mouseX - this.mouseDistance.x,
                    top: this.mouseY - this.mouseDistance.y
                }
                return
            }

            if (this.resize && !this.maximized) {
                this.size = {
                    width: this.mouseX - this.position.left + 15,
                    height: this.mouseY - this.position.top - 40,
                    widthUnit: 'px',
                    heightUnit: 'px'
                }

                return
            }
            
        },

        Maximize() {
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
                    top: 0
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
        }
    }
}
</script>

<style>
    .window {
        position: absolute;
        width: 600px;
        height: 400px;

        background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2));
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border:1px solid rgba(0, 0, 0, 0.062);
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        border-radius: 10px;
        padding: 0px;
    }

    .window-title-bar {
        height: 40px;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.2));
        border-bottom: 2px solid rgba(255, 255, 255, 0.192);
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
    }

    .window-title-bar-text {
        margin-left: 20px;
        position: relative;
        top: 9px;
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
</style>
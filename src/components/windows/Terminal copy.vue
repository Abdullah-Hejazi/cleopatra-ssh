<template>
    <div>
        <Window :onZIndexChange="onZIndexChange" :zIndex="zIndex" :onClose="CloseTerminal" :onMinimize="onMinimize" :title="$t('general.Terminal')" icon="/terminal.png" :defaultSize="{width: 700, height: 400}">
            <div class="terminal flex flex-column selectable-text" @focus="TerminalFocus" ref="terminalcontainer" @contextmenu="OptionsMenu">
                <div>
                    <pre class="terminal-line flex m-0 my-1" v-for="line, index in lines.slice(0, lines.length - 1)" :key="index">{{line}}<span class="flex-grow-1" @click="TerminalFocus"><input v-if="index+1 === lines.length" type="text" class="terminal-input w-full" v-model="command" @keyup.enter="WriteBuffer" ref="terminalinput"></span></pre>
                    <pre class="terminal-line flex m-0 my-1">{{lines[lines.length-1]}}<span class="flex-grow-1" @click="TerminalFocus"><input type="text" class="terminal-input w-full" v-model="command" @keyup.enter="WriteBuffer" ref="terminalinput"></span></pre>
                </div>
                <div @click="TerminalFocus" class="flex-grow-1"></div>
            </div>

            <ContextMenu ref="optionsmenu" :model="optionsContextMenuItems" />
        </Window>
    </div>
</template>

<script>
import Window from '@/components/windows/Window'

import SSHClient from '@/services/ssh'
import Helpers from '@/services/helpers'

export default {
    name: 'Terminal',

    components: {
        Window
    },

    props: {
        file: {
            type: String,
            default: ''
        },

        onClose: {
            type: Function,
            default: () => {}
        },

        onMinimize: {
            type: Function,
            default: () => {}
        },

        zIndex: {
            type: Number,
            default: 1500
        },

        onZIndexChange: {
            type: Function,
            default: () => {}
        }
    },

    data () {
        return {
            socket: null,
            lines: [],
            command: '',

            optionsContextMenuItems: [
                {
                    label: this.$t('terminal.copy'),
                    icon: 'pi pi-copy',
                    command: this.Copy
                },
                {
                    label: this.$t('terminal.paste'),
                    icon: 'pi pi-copy',
                    command: this.Paste
                }
            ],
        }
    },

    mounted () {
        if (this.file) {
            this.Load(this.file)
        } else {
            this.Load(Helpers.GetHomeDirectory())
        }
    },

    methods: {
        Load (path) {
            SSHClient.Shell('cd ' + path).then((socket) => {
                this.socket = socket
                this.socket.on('data', this.RecieveBuffer)

                this.command = 'cd ' + path
                this.WriteBuffer()
            })
        },

        RecieveBuffer (buffer) {
            const regex = /(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/g

            buffer.toString().match(regex)?.forEach((match) => {
                buffer = buffer.toString().replace(match, '')
            })

            let line = buffer.toString().replaceAll('\u0000', '')

            this.lines.push(...line.split('\r\n'))
        },

        WriteBuffer () {
            if (! this.socket) return

            if (this.command) {
                if (this.command === 'clear') {
                    this.lines = []
                }

                this.socket.write(this.command + '\r')
                this.command = ''
                return
            }

            this.socket.write('\r')
            this.command = ''
        },

        CloseTerminal () {
            this.socket.close()
            this.onClose()
        },

        TerminalFocus () {
            if (this.$refs.terminalinput) {
                this.$refs.terminalinput.focus()

                this.$refs.terminalcontainer.scrollTo(0, this.$refs.terminalcontainer.scrollHeight)
            }
        },

        OptionsMenu (event) {
            this.$refs.optionsmenu.show(event)
        },

        Copy () {
            const selection = window.getSelection()

            navigator.clipboard.writeText(selection.toString())
        },

        Paste () {
            navigator.clipboard.readText().then((text) => {
                this.command += text
            })
        }
    },

    watch: {
        lines: {
            handler () {
                this.$nextTick(() => {
                    this.$refs.terminalcontainer.scrollTo(0, this.$refs.terminalcontainer.scrollHeight)
                })
            },
            deep: true
        }
    }
}
</script>

<style scoped>
    .terminal {
        background-color: #000000a1 !important;
        border-radius: 5px;
        height: calc(100% - 40px) !important;
        height: calc(100% - 100px);
        padding: 10px;

        overflow: auto;
    }

    .terminal-line {
        word-wrap: break-word;
    }

    .terminal-input {
        background-color: #00000000 !important;
        border: none;
        font-family: monospace;
        white-space: pre;
    }

    .terminal-input:focus {
        outline: none;
    }
</style>
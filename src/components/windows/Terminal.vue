<template>
    <div>
        <Window :onZIndexChange="onZIndexChange" :zIndex="zIndex" :onClose="CloseTerminal" :onMinimize="onMinimize" :title="$t('general.Terminal')" icon="/terminal.png" :defaultSize="{width: 700, height: 400}">
            <div class="terminal flex flex-column" @focus="TerminalFocus">
                <div>
                    <pre class="terminal-line flex m-0 my-1" v-for="line, index in lines" :key="index">{{line}}<span class="flex-grow-1" @click="TerminalFocus"><input v-if="index+1 === lines.length" type="text" class="terminal-input w-full" v-model="command" @keyup.enter="WriteBuffer" ref="terminalinput"></span></pre>
                </div>
                <div @click="TerminalFocus" class="flex-grow-1"></div>
            </div>
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
            command: ''
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
                this.TerminalFocus()
            })
        },

        RecieveBuffer (buffer) {
            const regex = /(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/g

            buffer.toString().match(regex)?.forEach((match) => {
                buffer = buffer.toString().replace(match, '')
            })


            this.lines.push(...buffer.toString().replaceAll('\u0000', '').split('\r\n'))
        },

        WriteBuffer () {
            if (! this.socket) return

            if (this.command) {
                this.socket.write(this.command + '\r')
                this.command = ''
                this.TerminalFocus()
                return
            }

            this.socket.write('\r')
            this.command = ''
            this.TerminalFocus()
        },

        CloseTerminal () {
            this.socket.close()
            this.onClose()
        },

        TerminalFocus () {
            if (this.$refs.terminalinput) {
                this.$refs.terminalinput[0].focus()
            }
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
    }

    .terminal-input:focus {
        outline: none;
    }
</style>
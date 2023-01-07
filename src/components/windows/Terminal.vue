<template>
    <div>
        <Window :onZIndexChange="onZIndexChange" :zIndex="zIndex" :onClose="CloseTerminal" :onMinimize="onMinimize" :title="$t('general.Terminal')" icon="/terminal.png" :defaultSize="{width: 700, height: 400}">
            <div ref="terminal" id="terminal"></div>
        </Window>
    </div>
</template>

<script>
import Window from '@/components/windows/Window'

import SSHClient from '@/services/ssh'
import Helpers from '@/services/helpers'

import 'xterm/css/xterm.css'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Unicode11Addon } from 'xterm-addon-unicode11'

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
            term: null,
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

        this.term = new Terminal({
            allowProposedApi: true
        })

        let terminal = this.$refs.terminal

        this.term.open(terminal)

        this.term.onKey(async (event) => {
            if (event.domEvent.code === 'Enter') {
                this.term.write('\r')
                this.WriteBuffer()
                return
            } else if (event.domEvent.code === 'Backspace') {
                if (this.command) {
                    this.command = this.command.slice(0, -1)
                    this.term.write('\b \b')
                }
            } else if (event.domEvent.code === 'Tab') {
                //

            } else if (event.key === '\u0003') {
                this.term.write('^C\r')
                this.command = ''
                this.WriteBuffer()
                return;

            } else if (event.key === '\u0016') {
                const text = await navigator.clipboard.readText()
                this.command += text
                this.term.write(text)
                return;

            } else {
                this.command += event.key
                this.term.write(event.key)
            }
        })
    },

    unmounted () {
        this.term.dispose()
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
            this.term.write(buffer)
            this.command = ''
            return
        },

        WriteBuffer () {
            if (! this.socket) return

            if (this.command) {
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
        }
    }
}
</script>

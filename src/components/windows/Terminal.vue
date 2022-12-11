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

let term = new Terminal({
    allowProposedApi: true
})

let fitAddon = new FitAddon()

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

        let terminal = this.$refs.terminal

        term.loadAddon(fitAddon)

        term.loadAddon(new WebLinksAddon())
        term.loadAddon(new Unicode11Addon())

        fitAddon.fit()

        term.unicode.activeVersion = '11'

        term.open(terminal)

        term.onKey((event) => {
            if (event.key === '\r') {
                this.WriteBuffer()
                return
            } else if (event.domEvent.code === 'Backspace') {
                if (this.command) {
                    this.command = this.command.slice(0, -1)
                    term.write('\b \b')
                }
            } else {
                this.command += event.key
                term.write(event.key)
            }
        })

        console.log(term)
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
            term.write(buffer)
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

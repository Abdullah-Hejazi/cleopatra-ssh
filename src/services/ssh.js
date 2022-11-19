var SSH2Promise = require('ssh2-promise')
const path = require('path')
const dotenv = require('dotenv-defaults')

const environment = dotenv.config({
	path: path.resolve(__dirname, '../../../../../../.env')
}).parsed

let sshSession = null

export default {
    EstablishConnection: async (account) => {
        if (sshSession !== null) {
            sshSession.close()
        }

        sshSession = new SSH2Promise({
			host: account.host,
			port: account.port ?? 22,
			username: account.username,
			password: account.password
		})

		return await sshSession.connect()
    },

    Execute: async (command) => {
		return sshSession.exec(command)
    },

	List: async (file) => {
		return await sshSession.sftp().readdir(file)
	},

	ReadFile: async (file) => {
		return sshSession.spawn("cat " + file)
	}
}
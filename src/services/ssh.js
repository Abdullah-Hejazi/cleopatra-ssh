var SSH2Promise = require('ssh2-promise')
const path = require('path')
const dotenv = require('dotenv-defaults')

const environment = dotenv.config({
	path: path.resolve(__dirname, '../../../../../../.env')
}).parsed

let sshSession = null

export default {
    GetConnection: async () => {
		console.log(environment)
        if (sshSession === null) {
            sshSession = new SSH2Promise({
				host: environment.SSH_HOST,
				port: 22,
				username: environment.SSH_USER,
				password: environment.SSH_PASSWORD
			})

            return await sshSession.connect()
        }

        return sshSession
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
var SSH2Promise = require('ssh2-promise')
const path = require('path')

let sshSession = null
let sshUser = {}

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

		sshUser.host = account.host
		sshUser.username = account.username

		return await sshSession.connect()
    },

	GetCurrentUser: () => {
		return sshUser
	},

	GetConnection: () => {
		return sshSession
	},

	CloseConnection: () => {
		if (sshSession !== null) {
			sshSession.close()
		}
	},

    Execute: async (command) => {
		return sshSession.exec(command)
    },

	List: async (file) => {
		return await sshSession.sftp().readdir(file)
	},

	ReadFile: async (file) => {
		return sshSession.spawn("cat " + file)
	},

	CreateFile: async (file) => {
		return sshSession.exec('touch ' + file)
	},

	FileExists: async (file) => {
		return sshSession.exec('test -e ' + file + ' && echo 1 || echo 0')
	},

	CreateDirectory: async (file) => {
		return sshSession.exec('mkdir ' + file)
	}
}
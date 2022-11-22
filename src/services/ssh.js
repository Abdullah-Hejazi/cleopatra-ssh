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

	ListNested: async (file) => {
		return await sshSession.exec('find ' + file + ' -printf "%y %P\n"')
	},

	ReadFile: async (file) => {
		return sshSession.exec("cat " + file)
	},

	CreateFile: async (file) => {
		return sshSession.exec('touch ' + file)
	},

	FileExists: async (file) => {
		return sshSession.exec('test -e ' + file + ' && echo 1 || echo 0')
	},

	CreateDirectory: async (file) => {
		return sshSession.exec('mkdir ' + file)
	},

	Download: async (remotePath, localPath, options) => {
		return sshSession.sftp().fastGet(remotePath, localPath, options)
	},

	Upload: async (localPath, remotePath, options) => {
		return sshSession.sftp().fastPut(localPath, remotePath, options)
	},

	Move: async (oldPath, newPath) => {
		return sshSession.exec('mv ' + oldPath + ' ' + newPath)
	},

	Copy: async (oldPath, newPath, directory) => {
		if (directory)
			return sshSession.exec('cp -r ' + oldPath + ' ' + newPath)
			
		return sshSession.exec('cp ' + oldPath + ' ' + newPath)
	},

	Delete: async (file) => {
		return sshSession.exec('rm -rdf ' + file)
	},

	ChangePermissions: async (file, permissions, recursive) => {
		return sshSession.exec('chmod ' + (recursive ? '-R ' : '') + permissions + ' ' + file)
	},

	WriteFile: async (file, content) => {
		return sshSession.exec("cat <<'EOF' >" + file + "\n" + content + "\nEOF")
	}
}
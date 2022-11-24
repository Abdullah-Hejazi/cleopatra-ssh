var SSH2Promise = require('ssh2-promise')
const { readFileSync } = require('fs')

let sshSession = null
let sshFtp = null
let sshUser = {}

export default {
    EstablishConnection: async (account) => {
        if (sshSession !== null) {
            await sshSession.close()
			sshSession = null
			sshFtp = null
        }

		if (account.authType.value === 'password') {
			sshSession = new SSH2Promise({
				host: account.host ?? 'localhost',
				port: account.port ?? 22,
				username: account.username,
				password: account.password
			})
		} else {
			sshSession = new SSH2Promise({
				host: account.host ?? 'localhost',
				port: account.port ?? 22,
				username: account.username,
				identity: account.privateKey,
				passphrase: account.passPhrase
			})
		}

		sshFtp = await sshSession.sftp()

		sshUser.host = account.host
		sshUser.username = account.username

		return sshSession.connect()
    },

	ClearConnection: async () => {
		if (sshSession !== null) {
			await sshSession.close()
		}
		sshSession = null
		sshFtp = null
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
		return await sshFtp.readdir(file)
	},

	ListNested: async (file) => {
		return await sshSession.exec('find ' + file + ' -printf "%y %P\n"')
	},

	ReadFile: async (file, encoding='utf8') => {
		return sshFtp.readFile(file, {
			encoding: encoding
		})
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
		return sshFtp.fastGet(remotePath, localPath, options)
	},

	Upload: async (localPath, remotePath, options) => {
		return sshFtp.fastPut(localPath, remotePath, options)
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
		return sshFtp.writeFile(file, content)
	},

	Shell: async (command) => {
		return sshSession.shell(command)
	}
}
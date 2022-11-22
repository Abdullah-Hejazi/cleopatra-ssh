import SSHClient from '@/services/ssh'

var uuid = require("uuid")
var fs = require('fs')

export default {
	GetHomeDirectory: () => {
        if (SSHClient.GetCurrentUser().username === 'root') {
            return '/root'
        } else {
            return '/home/' + SSHClient.GetCurrentUser().username
        }
    },

    ParseDirectory: (directory) => {
        return directory.map((item) => {
            return {
                name: item.filename,
                directory: item.longname.startsWith('d'),
                size: item.attrs.size
            }
        })

    },

    GetRandomString: () => {
        return uuid.v4()
    },

    MakeDirectory: (dir) => {
        if (! fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    },

    ListDirectory: function (dir) {
        let list = fs.readdirSync(dir, { withFileTypes: true })
        let result = []

        list.forEach((item) => {
            result.push({
                name: item.name,
                directory: item.isDirectory(),
                items: item.isDirectory() ? this.ListDirectory(dir + '/' + item.name) : [],
                path: dir + '/' + item.name
            })
        })

        return result
    }
}
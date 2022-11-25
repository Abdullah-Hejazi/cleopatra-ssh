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
                directory: item.attrs.isDirectory(),
                symlink: item.attrs.isSymbolicLink(),
                size: item.attrs.size,
                permissions: item.longname.substring(1, 10),
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
    },

    PermissionFromArray: (p) => {
        let v1 = (p[0][0] * 4) + (p[1][0] * 2) + (p[2][0] * 1)
        let v2 = (p[0][1] * 4) + (p[1][1] * 2) + (p[2][1] * 1)
        let v3 = (p[0][2] * 4) + (p[1][2] * 2) + (p[2][2] * 1)

        return v1.toString() + v2.toString() + v3.toString()
    },

    PermissionFromString: (str) => {
        let result = [
            [false, false, false],
            [false, false, false],
            [false, false, false]
        ]

        result[0][0] = str[0] === 'r'
        result[1][0] = str[1] === 'w'
        result[2][0] = str[2] === 'x'

        result[0][1] = str[3] === 'r'
        result[1][1] = str[4] === 'w'
        result[2][1] = str[5] === 'x'

        result[0][2] = str[6] === 'r'
        result[1][2] = str[7] === 'w'
        result[2][2] = str[8] === 'x'


        return result
    }
}
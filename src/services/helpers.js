import SSHClient from '@/services/ssh'

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

    }
}
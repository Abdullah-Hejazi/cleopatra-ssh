module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            externals:['ssh2-promise'],
            builderOptions: {
                win: {
                    target: 'portable',
                    asar: true,
                    icon: 'icon.ico'
                },
                linux:{
                    target:[
                        "deb",
                    ],
                    category: "Development",

                    vendor: 'Abdullah Hejazi',
                    maintainer: 'Abdullah Hejazi',
                    synopsis: 'A GUI SSH Client that looks like a desktop',
                    description: 'An ssh client that converts your ssh connection to a full blown desktop application'
                }
              }
        }
    }
}
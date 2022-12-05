module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            externals:['ssh2-promise'],
            builderOptions: {
                icon: 'build/icon.png',
                win: {
                    target: 'portable',
                    asar: true,
                    icon: 'build/icon.ico'
                },
                linux:{
                    target:[
                        "deb",
                    ],
                    category: "Development",
                    icon: 'build/256x256.png',

                    vendor: 'Abdullah Hejazi',
                    maintainer: 'Abdullah Hejazi',
                    synopsis: 'A GUI SSH Client that looks like a desktop',
                    description: 'An ssh client that converts your ssh connection to a full blown desktop application'
                },
                deb: {
                    icon: 'build/256x256.png',
                },
                directories:{
                    buildResources: "build"
                }
              }
        }
    }
}
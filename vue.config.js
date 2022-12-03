module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true,
            externals:['ssh2-promise'],
            builderOptions: {
                win: {
                    target: 'portable',
                    asar: true,
                    icon: 'build/icon.ico'
                },
                linux:{
                    "target":[
                        "AppImage",
                    ],
                    "category":"Development"
                },
                "directories":{
                    "buildResources":"public",
                    "output":"release"
                },
              }
        }
    }
}
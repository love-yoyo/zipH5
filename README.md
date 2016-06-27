## ENVERIONMENT PREPARE
`nodejs`

## USEAGE
`npm install`
`node app.js`

### 参数说明 (可选)
`-ver` 为压缩的版本号（可选）（默认为`1.0.0`）
`-p` 使用的压缩平台（可选）（`android` 或 `ios`，默认为`android`）
`-d` 目标文件的路径（可选）（默认为README所在的src路径下）

    例如：
        node app.js -ver 1.1.0
        node app.js -ver 1.1.0 -p android
        node app.js -ver 1.1.0 -p ios
        node app.js -ver 1.1.0 -p android -d /path/to/project
        node app.js -ver 1.1.0 -p ios -d /path/to/project

### 配置文件
    如果不想输入参数，可通过配置配置文件 zipconfig.json

    ignore      表示需要忽略的文件，
        dirs    表示忽略的目录名称
        files   表示忽略的文件名称
    示例：
    "ignore": {
        "dirs": [".DS_Store", "node_modules", ".git"],
        "files": [".gitignore", ".DS_Store", "MANIFEST.properties"]
    }
   

    project 
        options
            cwd             为默认的公共目录
            version         表示全局版本号，若sub没有会调用这个
            platform        全局平台号，若sub没有会调用这个
            dest            全局目标地址，若sub没有会调用这个
        sub                 单个项目配置，为数组
            {
                src         单个项目的目录地址
                version     单个项目的版本号   
                platform    单个项目的平台地址
                dest        单个项目的目标地址
            }
    示例：
    "project": {
        "options": {
            "cwd": "./src",
            "version": "1.0.0",
            "platform": "android",
            "dest": "./dist"
        },
        "sub": [{
            "src": "/Users/king/work/data/test/zipH5/test"
        }]
    }

注意 
    
    * 文件编码统一为 utf-8 ，有些文件可能是 utf-8 with BOM，这会导致压缩文件的MD5有差异。
    * 文件执行顺序为命令行参数会覆盖配置文件的
    * 若命令行没有指定需要压缩的文件地址，则会处理`sub`中配置的，如果`sub`中没有配置`src`，则会去处理放置在`options.cwd`目录下的所有第一层子文件夹
        如：
            src 
                testA
                testB
        src目录下有`testA`,`testB`两个子项目，程序会顺序处理这两个目录            




## CHANGELOG
1. init by Will at 2016/06/03 
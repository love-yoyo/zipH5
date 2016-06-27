var path = require('path');
var crypto = require('crypto');
var fs = require('fs');
var chalk = require('chalk');
var nconf = require('nconf');

var gulp = require('gulp');
var zip = require('gulp-zip');

var md5 = require('./lib/md5-util');
var getPlatform = require('./lib/getPlatform');


var zipconfigDefContent = {
    "ignore": {
        "dirs": [".DS_Store", "node_modules", ".git"],
        "files": [".gitignore", ".DS_Store", "MANIFEST.properties"]
    },
    "project": {
        "options": {
            "cwd": "./src",
            "version": "1.0.0",
            "dest": "./dist"
        },
        "dir": []
    }
};

if (!fs.existsSync("zipconfig.json")) {
    fs.writeFileSync("zipconfig.json", JSON.stringify(zipconfigDefContent));
}

var zip_config = path.join(__dirname, 'zipconfig.json');
if (fs.existsSync(zip_config, "utf8")) {
    if (fs.readFileSync(zip_config, "utf8") == "") {
        fs.writeFileSync(zip_config, JSON.stringify(zipconfigDefContent), "utf8");
    }
}
nconf.add('zipconfig', { type: 'file', file: zip_config });

/**
 * [setup default config value]
 * @type {[type]}
 */
if (!nconf.stores.zipconfig.get("ignore:dirs")) {
    nconf.stores.zipconfig.set("ignore:dirs", "[]");
}
if (!nconf.stores.zipconfig.get("ignore:files")) {
    nconf.stores.zipconfig.set("ignore:files", "[]");
}
if (!nconf.stores.zipconfig.get("project")) {
    nconf.stores.zipconfig.set("project", JSON.stringify({
        "options": {
            "cwd": "./src",
            "version": "1.0.0",
            "platform": "android",
            "dest": "./dist"
        }
    }));
}
if (!nconf.stores.zipconfig.get("project:options")) {
    nconf.stores.zipconfig.set("project:options", JSON.stringify({
        "cwd": "./src",
        "version": "1.0.0",
        "platform": "android",
        "dest": "./dist"
    }));
}
if (!nconf.stores.zipconfig.get("project:sub")) {
    nconf.stores.zipconfig.set("project:sub", JSON.stringify([]));
}

var _getSrcFiles = function(dirpath) {
    var filesArr = [];
    dir = /\/$/.test(dirpath) ? dirpath : dirpath + '/';
    var files = fs.readdirSync(dirpath);
    var ignore = nconf.stores.zipconfig.get("ignore:files");
    for (var i = 0; i < files.length; i++) {
        var _isIgnore = false;

        for (var j = 0; j < ignore.length; j++) {
            if (files[i] == ignore[j]) {
                _isIgnore = true;
                break
            }
        }
        // console.log("ignore[j]:" + files[i] + " isignore:" + _isIgnore);
        if (!_isIgnore) {
            filesArr.push(dirpath + "/" + files[i]);
        }
    }
    return filesArr;
}

/**
 * [entry point]
 */
var args = process.argv.splice(2);
var _def_version = "1.0.0";
var _def_platform = "android";
var _def_dist = "./dist";
for (var i = 0; i < args.length; i++) {
    var _arg = args[i];
    if (_arg == '-ver' || _arg == '-Ver') {
        var arg1 = args[i + 1] || _def_version;
        nconf.stores.zipconfig.set("project:options:version", arg1);
    } else if (_arg == '-p' || _arg == '-P') {
        var arg1 = args[i + 1] || _def_platform;
        nconf.stores.zipconfig.set("project:options:platform", arg1);
    } else if (_arg == '-d' || _arg == '-D') {
        var arg1 = args[i + 1] || "";
        if (fs.existsSync(arg1) && fs.statSync(arg1).isDirectory()) {
            nconf.stores.zipconfig.set("project:sub", JSON.stringify([{
                "src": arg1
            }]));
        }
    }
}

var _sub = nconf.stores.zipconfig.get("project:sub") || [];
_sub = (typeof _sub) == "string" ? JSON.parse(_sub) : _sub;
console.log(_sub);
if (!_sub || (_sub && _sub.length < 1)) {
    var parent = _getSrcFiles(path.join(__dirname, nconf.stores.zipconfig.get("project:options:cwd")));
    // console.log(parent);
    var arr = [];
    for (var i = 0; i < parent.length; i++) {
        arr.push({
            "src": parent[i]
        })
    }
    nconf.stores.zipconfig.set("project:sub", JSON.stringify(arr));
} 
_sub = nconf.stores.zipconfig.get("project:sub") || [];
_sub = (typeof _sub) == "string" ? JSON.parse(_sub) : _sub;
console.log(_sub);
var _handlePaths = _sub || [];
try {
    var _md5ResArr = [];
    for (var i = 0; i < _handlePaths.length; i++) {
        var _handlePath = _handlePaths[i];

        var src = _handlePath.src;
        var version = _handlePath.version || "";
        var dest = _handlePath.dest || "";
        var platform = _handlePath.platform || "";

        if (fs.existsSync(src) && fs.statSync(src).isDirectory()) {
            console.log(chalk.blue("[Current handle path]: ") + chalk.green(src));

            var _plat = getPlatform(src+'/main.html') || 'android';

            version = version || nconf.stores.zipconfig.get("project:options:version") || _def_version;
            dest = dest || nconf.stores.zipconfig.get("project:options:dest") || _def_dist;
            platform = _plat || platform || nconf.stores.zipconfig.get("project:options:platform") || _def_platform;
            // console.log("version:" + version + " dest:" + dest + " platform:" + platform);

            var md5Res = md5.getMD5({
                version: version,
                project: src,
                ignore: nconf.stores.zipconfig.get("ignore")
            });
            // console.log(chalk.blue("[_handlePath] : ") + _handlePath + '**');
            var projectName = path.parse(src).name;
            var zipName = projectName + "_" + platform + "_" + version + ".zip";
            gulp.src([
                    src + '/**', 
                    "!" + src + "/.DS_Store", 
                    "!" + src + "/.git", 
                    "!" + src + "/.gitignore"
                ])
                .pipe(zip(zipName))
                .pipe(gulp.dest(dest));

            md5Res.dest = path.join(__dirname, dest, zipName);
            md5Res.platform = platform;
            _md5ResArr.push(md5Res);
        } else {
            console.log(chalk.red("[" + src + "] is not a correct path"));
        }
        // console.log("\n");
    }

    console.log(chalk.red("\n[压缩后的结果]:"));
    for (var i = 0; i < _md5ResArr.length; i++) {
        var _item = _md5ResArr[i];
        console.log(chalk.red("   dest: ") + _item.dest);
        console.log(chalk.red("   MD5: ") + _item.md5);
        console.log(chalk.red("   version: ") + _item.version);
        console.log(chalk.red("   platform: ") + _item.platform);
        console.log("");
    }

} catch (err) {
    throw new Error(err);
}

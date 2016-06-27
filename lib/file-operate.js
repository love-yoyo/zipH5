var fs = require('fs');
var chalk = require('chalk');
var async = require('async');

// console.log(configJson);

var _isIgnore = function(config_files, item) {
    var _ignore = false;
    for (var i = 0; i < config_files.length; i++) {
        // console.log("config_file:" + config_files[i] + " item:" + item);
        if (config_files[i] == item) {
            console.log(chalk.blue("[ignore file]: ") + item);
            _ignore = true;
            break;
        }
    }
    return _ignore;
};

exports.getAllFiles = function(opts, callback) {
    var dir = opts.project;
    var config_dirs = opts.ignore.dirs,
        config_files = opts.ignore.files;

    var filesArr = [];
    dir = /\/$/.test(dir) ? dir : dir + '/';
    (function dir(dirpath, fn) {
        var files = fs.readdirSync(dirpath);
        async.each(files, function(item, next) {
            var info = fs.statSync(dirpath + item);
            if (info.isDirectory()) {
                var _ignore = _isIgnore(config_dirs, item);
                if (!_ignore) {
                    dir(dirpath + item + '/', function() {
                        next();
                    });
                }
            } else {
                var _ignore = _isIgnore(config_files, item);
                if (!_ignore) {
                    // console.log("[start push]:" + (dirpath + item));
                    filesArr.push(dirpath + item);
                    callback && callback(dirpath + item);
                    next();
                }

            }
        }, function(err) {
            !err && fn && fn();
        });
    })(dir);
    return filesArr;
}

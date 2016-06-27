var fs = require('fs');
var chalk = require('chalk');
var crypto = require('crypto');
var fileOperate = require('./file-operate');
var propUtil = require('./prop-util');

var pem = fs.readFileSync('./ziph5.pem');
var key = pem.toString('ascii');

var _getKey = function(encrypted) {
    var decrypted = "";
    var decipher = crypto.createDecipher('aes192', key);
    decrypted += decipher.update(encrypted, 'hex', 'binary');
    decrypted += decipher.final('binary');

    var output = new Buffer(decrypted);
    return output.toString()
}

var _getDirMd5 = function(files) {
    var md5Arr = [];
    files = files || [];
    for (var i = 0; i < files.length; i++) {
        var data = fs.readFileSync(files[i]);
        var md5 = crypto.createHash('md5');
        var hex = md5.update(data).digest('hex');
        md5Arr.push(hex);
        // console.log(hex);
    }
    return md5Arr;
}

function _generateMd5(md5Arr) {
    var md5Arr = md5Arr.sort();
    var md5ArrStr = md5Arr.join('');
    var md5 = crypto.createHash('md5');
    var hex = md5.update(md5ArrStr).digest('hex');
    console.log(chalk.blue("[All file MD5]: ") + hex);

    var _key1 = '0f9222affccf485c5f87b6603ec22fb08491bcbf68c25ffa804a0fd63d9caa15';
    var _key2 = '8ecbd997ecbe7029be50982ae81538fceea26bb15909b9b105bea6348682add8';

    var cipher = crypto.createCipheriv('des-cbc', new Buffer(_getKey(_key1), 'hex'), new Buffer(_getKey(_key2), 'hex'));
    cipher.setAutoPadding(false);
    var ciph = cipher.update(hex, '', 'hex');
    ciph += cipher.final('hex');
    return ciph;
}


exports.getMD5 = function(opts) {
    var fileArr = fileOperate.getAllFiles({
        project: opts.project,
        ignore: opts.ignore
    });
    var dirPath = opts.project;
    var version = opts.version;

    console.log(chalk.blue("[All file]: \n    ") + fileArr.join("\n    "));
    var md5Arr = _getDirMd5(fileArr);
    var md5Str = _generateMd5(md5Arr);
    md5Str = md5Str.toUpperCase();
    console.log(chalk.blue("[MD5]: ") + chalk.red(md5Str));

    if (!fs.existsSync(dirPath + "/MANIFEST.properties")) {
        fs.writeFileSync(dirPath + "/MANIFEST.properties", "");
    }

    propUtil.writeProp(dirPath + "/MANIFEST.properties", {
        version: version,
        md5: md5Str
    });
    return {
        project: dirPath,
        version: version,
        md5: md5Str
    }
}

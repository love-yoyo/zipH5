var fs = require('fs');

var getPlatform = function(path) {
    if (fs.existsSync(path, "utf8")) {
        if (fs.readFileSync(path, "utf8") == "") {
            throw new Error(path + " ecoding must be utf-8");
            return
        }
    } else {
        throw new Error(path + ' not exist');
        return
    }
    var file = fs.readFileSync(path, 'utf8');

    var replacedFile = file.replace(/\r\n/g, '\n').replace();
    var lineArr = replacedFile.split('\n');

    var _platform;
    for (var i = 0; i < lineArr.length; i++) {
        var line = lineArr[i];
        var _androidReg = /<\s*script.*src.*file:\/\/\/android_asset\/bestpay\.html5\.js.*>\s*<\s*\/\s*script\s*>/;
        var _iosReg = /<\s*script.*src.*\.\/bestpay\.html5\.js.*>\s*<\s*\/\s*script\s*>/;
        if (_androidReg.test(line)) {
            _platform = 'android';
            break;
        } else if (_iosReg.test(line)) {
            _platform = 'ios';
            break;
        } else {

        }
    }
    console.log("_platform:" + _platform);
    return _platform;
}

// getPlatform('../src/giftmoney/main.html');

module.exports = getPlatform;

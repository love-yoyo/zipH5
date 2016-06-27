var PropParser = require('properties-parser');
var fs = require('fs');

exports.writeProp = function(propPath,options){
    // console.log("exist:"+fs.existsSync(propPath));
    // console.log("exist:"+propPath);
    if (fs.existsSync(propPath) && !fs.statSync(propPath).isDirectory()) {
        var _date = new Date();
        var comment = _date.getFullYear() + "/" + (_date.getMonth()+1) +"/"+ (_date.getDate()) +" generate by zipH5 program";
        
        var propParser = PropParser.createEditor(propPath);
        // propParser.addHeadComment(comment);
        propParser.set("MD5",options.md5);
        propParser.get("MAIN") || propParser.set("MAIN","main.html");
        propParser.set("VERSION",options.version);
        propParser.save();
        
    } else {
        throw new Error("MANIFEST.properties may have error, please check");
    }
}
var 
fs = require('fs');
ActionFactory = require('../lib/action-factory'),
Package = require("./package"),
Build = ActionFactory.create("build");
child_process = require('child_process');

Build.MESSAGE = {
    USAGE   : "usage: ctx package [options]",
    DESCRIBE: "在本地环境执行ctx package"
};

Build.prototype.run = function(){
    var args = ["-e","dev","c","."];
    new Package(args).run();
}


module.exports = Build;
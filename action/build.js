var 
fs = require('fs');
ActionFactory = require('../lib/action-factory'),
Build = ActionFactory.create("build");
child_process = require('child_process');

Build.MESSAGE = {
    USAGE   : "usage: ctx package [options]",
    DESCRIBE: "执行ctx package && ctx upload并将参数传入"
};

// demo: ctx upload -h spud.in -u spudin -p ppp -d /Users/spud/Git/cortex/build/build-1351144024172 -r blah
Build.prototype.run = function(){
    var rest = process.argv.splice(2);
    var pkg = "ctx package "+rest.join(" ");
    var upload = "ctx upload"+rest.join(" ");

    childprocess.exec([pkg,upload].join("&&"));
}


module.exports = Build;
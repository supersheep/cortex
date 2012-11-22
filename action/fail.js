var 

fs = require("fs"),
lang = require("../util/lang"),
ActionFactory = require("../lib/action-factory"),
path = require("path"),
Fail = ActionFactory.create("fail");


Fail.AVAILIABLE_OPTIONS = {
    cwd: {
        alias: ["-c", "--cwd"],
        length: 1,
        description: "发布失败的项目的地址。"
    },
    
    env: {
        alias: ["-e", "--env"],
        length: 1,
        description: "发布失败的项目的阶段。alpha, qa, pro"
    }
};


Fail.prototype.run = function() {
    var options = this.options,
        cwd = options.cwd;
        
    // always generate an absolute dir
    if(cwd){
        // if is relative directory
        if(cwd.indexOf('..') === 0 || cwd.indexOf('.') === 0){
            cwd = path.join(process.cwd(), cwd);
        }
    
    // if no root specified, use current working directory
    }else{
        cwd = process.cwd();
    }
    
    fs.unlinkSync( path.join(cwd, '.cortex', options.env + '-pack', 'pack-' + lang.dateString() ) );
};


Fail.MESSAGE = {
    USAGE: "usage: ctx fail -e <env> -c <cwd>",
    DESCRIBE: "说明该项目上线失败，它用于告知 cortex，重置"
};


module.exports = Fail;
var

fs = require("fs"),
path = require("path"),

REGEX_IS_JS = /\.js$/i,


Actions = fs.readdirSync(__dirname).filter(function(name){
    return REGEX_IS_JS.test(name) || fs.statSync(path.join(__dirname, name)).isDirectory();
}),
ActionFactory = require("../lib/action-factory"),
util = require("util");


Help = ActionFactory.create("Help");

Help.prototype.run = function(){
    var ctx = require("../bin/cortex");

    var mods = this.modules;
    var mod;
    var modname = mods[0];
    var msg;

    if(!modname){
        Actions.forEach(function(name){
            var msg = getHelp(require("./" + name));
            msg && console.log(msg);
        });
    }else{
        mod = require("./" + modname);
        msg = getHelp(mod,true);
        msg && console.log(msg);
    }
}

function getHelp(action,verbose){
    var name = action.NAME,
        msg;
     

    msg = util.format("ctx %s\n%s\n       %s\n",
        name.toLowerCase(),
        action.MESSAGE.USAGE,
        action.MESSAGE.DESCRIBE
    );

    if(verbose){
        var opts = action.AVAILIABLE_OPTIONS;
        var alias;

        msg += "\n";
        for(var key in opts){
            alias = opts[key].alias.join(", ");
            msg += "       " + opts[key].alias + remainSpaces(16,alias) + opts[key].description + "\n";
        }
    }
    
    return msg;
}


Help.MESSAGE = {
    USAGE: "usage: ctx help <action>",
    DESCRIBE: "查看某条命令的详细使用方法及参数"
};

function remainSpaces(num,left){
    var ret = '',
        len = left.length;

    for(var i = num ; i > len ; i--){
        ret += ' ';
    }

    return ret;
}

module.exports = Help;
var 

fs = require("fs"),
fsMore = require("../util/fs-more"),
lang = require("../util/lang"),
ActionFactory = require("../lib/action-factory"),
path = require("path"),
async = require("async"),
Init = ActionFactory.create("init");


Init.AVAILIABLE_OPTIONS = {};

/**
 * commander's prompt has bug with async,
 * we must press enter twice to ensure input
 * so here implements prompt on our own
 */
function cmd(msg,cbstr,callback){
    var stdout = process.stdout,
        stdin = process.stdin;

    stdin.resume();
    stdout.write(msg);
    stdin.removeAllListeners("data");
    stdin.on("data",function(chunk){
        var str = chunk.toString();
        if(str[str.length-1]=="\n"){
            callback(cbstr(str.slice(0,str.length-1)));
        }
    });
}
function prompt(msg,callback){
    cmd(msg,function(str){
        return str;
    },callback);
}
function confirm(msg,callback){
    cmd(msg,function(str){
        return str == "y" || str == "yes";
    },callback);
}



function series(tasks,callback){
    var currentTask = tasks[0];
    series.results = series.results || [];
    function done(err,result){
        if(err){
            callback(err);
            series.results = [];
        }

        series.results.push(result);
        tasks.shift();
        series(tasks,callback);

    }

    if(tasks.length){
        currentTask(done)
    }else{
        callback(null,series.results);
        series.results = [];
    }
}

Init.prototype.run = function() {
    var files = fs.readdirSync(process.cwd()),
        tasks = [],
        dirs = [],
        pkg = {},
        stat;

    var start = ["这个小工具会帮助你指定文件打包后的路径",
                "结果将会以文件名 package.json 保存于 .cortex 文件夹中",
                "请在你的版本控制工具中保留该文件 ♥"].join("\n");
    
    console.log(start+"\n");

    for(var i=0,l=files.length;i<l;i++){
        stat = fs.lstatSync(files[i])
        if(!stat.isDirectory() || files[i][0]== "."){
            continue;
        }

        tasks.push((function(i){
            return function(done){
                var dir = files[i];
                var pmpt = lang.sub("将 {dir} 发布到: ({dir}) ",{
                    dir:dir
                });
                prompt(pmpt,function(to){
                    var pair = {"dir": dir + "/"};
                    to && (pair.to = to);
                    dirs.push(pair);
                    done(null);
                })
            }
        })(i));
    }

    series(tasks,function(err){
        var content;
        pkg.dirs = dirs;
        if(!dirs.length){
            console.log("当前目录下没有文件夹，请添加文件夹后再执行 ctx init");
            return;
        }
        content = JSON.stringify(pkg,null,2);
        console.log("文件内容为:\n"+content);
        confirm("确定写入? (y/yes) ",function(sure){
            if(sure){
                fsMore.mkdirSync(".cortex");
                fsMore.writeFileSync(".cortex/package.json",content);
                console.log(".cortex/package.json 已写入");
            }else{
                console.log("你取消了操作");
            }
            process.stdin.destroy();  
        });
    });
};


Init.MESSAGE = {
    USAGE: "usage: ctx init",
    DESCRIBE: "用于初始化项目中的cortex目录"
};


module.exports = Init;
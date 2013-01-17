var 

fs = require("fs"),
path = require("path"),
express = require("express"),
fsMore = require("../util/fs-more"),
ActionFactory = require("../lib/action-factory"),
Server = ActionFactory.create("server");


Server.AVAILIABLE_OPTIONS = {
    port: {
        alias: ["-p", "--port"],
        length: 1,
        description: "指定运行端口，默认为1337"
    },
    fallback: {
        alias: ["-f", "--fallback"],
        length: 1,
        description: "指定回滚host，默认为f2e.dp:1337"
    }
};

function addslash(p){
    return p.indexOf("/") == 0 ? "/" + p : p;
}

Server.prototype.run = function() {
    var root = process.cwd();
    var dirs = fs.readdirSync(root);

    var paths = {};

    dirs.forEach(function(dir){
        var packagePath = path.join(dir,".cortex","package.json");

        if(!fs.existsSync(packagePath)){
            return false;
        }


        console.log("正在为 " + dir + " 建立文件映射");
        var json = JSON.parse(fs.readFileSync(packagePath));

        json.dirs.forEach(function(d){
            var from = addslash(d.dir);
            var to = addslash(d.to || d.dir);
            var curroot = path.join(dir,from);


            fsMore.traverseDir(curroot,function(info){
                if(info.relPath.indexOf(".") == 0 || info.isDirectory){return false;}
                var url = "/" + path.join(to,info.relPath);
                var fullpath = info.fullPath;

                fullpath = info.fullPath.split()
                paths[url] = path.join(root,curroot,info.relPath);
            });
        });
    });

    var port = this.options.port || 1337;

    express().use(function(req,res){
        var file = paths[req.url];
        if(file){
            res.sendfile(file);
        }else{
            res.send(404);
        }
    }).listen(port);

    console.log("cortex 静态服务已在 " + port + " 启动!");
};


Server.MESSAGE = {
    USAGE: "usage: ctx server -e <env> -c <cwd>",
    DESCRIBE: "说明该项目上线失败，它用于告知 cortex，重置"
};


module.exports = Server;
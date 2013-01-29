var 

fs = require("fs"),
url = require("url"),
lang = require("../util/lang"),
path = require("path"),
express = require("express"),
request = require("request"),
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
        description: "指定回滚host"
    },
    statichost:{
        alias:["-s","--statichost"],
        length: 1,
        description: "指定用来替代的静态server，默认为i{n}.static.dp"
    }
};

function addslash(p){
    return p.indexOf("/") == 0 ? p : ("/" + p);
}

Server.prototype.run = function() {
    var self = this;
    var root = process.cwd();
    var dirs = fs.readdirSync(root);

    var paths = {};

    var default_config,default_config_path,port,fallback;
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
                var url = addslash(path.join(to,info.relPath));
                var fullpath = info.fullPath;

                fullpath = info.fullPath.split()
                paths[url] = path.join(root,curroot,info.relPath);
            });
        });
    });

    default_config_path = fsMore.stdPath(path.join("~",".cortex","server.json"));
    if(fs.existsSync(default_config_path)){
        default_config = JSON.parse(fs.readFileSync(default_config_path));
    }else{
        default_config = {};
    }


    lang.merge(this.options,default_config,false);

    port = self.options.port;
    fallback = self.options.fallback;
    
    express()
    .use(express.bodyParser())
    .use(function(req,res){
        var file = paths[req.path],
            file_full_path = path.join(process.cwd(),req.path),
            fallback_url,
            headers = {},
            proxy_req;

        if(file){
            res.sendfile(file);
            return;
        }else if(fs.existsSync(file_full_path) && !fsMore.isDirectory(file_full_path)){
            res.sendfile(file_full_path);
            return;
        }

        if(fallback){
            fallback_url = "http://"+fallback+req.url;
            headers["User-Agent"] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.52 Safari/537.17";

            if(req.headers.referer){
                headers["Referer"] = "http://"+ fallback + url.parse(req.headers.referer).path;
            }
            request({
                url:fallback_url,
                method:req.method,
                form:req.body,
                headers:headers
            },function(err,response,body){
                var replace = self.options.replace;
                replace.forEach(function(pair){
                    body = body && body.replace(new RegExp(pair[0],"g"),pair[1]);
                });
                res.send(res.statusCode,body);
            });
        }else{
            res.send(404);
        }

    }).listen(port);

    console.log("cortex 静态服务已在 " + port + " 启动! host: "+ fallback );
};


Server.MESSAGE = {
    USAGE: "usage: ctx server -p <port> -f <fallback> -s <statichost>",
    DESCRIBE: "在本地工作目录启动服务，根据项目配置建立映射，并可将未找到的路径反向代理到指定的host上"
};


module.exports = Server;
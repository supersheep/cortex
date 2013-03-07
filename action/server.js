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
    ajax:{
        alias:["-a","--ajax"],
        length: 1,
        description: "指定ajax假数据的host，比如tada.f2e.dp"
    }
};

function addslash(p){
    return p.indexOf("/") == 0 ? p : ("/" + p);
}


function parseHeader(req,host){
    var headers = {};
    // for(var key in req.headers){
    //     headers[key] = req.headers[key];
    // }

    ["x-requested-with","cookie","user-agent"].forEach(function(key){
        req.headers[key] && (headers[key] = req.headers[key]);
    })
    if(req.headers.referer){
        headers["referer"] = "http://"+ host + url.parse(req.headers.referer).path;
    }
    return headers;
}

// 从映射文件中获取
function fromMapping(req,res,next){

    var file = this.paths[req.path];
    if(file){
        res.sendfile(file);
        return;
    }
    next();
}

function fromDirectFile(req,res,next){
    var file_full_path = path.join(process.cwd(),req.path);

    if(!fs.existsSync(file_full_path)){next();return;}
    if(fsMore.isDirectory(file_full_path)){next();return;}

    if(!path.extname(file_full_path)){
        res.type("html");
    }
    res.sendfile(file_full_path);
}

function proxyTo(req,res,host,cb){
    request({
        url: req.protocol + "://" + host + req.url,
        method:req.method,
        form:req.body,
        headers:parseHeader(req,host)
    },cb);
}

function replaceBody(body,req){
    var opt = this.options
    var replace = opt.replace;
    replace.forEach(function(pair){
        body = body && body.replace(new RegExp(pair[0],"g"),lang.sub(pair[1],{
            port:opt.port,
            host:req.host
        }));
    });
    return body;
}

function fromTada(req,res,next){
    var self = this,
        host = this.options.ajax;

    if(!host){next();return;}
    if(req.xhr){
        proxyTo(req,res,host,function(err,resp,body){
            if(err){next();return;}
            if(resp.statusCode !== 200){next();return;}
            for(var key in resp.headers){
                res.set(key,resp.headers[key]);
            }
            res.set("X-Proxy-From",host);
            res.send(resp.statusCode,replaceBody.call(self,body,req));   
        });
    }else{
        next();
    }
}


function setHeader(res,k,v){
    if(k == "set-cookie"){
        v = v.replace(/Domain=[^;]*;/g,"");
    }

    res.set(k,v);
}

function fromFallback(req,res,next){
    var self = this,
        host = this.options.fallback;

    var kv = {};

    if(!host){next();return;} 
    proxyTo(req,res,host,function(err,resp,body){
        var value;
        if(err){res.send(500,err);return;}
        for(var key in resp.headers){
            value = resp.headers[key];

            if(lang.isArray(value)){
                value.forEach(function(v){
                    setHeader(res,key,v);
                });
            }else{
                setHeader(res,key,value);
            }
        }

        body = replaceBody.call(self,body,req);
        res.set("X-Proxy-From",host);
        res.set("content-length","");
        res.send(resp.statusCode,body);   
    });
}

function notFound(req,res,next){
    res.send(404);
}


Server.prototype.prepareMapping = function(){
    var paths = {};
    var root = process.cwd();
    var dirs = fs.readdirSync(root);
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

    this.paths = paths;
}

Server.prototype.setOptions = function(){

    var default_config_path = fsMore.stdPath(path.join("~",".cortex","server.json"));
    if(fs.existsSync(default_config_path)){
        default_config = JSON.parse(fs.readFileSync(default_config_path));
    }else{
        default_config = {};
    }

    lang.merge(this.options,default_config,false);
}

Server.prototype.run = function() {
    var self = this;

    self.prepareMapping();
    self.setOptions();


    express()
    // .use(express.logger())
    .use(express.bodyParser())
    .use(fromMapping.bind(self))
    .use(fromDirectFile.bind(self))
    .use(fromTada.bind(self))
    .use(fromFallback.bind(self))
    .use(notFound)
    .listen(self.options.port)

    console.log("cortex 静态服务已在 " + self.options.port + " 启动! host: "+ self.options.fallback );
};


Server.MESSAGE = {
    USAGE: "usage: ctx server -p <port> -f <fallback> -s <statichost>",
    DESCRIBE: "在本地工作目录启动服务，根据项目配置建立映射，并可将未找到的路径反向代理到指定的host上"
};


module.exports = Server;
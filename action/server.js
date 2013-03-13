var 

fs = require("fs"),
url = require("url"),
lang = require("../util/lang"),
path = require("path"),
express = require("express"),
request = require("request"),
fsMore = require("../util/fs-more"),
ActionFactory = require("../lib/action-factory"),
ConfigHandler = require('../lib/config-handler'),
Server = ActionFactory.create("server");


Server.AVAILIABLE_OPTIONS = {
    port: {
        alias: ["-p", "--port"],
        length: 1,
        description: "指定运行端口，默认为1337"
    },

    env: {
        alias: ["-e", "--env"],
        length: 1,
        description: "指定运行的环境"
    },

    fallback: {
        alias: ["--fallback"],
        length: 1,
        description: "指定回滚host"
    },

    ajax:{
        alias:["--ajax"],
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

function rewrite(req,res,next){
    req.url = req.url
    .replace(/\.v[0-9]+/,'')
    .replace(/\.[a-zA-Z0-9]{32}/,'')
    .replace(/\.min/,"");

    next();
}

// 从映射文件中获取
function fromMapping(req,res,next){
    var reqpath = url.parse(req.url).pathname;
    var file = this.paths[reqpath];

    if(file){
        res.sendfile(file);
        return;
    }
    next();
}

function fromBuild(req,res,next){
    var reqpath = url.parse(req.url).pathname;
    var rule = this.builds[reqpath];
    if(rule){
        rule.out(req,res,rule.data);
        return;
    }
    next();
}

function fromDirectFile(req,res,next){
    var reqpath = url.parse(req.url).pathname;
    var file_full_path = path.join(process.cwd(),reqpath);

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
        var packagePath = path.join(dir,".cortex","package.json"),
            json;

        if(!fs.existsSync(packagePath)){
            return false;
        }

        console.log("正在为 " + dir + " 建立文件映射");

        try{
            json = JSON.parse(fs.readFileSync(packagePath));
        }catch(e){
            console.log("JSON parse error ",packagePath);
            return;
        }

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

Server.prototype.prepareBuild = function(){
    var self = this;
    var builds = {};
    var root = process.cwd();
    var dirs = fs.readdirSync(root);
    var build_filter_dir = path.join(__dirname,"..","filter","server");
    var filters = fs.readdirSync(build_filter_dir);

    dirs.forEach(function(dir){
        var build_file_path = path.join(root,dir,"build.json");
        var build_rule;
        if(!fs.existsSync(build_file_path)){
            return false;
        }

        try{
            build_rule = JSON.parse(fs.readFileSync(build_file_path));
        }catch(e){
            console.log(e,content);
            return false;
        }

        filters.forEach(function(filter_file_name){
            var filter_name = path.basename(filter_file_name,".js")
                ,filter_path = path.join(build_filter_dir,filter_file_name)
                ,data = build_rule[filter_name]
                ,filter
                ,rules;

            if(!fs.existsSync(filter_path) || !data){return false;}
            filter = require(filter_path);
            rules = filter.parse(path.join(root,dir),data);
            rules.forEach(function(rule){
                builds[rule.path] = {
                    out:filter.out,
                    data:rule.data
                }
            });
        });
    });
    self.builds = builds;
}

Server.prototype.setOptions = function(){
    if(!this.options.env){
        this.options.env = "alpha";
        console.log("由于未指定环境，将自动设置为 alpha，如果需要指定，请使用 -e, --env 参数")
    }

    var ch = new ConfigHandler({
            file: '.cortex' + path.sep + 'server.json',
            env: this.options.env,
            excludes: ['env']
        });
        
    ch.getConf(this.options);

    if(!this.options.replace){
        this.options.replace = [];
    }

    if(typeof this.options.replace === 'string'){
        this.options.replace = this.options.replace.split(',').map(function(r) {
            return r.trim();
        });
    }

    if(!this.options.port){
        this.options.port = 8765;
    }
}

Server.prototype.run = function() {
    var self = this;

    self.setOptions();
    self.prepareMapping();
    self.prepareBuild();

    express()
    // .use(express.logger())
    .use(express.bodyParser())
    .use(rewrite.bind(self))
    .use(fromMapping.bind(self))
    .use(fromBuild.bind(self))
    .use(fromDirectFile.bind(self))
    .use(fromTada.bind(self))
    .use(fromFallback.bind(self))
    .use(notFound)
    .listen(self.options.port)

    console.log("cortex 静态服务已在 localhost:" + self.options.port + " 启动! 将 fallback 到 " + self.options.fallback );
};


Server.MESSAGE = {
    USAGE: "usage: ctx server -p <port> -f <fallback> -s <statichost>",
    DESCRIBE: "在本地工作目录启动服务，根据项目配置建立映射，并可将未找到的路径反向代理到指定的host上"
};


module.exports = Server;
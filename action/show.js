var 

fs = require("fs"),
lang = require("../util/lang"),
ActionFactory = require("../lib/action-factory"),
path = require("path"),
request = require("request"),
Show = ActionFactory.create("fail"),
async = require("async"),
exec = require("child_process").exec;

function fetchName(){
    exec("git branch",function(err,stdout,stderr){
        var project_num = stdout.split(/\n+/).filter(function(line){
            return !line.indexOf("*")
        })[0].slice(2);
        showName(project_num);
    });
}

function showName(num){
    request("http://zuji.dianpingoa.com/OutInterface/Task.ashx?taskno="+num,
       function(err,data){
        var meta = JSON.parse(data.body);

        console.log(JSON.stringify(meta,null,2));
    });
}

function showProject(num){
    var tasks = [],
        cwd = process.cwd();

    var dirs = fs.readdirSync(cwd);
    dirs.filter(function(dir){
        return fs.existsSync(path.join(dir,".git"))
    }).forEach(function(dir,i){
        tasks.push(function(done){
            exec("git branch",{
                cwd:path.join(cwd,dir)
            },function(err,stdout){
                if(stdout.match(num)){
                    done(null,dir);
                }else{
                    done(null,null);
                }
            });
        });
    });

    async.series(tasks,function(err,collection){
        console.log(collection.filter(function(item){return item}).join("\n"));
        showName(num)
    });
}

Show.prototype.run = function() {
    if(this.modules[0]) {
        showProject(this.modules[0]);
    }else{
        fetchName()
    }

};


Show.MESSAGE = {
    USAGE: "usage: ctx show",
    DESCRIBE: "查看当前项目信息"
};


module.exports = Show;
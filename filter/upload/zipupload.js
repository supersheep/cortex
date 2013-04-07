var 

path = require("path"),
async = require("async"),
child_process = require("child_process"),
// md5 = require("MD5"),
fs = require("fs"),
fsmore = require("../../util/fs-more"),
ftp_handler = require("../../lib/ftp-handler");


function Transfer(options){
    this.options = options;
};

Transfer.prototype = {

    run: function(callback){
        var 
        
        o = this.options,
        tasks = [],
        local_dir = o.from,
        cwd = o.cwd,
        name = "build.zip";

        if(!o.toFTP){
            console.log("please specify to ftp");
            process.exit(1);
        }

        console.log(local_dir);
        console.log(cwd);

        tasks.push(function(done){
            var command = "zip -r " + name + " *";
            console.log(command);
            child_process.exec(command,{
                cwd:path.join(local_dir)
            }, function(err,stdout){
                console.log(stdout);
                done();
            });
        });

        tasks.push(function(done){
            ftp_handler.uploadFile({
                localName   : path.join(local_dir,name),
                remoteName  : name,
                user        : o.toFTP.user,
                password    : o.toFTP.password,
                host        : o.toFTP.host,
                port        : o.toFTP.port 
            }, function(){
                done();
            });
        });
        
        this.env.local_dir = local_dir;
        
        async.series(tasks, callback);
    }
};


exports.create = function(options){
    return new Transfer(options);
};
exports.DESCRIBE = "将当前项目上传到to参数指定的ftp地址，若指定了from参数，将先从该地址下载包"

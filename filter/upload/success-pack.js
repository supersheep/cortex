var 

path = require("path"),
async = require("async"),
fs = require("fs"),
fsmore = require("../../util/fs-more"),
ftp_handler = require("../../lib/ftp-handler");

function SuccessLock(options){
    this.options = options;
};


SuccessLock.prototype = {

    run: function(callback){
        var 
        
        o = this.options,
        tasks = [],
        temp_download_dir = fsmore.stdPath( path.join('~', '.cortex/temp-download') ),
        base_dir = o.fromFTP ? o.fromFTP.dir : this.env.local_dir,
        from_path = path.join(base_dir,"..","..","latest-pack"),
        from_success_path = path.join(base_dir,"..","..","success-pack"),
        local_path = path.join(temp_download_dir,"latest-pack"),
        local_dir;
        
        if(o.fromFTP){

            local_dir = temp_download_dir;

            tasks.push(function(done){
                ftp_handler.downloadFile({
                    localName    : local_path,
                    remoteName   : from_path,
                    user        : o.fromFTP.user,
                    password    : o.fromFTP.password,
                    host        : o.fromFTP.host,
                    port        : o.fromFTP.port
                },function(done){
                    console.log("download " + from_path + " from " + local_path);
                    done();
                });
            });
        }else{
            tasks.push(function(done){
                fsmore.copyFileSync(from_path,local_path);
                done();
            });
        }

         if(o.fromFTP){
            tasks.push(function(done){
                ftp_handler.uploadFile({
                    localName    : local_path,
                    remoteName   : from_success_path,
                    user        : o.toFTP.user,
                    password    : o.toFTP.password,
                    host        : o.toFTP.host,
                    port        : o.toFTP.port
                }, function(){
                    console.log("upload " + local_path + " from " + from_success_path);
                    done();
                });
            });
        }else{
            tasks.push(function(done){
                console.log("move " + from_path + " to " + from_success_path);
                fsmore.copyFileSync(local_path,from_success_path);
                done();
            });
        }
        
        async.series(tasks, callback);
    }
};


exports.create = function(options){
    return new SuccessLock(options);
};

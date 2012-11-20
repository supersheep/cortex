var 

path = require("path"),
async = require("async"),
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
        temp_download_dir = fsmore.stdPath( path.join('~', '.cortex/temp-download') ),
        local_dir = o.from;
        
        if(o.fromFTP){
            local_dir = temp_download_dir;
        
            fsmore.mkdirSync(temp_download_dir);
            fsmore.emptyDirSync(temp_download_dir);
            
            tasks.push(function(done){
                ftp_handler.download({
                    localDir    : temp_download_dir,
                    remoteDir   : o.fromFTP.dir,
                    user        : o.fromFTP.user,
                    password    : o.fromFTP.password,
                    host        : o.fromFTP.host,
                    port        : o.fromFTP.port
                    
                }, function(){
                    done(); 
                });
            });
        }
        
        if(o.toFTP){
            tasks.push(function(done){
                ftp_handler.upload({
                    localDir    : local_dir,
                    remoteDir   : o.toFTP.dir,
                    user        : o.toFTP.user,
                    password    : o.toFTP.password,
                    host        : o.toFTP.host,
                    port        : o.toFTP.port
                    
                }, function(){
                    done();
                });
            });
            
        }else{
            tasks.push(function(done){
                fsmore.copyDirSync(local_dir, o.to);
            });
        }
        
        this.env.local_dir = local_dir;
        
        async.series(tasks, callback);
    }
};


exports.create = function(options){
    return new Transfer(options);
};
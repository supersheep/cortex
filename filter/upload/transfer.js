var 

path = require("path"),
async = require("async"),
md5 = require("MD5"),
fs = require("fs"),
fsmore = require("../../util/fs-more"),
ftp_handler = require("../../lib/ftp-handler");


function generateMd5Path(fullpath){
    console.log("fullpath",fullpath);
    var extname = path.extname(fullpath),
        dirname = path.dirname(fullpath),
        basename = path.basename(fullpath,extname),
        md5code = md5(fs.readFileSync(fullpath));

    var md5path = dirname+path.sep+basename+"."+md5code+extname;

    return md5path;
}


function inCortex(info){
    return info.relPath.indexOf(".cortex") == 0;
}

function pathWithMd5(info){
    return /\.[a-z0-9]{32}\./.test(info.relPath)
}

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

        // make md5 files
        tasks.push(function(done){
            fsmore.traverseDir(local_dir,function(info){
                var fullpath = info.fullPath,
                    md5path;

                if(info.isFile && !inCortex(info) && !pathWithMd5(info)){
                    md5path = generateMd5Path(fullpath);
                    console.log("cp",fullpath,md5path);
                    fsmore.copyFileSync(fullpath,md5path);
                }
            });
            done();
        });
        
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

var 

path = require("path"),
async = require("async"),
// md5 = require("MD5"),
fs = require("fs"),
child_process = require("child_process"),
fsmore = require("../../util/fs-more"),
ftp_handler = require("../../lib/ftp-handler"),
temp_download_dir = fsmore.stdPath( path.join('~', '.cortex/temp-download') ),
zipname = "build.zip",
zippath = path.join(temp_download_dir,zipname);


function Transfer(options){
    this.options = options;
};


function downloadZip(done){
    var o = this.options;
    var remote_zipname = o.fromFTP.dir;
    ftp_handler.downloadFile({
        localName   : zippath,
        remoteName  : remote_zipname,
        user        : o.fromFTP.user,
        password    : o.fromFTP.password,
        host        : o.fromFTP.host,
        port        : o.fromFTP.port
    }, function(){
        done(); 
    });
}

function unzip(done){
    var command = "unzip " + zippath + " -d " + temp_download_dir;
    console.log(command);
    child_process.exec(command, {
        cwd:path.join(zippath,'..')
    }, function(err,stdout){
        console.log(stdout);
        done();
    });
}

function downloadDir(done){
    var o = this.options;
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
}


Transfer.prototype = {

    run: function(callback){
        var 
        
        o = this.options,
        tasks = [],
        local_dir = o.from;
        if(o.fromFTP){
            local_dir = temp_download_dir;
        
            fsmore.mkdirSync(temp_download_dir);
            fsmore.emptyDirSync(temp_download_dir);

            if(path.extname(o.fromFTP.dir) == ".zip"){
                tasks.push(downloadZip.bind(this));    
                tasks.push(unzip.bind(this));
            }else{
                tasks.push(downloadDir.bind(this));
            }
            
        }

        if(o.toFTP){
            tasks.push(function(done){
                ftp_handler.upload({
                    localDir    : local_dir,
                    remoteDir   : o.toFTP.dir,
                    user        : o.toFTP.user,
                    password    : o.toFTP.password,
                    host        : o.toFTP.host,
                    port        : o.toFTP.port,
                    uploadCtx   : o.uploadCtx   
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
exports.DESCRIBE = "将当前项目上传到to参数指定的ftp地址，若指定了from参数，将先从该地址下载包"

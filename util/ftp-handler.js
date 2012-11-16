var 

fsmore = require('./fs-more'),
path = require('path'),
FTPClient = require('ftp'),
async = require("async"),
fs = require('fs'),
color = require('colors'),
conn = new FTPClient();


function traverseUpload(localDir, remoteDir, cb){
    var remoteDir,cb;
    var tasks = [];

    console.log("uploading " +localDir + " -> " + remoteDir);
    tasks.push(function(done){
        process.stdout.write("mkdir "+remoteDir+" ");
        conn.mkdir(remoteDir,function(e){
            if(e){
                process.stdout.write(("fail "+e).red+"\r\n");
            }else{
                process.stdout.write("done".green+"\r\n");
            }
            done();
        })
    });

    fsmore.traverseDir(localDir,function(info){
        var task;
        var dest = path.join(remoteDir,info.relPath);
        if(info.isFile){
            task = function(done){
                process.stdout.write("upload "+dest+" ");
                conn.put(fs.createReadStream(info.fullPath),dest,function(e){
                    if(e){
                        process.stdout.write(("fail "+e).red+"\r\n");
                    }else{
                        process.stdout.write("done".green+"\r\n");
                    }
                    done();
                });
            }
        }

        if(info.isDirectory){
            task = function(done){
                process.stdout.write("mkdir "+dest+" ");
                conn.mkdir(dest,function(e){
                    if(e){
                        process.stdout.write(("fail "+e).red+"\r\n");
                    }else{
                        process.stdout.write("done".green+"\r\n");
                    }
                    done();
                });
            }
        }

        tasks.push(task);
    });

    async.series(tasks,cb);
}
 
function upload(options, callback){
    conn.removeAllListeners('connect');
    conn.on('connect', function() {
        // authenticate as anonymous
        console.log("connecting ftp");
        conn.auth(options.username,options.password,function(e) {
            if (e){
                throw e;
            }
            
            traverseUpload(options.localDir,options.remoteDir,function(e){
                if(e){
                    console.log(e);
                }
                
                console.log("upload finished");
                callback();
                conn.end();
            });
        });
    });
    
    conn.connect(options.port||21,options.host);
};


function traverseDownload(remoteDir, localDir, callback){
    fsmore.mkdirSync(localDir);

    var tasks = [];

    conn.list(function(e, entries) {
        if(e){
            throw e;
        }
    
        var i = 0, 
            len = entries.length,
            entry;
        
        for (; i < len; ++i) {
            entry = entries[1];
        
        
            if (typeof entry === 'string'){
                console.log('<raw entry>: ' + entries[i]);
            
            } else {
                if(entry.type === '-'){
                
                    tasks.push(function(done){
                        downloadFile(path.join(remoteDir, entry.name), path.join(localDir, entry.name), function(e, stream, data){
                            stream.on('success', function() {
                                done();
                            });
                        
                            stream.on('error', function(e) {
                                conn.end();
                                throw e;
                            });
                            
                            stream.pipe(fs.createWriteStream(data.localName));
                        });
                    });
                
                }else if(entry.type === 'd'){
                    tasks.push(function(done){
                        traverseDownload(path.join(remoteDir, entry.name), path.join(remoteDir, entry.name), function(){
                            done();
                        }); 
                    });
                    
                }
            }
        }
        
        async.series(tasks, callback);
    });
});


function downloadFile(remoteName, localName, callback){
    conn.get(remoteName, function(e, stream) {
        callback(e, stream, {
            localName: localName
        });
    });
};


function download(options, callback){
    conn.removeAllListners('connect');
    conn.on('connect', function(){
        conosle.log()
        
        conn.auth(options.username, options.password, function(e){
            if(e){
                throw e;
            }
            
            traverseDownload(options.remoteDir, options.localDir, function(e){
                if(e){
                    console.log(e);
                }
                callback();
                conn.end();
            });
        });
    });
    
    conn.connect(options.port || 21, options.host);
};


exports.upload = upload;
exports.download = download;
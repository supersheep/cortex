var fsMore = require("../../util/fs-more"),
    async = require("async"),
    lang = require("../../util/lang"),
    fs = require("fs"),
    md5 = require("MD5"),
    child_process = require("child_process"),
    path_mod = require("path");



function CompressBase(options){
    this.options = options;
}



CompressBase.prototype = {
    _extNeedCompress:function(path){
        return this.options.ext.some(function(ext){
            return path_mod.extname(path) === "." + ext;
        });
    },

    _isNotMin:function(path){
        return !/\.min\.\w{2,3}$/.test(path);
    },

    _makeMinPath:function(path){
        var extname = path_mod.extname(path);
        return path.replace(extname,".min"+extname);
    },

    _get_md5_path:function(contents_md5){
        var file_path = path_mod.join(this.env.build_dir,"..","..","compress-cache",contents_md5);
        return file_path;
    },
    _is_changed:function(md5_path){
        return fs.existsSync(md5_path);
    },
    setup:function(done){
        this.root = this.env.build_dir; //config.cwd;
        this.project_base = path_mod.join(__dirname,"..","..");
        done();
    },

    run:function(done){
        var self = this,
            root = self.root,
            tasks = [];


        fsMore.traverseDir(root, function(info){
            var relpath = info.relPath,
                parsed,
                css_in_file_list;
            
            if(info.isFile && self._extNeedCompress(relpath) && self._isNotMin(relpath)){
                tasks.push(function(done){
                    var 
                    dir = path_mod.join(self.project_base,'tool',self.options.path)
                    ,path = info.fullPath
                    ,minpath = self.options.nomin ? path : self._makeMinPath(path)
                    ,command = lang.sub(self.options.command,{
                        dir:dir,
                        path:path,
                        minpath:minpath
                    })
                    ,content = fs.readFileSync(path)
                    ,contents_md5 = md5(content)
                    ,md5_path = self._get_md5_path(contents_md5);
                    
                    console.log("command is "+command);
                    if(self._is_changed(md5_path)){
                        console.log("/" + relpath,"未变动");
                        fsMore.copyFileSync(md5_path,minpath);
                        done();
                    }else{
                        child_process.exec(command,function(err){
                            if(err){
                                done(err);
                                return;
                            }else{
                                self.printMsg("compressed",{
                                    path:path,
                                    minpath:minpath
                                });
                                fsMore.copyFileSync(minpath,md5_path);
                                done(null);
                            }
                        });
                    }
                });

            }
        });

        async.series(tasks,function(err){
            if(err){
                throw new Error(err);
                return;
            }
            done();
        });
    },

    printMsg:function(name,args){
        console.log(lang.sub(this.options.messages[name],args));
    },
    tearDown:function(done){
        this.printMsg("end");
        done();
    }
}

module.exports = CompressBase;
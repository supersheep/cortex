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
    _is_not_changed:function(md5_path){
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
            o = self.options,
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
                    ,md5_path = self._get_md5_path(contents_md5)
                    ,changed = false
                    ,empty = false
                    ,origin_size = fs.lstatSync(path).size
                    ,compressed_size
                    ,stats;


                    if(self._is_not_changed(md5_path)){
                        fsMore.copyFileSync(md5_path,minpath,{
                            encoding:"binary"
                        });
                        stats = fs.lstatSync(minpath);
                        compressed_size = stats.size;
                        if(!compressed_size){
                            empty = true;
                            fs.writeFileSync(minpath,content,{
                                encoding:"binary"
                            });
                            compressed_size = origin_size;
                        }

                        self.printMsg("compressed",{
                            path:relpath,
                            md5:contents_md5.substr(0,7),
                            minpath:self._makeMinPath(relpath),
                            compressed_size:compressed_size,
                            origin_size:origin_size,
                            percantage:(100-compressed_size/origin_size*100).toFixed(2),
                            empty:empty,
                            changed:changed
                        });
                        
                        done(null)
                    }else{
                        child_process.exec(command,function(err){
                            if(err){
                                if(o.throwError){
                                    throw err;
                                }else{
                                    console.log("[WARN]" + path + "无法压缩" + err);
                                }
                            }

                            changed = true;
                            stats = fs.lstatSync(minpath);

                            compressed_size = stats.size;
                            if(!compressed_size){
                                empty = true;
                                fs.writeFileSync(minpath,content,{
                                    encoding:"binary"
                                });
                                compressed_size = origin_size;
                            }else{
                                fsMore.copyFileSync(minpath,md5_path,{
                                    encoding:"binary"
                                });
                            }

                            self.printMsg("compressed",{
                                path:relpath,
                                md5:contents_md5.substr(0,7),
                                minpath:self._makeMinPath(relpath),
                                compressed_size:compressed_size,
                                origin_size:origin_size,
                                percantage:(100-compressed_size/origin_size*100).toFixed(2),
                                empty:empty,
                                changed:changed
                            });
                            done(null); 

                        });
                    }
                });

            }
        });

        async.series(tasks,function(){
            // no error will come here
            done();
        });
    },

    printMsg:function(name,args){
        var msgs = {
            "end":this.options.ext.join(",") + "文件压缩完毕",
            "compressed":"已压缩 {path}"
            + (this.options.nomin ? "" : " 至 {minpath}") 
            + (" 压缩：{percantage}%")
            + ((args && args.empty)?" 为空":"")
            + ((args && args.changed)?" 有变动":"")
            + (" {md5}")
        }

        console.log(lang.sub(msgs[name],args));
    },
    tearDown:function(done){
        this.printMsg("end");
        done();
    }
}

module.exports = CompressBase;

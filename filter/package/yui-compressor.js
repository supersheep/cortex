var fsMore = require("../../util/fs-more"),
    async = require("async"),
    fs = require("fs"),
    md5 = require("MD5"),
    child_process = require("child_process"),
    path_mod = require("path");


/*
var base_dir = path_mod.join(__dirname,'..','res'), // 准备分析的目录
	root = path_mod.join(__dirname,'..',config.root_NAME); // 暂存文件夹
 */



function YUITraverser(options){
    this.options = options;
}



YUITraverser.prototype = {
    _isCss:function(path){
        return path_mod.extname(path) === ".css";
    },

    _isNotMin:function(path){
        return !/\.min\.css$/.test(path);
    },

    _makeMinPath:function(path){
        return path.replace(/\.css$/,".min.css");
    },

    _get_md5_path:function(contents_md5){
        var file_path = path_mod.join(this.env.build_dir,"..","..","compress-cache",contents_md5 + ".js");
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
            root = self.root;
        
        var tasks = [];


        fsMore.traverseDir(root, function(info){
            var relpath = info.relPath,
                parsed,
                css_in_file_list;
            
            if(info.isFile && self._isCss(relpath) && self._isNotMin(relpath)){
                tasks.push(function(done){
                    var dir = path_mod.join(self.project_base,'tool','yui-compressor','yuicompressor-2.4.7.jar');
                        path = info.fullPath,
                        minpath = self._makeMinPath(path);

                    var command = "java -jar " + dir + " --charset UTF-8 "+ path +" -o " + minpath;


                    var content = fs.readFileSync(path);

                    var content = fs.readFileSync(path);
                    var contents_md5 = md5(content);
                    var md5_path = self._get_md5_path(contents_md5);
                    if(self._is_changed(md5_path)){
                        console.log("/" + relpath,"not changed");
                        console.log("copying file from %s to %s",md5_path,minpath);
                        fsMore.copyFileSync(md5_path,minpath);
                        done();
                    }else{
                        child_process.exec(command,function(err){
                            if(err){
                                done(err);
                                return;
                            }else{
                                console.log("已压缩css文件",path,"至",minpath);
                                console.log("copying file from %s to %s",minpath,md5_path);
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

    tearDown:function(done){
        console.log("css压缩处理完毕");
        done();
    }
}

module.exports = {
    create:function(config){
        return new YUITraverser(config);
    }
};
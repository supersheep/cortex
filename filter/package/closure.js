var fsMore = require("../../util/fs-more"),
    async = require("async"),
    fs = require("fs"),
    child_process = require("child_process"),
    md5 = require("MD5"),
    path_mod = require("path");


/*
var base_dir = path_mod.join(__dirname,'..','res'), // 准备分析的目录
	root = path_mod.join(__dirname,'..',config.root_NAME); // 暂存文件夹
 */

var CompressBase = {
    
    
}



function ClosureTraverser(config){
}



ClosureTraverser.prototype = {
    _isJs:function(path){
        return path_mod.extname(path) === ".js";
    },

    _isNotMin:function(path){
        return !/\.min\.js$/.test(path);
    },

    _makeMinPath:function(path){
        return path.replace(/\.js$/,".min.js");
    },

    _get_md5_origin:function(){

        var latest_success_define_path = path_mod.join(process.cwd(),".cortex","latest-success");
        var latest_success_path,md5_origin_path,md5_origin;

        if(fs.existsSync(latest_success_define_path)){
            latest_success_path = fs.readFileSync(latest_success_define_path,"utf8");
            console.log("latest_success_path is" ,latest_success_path);

            md5_origin_path = path_mod.join(process.cwd(),".cortex",latest_success_path,".cortex","md5-origin.json");
            console.log("md5_origin_path",md5_origin_path);
            md5_origin = JSON.parse(
                fs.readFileSync(md5_origin_path)
            );
        }else{
            console.log("无法获取",latest_success_define_path);
            md5_origin = {};
        }
        return md5_origin;
    },

    setup:function(done){
        this.root = this.env.build_dir;
        this.project_base = path_mod.join(__dirname,"..","..");
        done();
    },

    run:function(done){
        var self = this,
            root = self.root;
        
        var tasks = [];


        var md5_origin = self._get_md5_origin();

        fsMore.traverseDir(root, function(info){
            var relpath = info.relPath,
                parsed,
                css_in_file_list;

            if(info.isFile && self._isJs(relpath) && self._isNotMin(relpath)){
                tasks.push(function(done){
                    var dir = path_mod.join(self.project_base,'tool','closure','compiler.jar');
                        path = info.fullPath,
                        minpath = self._makeMinPath(path);

                    var command = "java -jar " + dir + " --compilation_level SIMPLE_OPTIMIZATIONS --charset UTF-8 --js " + path + " --js_output_file " + minpath;

                    var content = fs.readFileSync(path);
                    if(md5(content) == md5_origin["/" + relpath]){
                        console.log("/" + relpath,"未改动，跳过");
                        done();

                    }else{
                        child_process.exec(command,function(err){
                            if(err){
                                done(err);
                                return;
                            }else{
                                console.log("已压缩js文件",path,"至",minpath);
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
		console.log("js压缩处理完毕");
        done();
	}
}

module.exports = {
    create:function(config){
        return new ClosureTraverser(config);
    }
};
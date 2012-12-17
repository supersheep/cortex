var fsMore = require("../../util/fs-more"),
    fs = require("fs"),
    fsmore = require("../../util/fs-more"),
    md5 = require("MD5"),
    child_process = require("child_process"),
    path = require("path"),
	path_mod = require("path");


/*
var base_dir = path_mod.join(__dirname,'..','res'), // 准备分析的目录
	root = path_mod.join(__dirname,'..',config.root_NAME); // 暂存文件夹
 */

function generateMd5Path(fullpath,md5code){
    console.log("fullpath",fullpath);
    var extname = path.extname(fullpath),
        dirname = path.dirname(fullpath),
        basename = path.basename(fullpath,extname);

    var md5path = dirname+path.sep+basename+"."+md5code+extname;

    return md5path;
}

module.exports = {
    _notInCortex:function(path){
        return path.indexOf(".cortex") != 0;
    },
    setup:function(done){
        this.root = this.env.build_dir; //config.cwd;
        this.data = {};
        done();
    },

    run:function(done){
        var self = this;
        fsMore.traverseDir(this.root, function(info){
            var relpath = info.relPath,
                md5code,md5path,fullpath,
                content;

            if(info.isFile && self._notInCortex(relpath)){
                content = fs.readFileSync(info.fullPath);
                fullpath = info.fullPath;
                md5code = md5(content);
                md5path = generateMd5Path(fullpath,md5code);
                fsmore.copyFileSync(fullpath,md5path,{encoding:"binary"});
                self.data["/" + relpath] = md5code;
            }

        });

        fsMore.writeFileSync(path.join(this.root,".cortex","md5.json"),JSON.stringify(this.data,null,2));

        done();
    },

    tearDown:function(done){
        console.log("md5散列完毕");
        done();
    }

}

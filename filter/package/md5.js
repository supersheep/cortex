var fsMore = require("../../util/fs-more"),
    fs = require("fs"),
    md5 = require("MD5"),
    child_process = require("child_process"),
    path = require("path");
    


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
                md5code,fullpath,
                content;

            if(info.isFile && self._notInCortex(relpath)){
                content = fs.readFileSync(info.fullPath);
                fullpath = info.fullPath;
                md5code = md5(content);
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

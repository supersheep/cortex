var fsMore = require("../../util/fs-more"),
    lang = require("../../util/lang"),
    fs = require("fs"),
    path = require("path");
    


module.exports = {
    _notInCortex:function(path){
        return path.indexOf(".cortex") != 0;
    },
    _withMin:function(path){
        return /\.min/.test(path);
    },
    _notMapFile:function(path){
        return !/\.map$/.test(path);
    },
    _addMd5:function(relpath){
        var extname = path.extname(relpath),
            dirname = path.dirname(relpath),
            basename = path.basename(relpath,extname),
            md5code = this.md5list["/"+relpath];

        var md5path = dirname+path.sep+basename+"."+md5code+extname;

        return md5path;
    },
    writeMinFile:function(info){
        var md5list = this.md5list,
            relpath = info.relPath,
            fullpath = info.fullPath,
            ext = path.extname(relpath),
            meta = {
                "name":path.basename(relpath,ext),
                "ext":ext,
                "md5":md5list['/'+relpath],
                "fullpath":fullpath
            };

        var content = fs.readFileSync(fullpath);
        fs.writeFileSync(fullpath,content + lang.sub("//@ sourceMappingURL={name}{ext}.{md5}.map",meta));
    },
    writeMapFile:function(info){
        var md5list = this.md5list,
            relpath = info.relPath,
            fullpath = info.fullPath,
            md5 = md5list['/'+relpath],
            map,
            mapfilepath = fullpath + ".map";

        if(fs.existsSync(mapfilepath)){
            map = JSON.parse(fs.readFileSync(mapfilepath));
            map.sources = [path.basename(this._addMd5(relpath.replace(".min","")))]; // 这里日后还要支持多文件，嗯
            map.file = path.basename(this._addMd5(relpath));
            fs.writeFileSync(mapfilepath,JSON.stringify(map));
        }
    },
    setup:function(done){
        done();
    },
    run:function(done){
        var self = this,
            root = self.env.build_dir, //config.cwd;
            md5file = path.join(root,".cortex","md5.json"),
            md5list;


        console.log("添加sourcemap映射");
        self.md5list = JSON.parse(fs.readFileSync(md5file));

        fsMore.traverseDir(root, function(info){
            var relpath = info.relPath;
            if( info.isFile 
                && self._notInCortex(relpath) 
                && self._withMin(relpath)
                && self._notMapFile(relpath)){

                self.writeMinFile(info);
                self.writeMapFile(info);
            }
        });

        done();
    },

    DESCRIBE:"将md5映射写入文件"
}

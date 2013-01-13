var fsMore = require("../../util/fs-more"),
    fs = require("fs"),
    md5 = require("MD5"),
    child_process = require("child_process"),
    path = require("path");
    
function Dest(opt){
    this.options = opt
}
    
Dest.prototype = {
    run:function(done){
        var destDir = this.options.dest;
        if(destDir){
            console.log("正在将文件发布到"+destDir);
            fsMore.copyDirSync(this.env.build_dir,destDir);
            console.log("本地发布完毕");
        }
        done();
    }
}
module.exports = {
    create:function(opt){
        return new Dest(opt);
    },
    DESCRIBE:"将文件发布到package.dev.json中指定的dest目录，不建议在dev之外的环境使用"
}

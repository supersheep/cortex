var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            nomin:true,
            command:["cp {path} {path}tmp & jpegtran -copy none -optimize -outfile {path} {path}tmp & rm -f {path}tmp",
            ext:["jpg","jpeg"],
            messages:{
                "end":"jpg压缩处理完毕",
                "compressed":"已压缩jpg文件{path}"
            }
        });
    }
};
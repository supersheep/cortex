var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            nomin:true,
            command:["gifsicle -b -O3 {path}"],
            ext:["gif"],
            messages:{
                "end":"gif压缩处理完毕",
                "compressed":"已压缩gif文件{path}"
            }
        });
    }
};
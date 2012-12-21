var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            nomin:true,
            path:"pngout-"+process.platform,
            command:"{dir} -y {path} {path}",
            ext:["png"],
            messages:{
                "end":"png压缩处理完毕",
                "compressed":"已压缩png文件{path}"
            }
        });
    }
};
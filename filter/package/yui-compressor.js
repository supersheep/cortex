var CompressBase = require("./compress-base");


module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            path:"yui-compressor/yuicompressor-2.4.7.jar",
            command:"java -jar {dir} --charset UTF-8 {path} -o {minpath}",
            ext:["css"],
            messages:{
                "end":"css压缩处理完毕",
                "compressed":"已压缩css文件{path}至{minpath}"
            }
        });
    }
};
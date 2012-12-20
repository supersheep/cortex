var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            path:"closure/compiler.jar",
            command:"java -jar {dir} --compilation_level SIMPLE_OPTIMIZATIONS --charset UTF-8 --js {path} --js_output_file {minpath}",
            ext:["js"],
            messages:{
                "end":"js压缩处理完毕",
                "compressed":"已压缩js文件{path}至{minpath}"
            }
        });
    }
};
var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            throwError:true,
            path:"closure/compiler.jar",
            command:"java -jar {dir} --compilation_level SIMPLE_OPTIMIZATIONS --charset UTF-8 --js {path} --js_output_file {minpath}",
            ext:["js"]
        });
    },
    DESCRIBE:"使用google closure压缩js文件"
};

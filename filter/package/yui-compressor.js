var CompressBase = require("./compress-base");


module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            throwError:true,
            path:"yui-compressor/yuicompressor-2.4.7.jar",
            command:"java -jar {dir} --charset UTF-8 {path} -o {minpath}",
            ext:["css"]
        });
    },
    DESCRIBE:"使用yui压缩css文件"
};

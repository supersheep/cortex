var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            nomin:true,
            path:"pngout-"+process.platform,
            command:"{dir} -y {path} {path}",
            ext:["png"]
        });
    },
    DESCRIBE:"使用pngout压缩png图片文件"
};

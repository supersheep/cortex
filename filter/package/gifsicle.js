var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            nomin:true,
            command:["gifsicle -b -O3 {path}"],
            ext:["gif"]
        });
    },
    DESCRIBE:"使用gifsicle压缩gif图片文"
};

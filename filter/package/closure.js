var CompressBase = require("./compress-base");

module.exports = {
    create:function(config){
        return new CompressBase({
            config:config,
            throwError:true,
            path:"closure/compiler.jar",
            command:"cd {dirname} && java -jar {dir} --compilation_level SIMPLE_OPTIMIZATIONS --charset UTF-8 --js {filename}.js --js_output_file {filename}.min.js --create_source_map {filename}.js.map && cd {root}",
            ext:["js"]
        });
    }
};
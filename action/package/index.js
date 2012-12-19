var 

ActionFactory = require("../../lib/action-factory"),
ConfigHandler = require("../../lib/config-handler"),
main = require("./main"),
path = require("path"),
Package = ActionFactory.create("package");


Package.AVAILIABLE_OPTIONS = {
    filters:{
        alias: ["-f", "--filters"],
        length:1,
        description: "指定打包所使用的过滤器。可选过滤器包括：update, publish-imitate, css, js, yui-compressor, closure, md5, md5-diff。"
    },
    
    branch: {
        alias: ["-b", "--branch"],
        length: 1,
        description: "指定项目分支。该参数仅对 Git 项目生效。"
    },
    
    cwd: {
        alias: ["-c", "--cwd"],
        length: 1,
        description: "指定需要打包的项目的目录。若这个参数没有指定目录或者该参数的值为 `.`，则 Cortex 会使用当前工作目录"
    },
    
    remote: {
        alias: ["-r", "--remote"],
        length: 1,
        description: "指定项目的远程地址。该参数仅对 Git 项目生效。"
    },

    lionaddr:{
        alias:["-l","--lion"],
        length:1,
        descroption:"指定lion配置读取服务的pattern地址。"
    },
    
    env: {
        alias: ["-e", "--env"],
        length: 1,
        required: true,
        description: "指定发布的环境（必须指定）。对一个名为 <config>.json 的配置文件，cortex 会尝试读取 <config>.<env>.json 的文件。该文件的优先级较低，若出现同名参数，可能会被显式指定的参数覆盖。对于点评来说，可选的值包括 'alpha', 'qa'(beta), 'product'"
    }
};


Package.prototype.run = function() {
    var options = this.options,
        cwd = options.cwd;
        
    // always generate an absolute dir
    if(cwd){
        // if is relative directory
        if(cwd.indexOf('..') === 0 || cwd.indexOf('.') === 0){
            cwd = path.join(process.cwd(), cwd);
        }
    
    // if no root specified, use current working directory
    }else{
        cwd = process.cwd();
    }
    
    options.cwd = cwd;
    
    new ConfigHandler({
        file: '.cortex/package.json',
        cwd: cwd,
        env: options.env,
        excludes: ['cwd', 'remote', 'env']
    
    }).getConf(options);

    main(options);
};


Package.MESSAGE = {
    USAGE: "usage: ctx package <root> [options]\n例:usage: ctx package -f publish-imitate,css,js",
    DESCRIBE: "从指定目录打包静态文件"
};


module.exports = Package;
var

/**
 regular expression for ftp uri

/
    ^
    ftp:\/\/
    (?:
        # 1: user 
        ([^:]+)
        :
        # 2: password
        ([^@]+)?
        @
    )?
    # 3: ip
    (
        (?:(?:2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}
        (?:2[0-4]\d|25[0-5]|[01]?\d\d?)
    )
    (?:
        : 
        # 4: port
        ([0-9]{2,5})
    )?
    
    # 5: dir
    (\/.*)?
    
    $
/i

*/

REGEX_MATCHER_FTP_URI = /^ftp:\/\/(?:([^:]+):([^@]+)@)?((?:(?:2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(?:2[0-4]\d|25[0-5]|[01]?\d\d?))(?::([0-9]{2,5}))?(\/.*)?$/i,

CORTEX_INFO_DIR = '.cortex/',

fs = require('fs'),
fsmore = require('../../util/fs-more'),
path = require('path'),
lang = require('../../util/lang'),
ActionFactory = require('../../lib/action-factory'),
ConfigHandler = require('../../lib/config-handler'),
main = require('./main'),

Upload = ActionFactory.create("upload");


Upload.AVAILIABLE_OPTIONS = {
    from: {
        alias: ["-d", "--from"],
        length: 1,
        description: "需要上传的文件目录。若为远程目录，则格式为 ftp://[<user>:<password>@]<ip>[:<port>][/<dir>]; 若为本地目录，则可使用本地目录的路径"
    },
    
    to: {
        alias: ["-t", "--to"],
        length: 1,
        description: "文件包需要上传到的远程目录。格式为 ftp://[<user>:<password>@]<ip>[:<port>][/<dir>]; 也可指定为本地目录。"
    },
    
    env: {
        alias: ["-e", "--env"],
        length: 1,
        required: true,
        description: "指定发布的环境（可选）。对一个名为 <config>.json 的配置文件，cortex 会尝试读取 <config>.<env>.json 的文件。对于点评来说，可选的参数有 'alpha', 'qa'(beta), 'product'(product)。"
    },
    
    cwd: {
        alias: ["-c", "--cwd"],
        length: 1,
        description: "指定需要发布的项目路径。会尝试获取项目配置中的 .cortex/<env>-latest-pack，这种情况会覆盖 --from 参数; 若该文件不存在，则发布会中止;"
    },
    
    uploadCtx:{
        alias: ["-x","--ctx"],
        length:0,
        description:"指定是否需要上传.cortex文件夹，默认不需要，当需要将打包的结果上传至包仓库ftp，以供后续操作时，需要将其开启"
    },

    filters: {
        alias: ["-f", "--filters"],
        length: 1,
        description: "filter"
    }
};


lang.mix(Upload.prototype, {
    _parseOptions: function(){
        var
        o = this.options,
        
        ch = new ConfigHandler({
            /**
             {
                "ftpConf": {
                    "<ip>": {
                        "port": "<port>",
                        "user": "<username>",
                        "password": "<password>"
                    },
                    
                    "<ip2>": {
                    }
                },
                
                "extra": {
                    "libFolders": ["lib/1.0/", "s/j/app/", "b/js/lib/", "b/js/app/", "t/jsnew/app/"]
                }
             }
             */
            file: '.cortex/upload.json',
            env: o.env,
            cwd: o.cwd,
            excludes: ['from', 'env']
            
        });
        
        ch.getConf(o);    
        
        
        var 
        
        latest_pack_file, latest_pack,
        cwd = o.cwd;    
        
        // if cwd is defined
        if(cwd){
            if(cwd.indexOf('..') === 0 || cwd.indexOf('.') === 0){
                cwd = path.join(process.cwd(), cwd);
            }
        
            o.cwd = cwd = fsmore.stdPath(cwd);
        
            latest_pack_file = path.join(cwd, CORTEX_INFO_DIR, o.env + '-latest-pack');
        
            if(!fs.existsSync(latest_pack_file)){
                throw "没有发现任何打包文件，请检查您的操作";
            }
            
            latest_pack = fs.readFileSync(latest_pack_file).toString();
            
            o.from = path.join(cwd, CORTEX_INFO_DIR, latest_pack);
        }
        
        this.conf = ch.getConf({ftpConf: {}});
        
        o.fromFTP = this._parseFTPUri(o.from);
        o.toFTP = this._parseFTPUri(o.to);
    },
    
    _printLog: function(){ 
        var
        
        o = this.options;
        
        console.log('origin dir: ' + (o.fromFTP ? 'remote ' + o.fromFTP.host + o.fromFTP.dir : 'local' + o.from) );
        console.log('target dir: ' + (o.toFTP ? 'remote ' + o.toFTP.host + o.toFTP.dir : 'local' + o.to) );
    },
    
    // merge global ftp authorization
    _mergeFTPConf: function(ftp){
        var ftp_conf = this.conf.ftpConf[ftp.host];
    
        return ftp_conf ? lang.mix(ftp, ftp_conf, false) : ftp;
    },
    
    // ftp://[<user>:<password>@]<ip>[:<port>][/<dir>]
    // ->
    _parseFTPUri: function(uri){
        var 
        
        m = uri.match(REGEX_MATCHER_FTP_URI),
        parsed,
        k;
        
        if(!!m){
            parsed = {
                user: m[1],
                password: m[2],
                host: m[3],
                port: m[4],
                dir: m[5]
            };
            
            for(k in parsed){
                if(!parsed[k]){
                    delete parsed[k];
                }
            }
            
            parsed = this._mergeFTPConf(parsed);
        }
        
        return parsed;
    },
    
    run: function(callback) {
        this._parseOptions();
        this._printLog();
        
        main(this.options);
    }
    
});


Upload.MESSAGE = {
    USAGE   : "usage: ctx upload [options]",
    DESCRIBE: "将本地项目目录上传并更新数据库"
};

// demo: ctx upload -h spud.in -u spudin -p ppp -d /Users/spud/Git/cortex/build/build-1351144024172 -r blah



module.exports = Upload;
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
        description: "指定发布的环境（可选）。对一个名为 <config>.json 的配置文件，cortex 会尝试读取 <config>.<env>.json 的文件。对于点评来说，可选的参数有 'alpha', 'qa'(beta), 'pro'(product)。"
    },
    
    filters: {
        alias: ["-f", "-filter"],
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
            env: o.env
            
        });
        
        this.conf = ch.getConf({ftpConf: {}});
        
        o.fromFTP = this._parseFTPUri(o.from);
        o.toFTP = this._parseFTPUri(o.to);
        
        ch.getConf(o);
    },
    
    _printLog: function(){ 
        var
        
        o = this.options;
        
        console.log('origin dir: ', (o.fromFTP ? 'remote' : 'local'), o.fromFTP.host + o.fromFTP.dir);
        console.log('target dir: ', (o.toFTP ? 'remote' : 'local'), o.toFTP.host + o.toFTP.dir);
    },
    
    // merge global ftp authorization
    _mergeFTPConf: function(ftp){
        var ftp_conf = this.conf.ftpConf[ftp.host];
    
        return ftp_conf ? lang.mix(ftp, ftp_conf, false) : ftp;
    },
    
    // ftp://[<user>:<password>@]<ip>[:<port>][/<dir>]
    // ->
    _parseFTPUri: function(uri){
        var m = uri.match(REGEX_MATCHER_FTP_URI);
        
        return !!m ? this._mergeFTPConf({
            user: m[1],
            password: m[2],
            host: m[3],
            port: m[4],
            dir: m[5]
            
        }) : false
    },
    
    run: function(callback) {
        this._parseOptions();
        
        this._printLog();
        
        main(this.options);
    }
    
});


Upload.MESSAGE = {
    USAGE   : "usage: ctx upload",
    DESCRIBE: "将本地项目目录上传并更新数据库"
};

// demo: ctx upload -h spud.in -u spudin -p ppp -d /Users/spud/Git/cortex/build/build-1351144024172 -r blah



module.exports = Upload;
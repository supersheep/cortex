/**
 
 
 
 */

var

SUCCESS_LOCK_FILE = 'success.lock',
MD5_FILE = 'md5.json',
CONFIG_DIR = '.cortex',

fs = require('fs'),
fsmore = require('../../../util/fs-more'),
tracer = require("tracer").colorConsole(),
path = require('path'),


lang = require('../../../util/lang'),

extra = require('./promise-success');


/**
 * @param {Object} params {
    project_root: {string}
 }
 */
function Diff(options){
    this.cwd = options.cwd;
    this.options = options;
};


Diff.prototype = {
    
    /**
     * @param {function()} callback will be executed when completed
     */
    run: function(callback){
        this._prepareData();
    
        var
        
        pathname,
        cur_md5, last_md5;
        
        try{
            pathname = path.join(this.cur_build_root, CONFIG_DIR, MD5_FILE);
            cur_md5 = require( fsmore.stdPath(pathname) );
        
        }catch(e){
            console.log(e);
            tracer.error( '分析 ' + pathname + '时出错，请检查你的代码' );
            throw 'error!';
        }
        
        if(this.last_build_root){
            pathname = path.join(this.last_build_root, CONFIG_DIR, MD5_FILE);
            if(fs.existsSync(pathname)){
                try{
                    last_md5 = JSON.parse( fs.readFileSync(pathname) );
                }catch(e){
                    last_md5 = null;
                }
            }
        }
        
        var
        
        diff = this._diff(cur_md5, last_md5 || {});
        
        this._writeList(diff);
        
        callback();
    },
    
    _diff: function(list, rel_list){
        var url,
            result = {};
        
        for(url in list){
            if(list[url] !== rel_list[url]){
                result[url] = list[url];
            }
        }
        
        return result;
    },
    
    _writeList: function(list){
        fs.writeFileSync( path.join(this.cur_build_root, CONFIG_DIR, 'filelist.json' ), JSON.stringify(list, null, 2));
        fs.writeFileSync( path.join(this.cur_build_root, CONFIG_DIR, 'filelist.txt' ), Object.keys(list).join('\n') );
    },
    
    _prepareData: function(){
        var
        
        config_dir = path.join(this.cwd, CONFIG_DIR),
        
        latest_pack = fs.readFileSync( path.join(config_dir, this.options.env + '-latest-pack')).toString(),
        success_pack = this._getLastSuccessBuild();
        
        if(!success_pack){
            console.log('没有发现上一个成功的打包');
        }
        
        this.cur_build_root = path.join(config_dir, latest_pack);
        
        this.last_build_root = !!success_pack ? path.join(config_dir, success_pack) : false;
        
    }
};


lang.mix(Diff.prototype, extra);


module.exports = {
    
    // factory
    create: function(params){
        return new Diff(params);
    }
};
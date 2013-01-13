/**

pubish: {
    dirs: [
        {
            dir: 'lib/',
            // to:  'lib/1.0/'
        },
        
        {
            dir: 'app/',
            to:  's/j/app/index'
        }
    ]
}

 */

var

fs = require('fs'),
tracer = require("tracer").colorConsole(),
fsmore = require('../../util/fs-more'),
lang = require('../../util/lang'),
path = require('path'),
CORTEX_DIR = '.cortex',
CONFIG_FILE = 'publish.json';
 
function PrePublish(options){
    this.options = options;
};


PrePublish.prototype = {
    run: function(callback){
        console.log('预打包开始...');
    
        var 
        
        self = this,
        
        build_dirs = this._getBuildDir(),
        build_dir = build_dirs.full,
        build_rel_dir = build_dirs.rel;
        
        this._writePackLog(build_rel_dir);
        
        this.env.build_dir = build_dir;
        console.log('CORTEX BUILD_DIR ' + path.join(build_dir));
        
        (this.options.dirs || []).forEach(function(dir_setting){
            var 
            
            dir = dir_setting.dir,
            to = dir_setting.to || dir;
            
            console.log('正在将 ' + path.join(self.options.cwd, dir) + ' 目录复制到 ' + path.join(build_dir, to));
            
            fsmore.copyDirSync(
                path.join(self.options.cwd, dir),
                path.join(build_dir, to),
                {encoding: 'binary'}
            );
        });
        
        callback();
    },
    
    _writePackLog: function(build_rel_dir){
        var
        cortex_dir = path.join(this.options.cwd, CORTEX_DIR),
        pack_dir = path.join(cortex_dir, this.options.env + '-pack'),
        pack_date = 'pack-' + lang.dateString();
    
        fs.writeFileSync(path.join(cortex_dir, this.options.env + '-latest-pack'), build_rel_dir );
        
        fsmore.mkdirSync(pack_dir);
        
        var
        fd = fs.openSync(path.join(pack_dir, pack_date), 'a+');
        fs.writeSync(fd, build_rel_dir + '\n');
        fs.closeSync(fd);
    },


    _getBuildDir: function(){
        var rel_dir = 'build-' + (+ new Date);
    
        return {
            full: path.join(this.options.cwd, CORTEX_DIR, 'build', rel_dir),
            rel: path.join('build', rel_dir)
        };
    }
};


exports.create = function(options){
    return new PrePublish(options);
};

exports.DESCRIBE = "按package.json中dir的配置将文件调整路径复制到打包目录下"

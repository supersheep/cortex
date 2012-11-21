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
    ],
    
    // build_directory: 'build/'
}

 */

var

fs = require('fs'),
tracer = require("tracer").colorConsole(),
fs_more = require('../../util/fs-more'),
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
        
        build_dirs = this._getBuildDir()
        build_dir = build_dirs.full,
        build_rel_dir = build_dirs.rel;
        
        fs.writeFileSync(path.join(this.cwd, CORTEX_DIR, this.options.env + '-latest-pack'), path.join('build', build_rel_dir));
        
        this.env.build_dir = build_dir;
        
        console.log('CORTEX BUILD_DIR ' + path.join(this.options.cwd, build_dir));
        
        (this.options.dirs || []).forEach(function(dir_setting){
            var 
            
            dir = dir_setting.dir,
            to = dir_setting.to || dir;
            
            console.log('正在将 ' + path.join(self.cwd, dir) + ' 目录复制到 ' + path.join(build_dir, to));
            
            fs_more.copyDirSync(
                path.join(self.cwd, dir),
                path.join(build_dir, to)
            );
        });
        
        callback();
    },

    _getBuildDir: function(){
        var rel_dir = 'build-' + (+ new Date);
    
        return {
            full: path.join(this.cwd, CORTEX_DIR, 'build', rel_dir),
            rel: rel_dir
        };
    }
};


exports.create = function(options){
    return new PrePublish(options);
};


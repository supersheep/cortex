var

CORTEX_DIR = '.cortex',
path = require('path'),
fs = require('fs'),
fsmore = require('../../../util/fs-more'),
lang = require('../../../util/lang');




exports._getLastSuccessBuild = function(){
    var
    
    miniseconds_per_day = 24 * 60 * 60 * 1000,
    pack_today = 'pack-' + lang.dateString(),
    pack_dir = path.join(this.options.cwd, CORTEX_DIR, this.options.env + '-pack'),
    
    pack_files = fs.readdirSync(pack_dir).filter(function(date){
        return date !== pack_today && date.indexOf('pack-') === 0 && fsmore.isFile(path.join(pack_dir, date));
        
    }).sort();
    
    return pack_files.length ? 
            fs.readFileSync( path.join(pack_dir, pack_files.pop()) ).toString().split('\n').filter(function(dir){
                return !!dir;
                
            }).pop()
        
        :   null;
};
var

fs = require('fs'),
path = require('path'),

REGEX_REPLACE_FILENAME = /[^\/]+$/,
REGEX_MATCH_FILENAME_EXT = /([^\/]+?)(\.[^\/]+)?$/;


/**
 * @param {string} path
 * @param {string|buffer} content
 */
function writeFileSync(pathname, content){
    if(!REGEX_REPLACE_FILENAME.test(path)){
        return false;
    }
    
    var dir = pathname.replace(REGEX_REPLACE_FILENAME, '');
    
    mkdirSync(dir);
    
    var fd = fs.openSync(pathname, 'w+');
    
    fs.writeSync(fd, content);
    fs.closeSync(fd);
};


function emptyDirSync(root){
    traverseDir(root, function(info){
        info.isFile ? fs.unlinkSync(info.fullPath) : fs.rmdirSync(info.fullPath);
    }, true);
};


/**
 * unlike fs.mkdirSync, fs-more.mkdirSync will act as `mkdir -p`
 */
function mkdirSync(dir){
    var SPLITTER = sep,
        split = dir.split(SPLITTER),
        directory_stack = [],
        tester;
        
    while(split.length){
        tester = split.join(SPLITTER);
    
        if(!isDirectory(tester)){
            directory_stack.push(split.pop());
        }else{
            break;
        }
    }
    
    dir = tester;
    
    while(directory_stack.length){
        fs.mkdirSync(dir = path.join(dir, directory_stack.pop()));
    }
};


/**
 * @param {string} root
 * @param {function(file_data)} callback
    file_data {Object}{
        fullPath: {string} full dir path
        relPath: {string} path relative to the root
        path: {string}
        isFile: {boolean=} true if the current item is a normal file
        isDirectory: {boolean=} true if the current item is a directory
    }

 * @param {Object} options {
    upwards: {boolean=} default to downwards
    rel: {string=} default to ''
  }
 */
function traverseDir(root, callback, options){
    options || (options = {});

    var dir_content = fs.readdirSync(root),
        rel = options.rel || '',
        upwards = options.upwards;
    
    dir_content.forEach(function(current){
        var full_path = path.join(root, current),
            stat = fs.statSync(full_path);
            
        if(stat.isFile()){
            callback({
                path: current,
                fullPath: full_path,
                relPath: rel + current,
                isFile: true
            });
            
        }else if(stat.isDirectory()){
            var
            
            param = {
                path: current,
                fullPath: full_path,
                relPath: rel + current,
                isDirectory: true
            };
        
            !upwards && callback(param);
            traverseDir(full_path, callback, {
                rel: path.join(rel, current),
                upwards: upwards
            });
            
            upwards && callback(param);
        }
    });
};





/**
 * @param {Object} options {
    crop: {boolean=false}
    file_mode: {string}
        'replace': default, replace file
        'both': keep both file if destination already exists, alien file will be saved as <filename> (count).<ext>
        
    dir_mode: {string=merge}
        'merge': default, will merge the directory to the destination folder
        'replace': will replace old folder
 }
 */
function copyDirSync(resource, destination, options){
    if(options.dir_mode === 'replace'){
        emptyDirSync(destination);
    }

    traverseDir(resource, function(info){
        if(info.isFile){
            var
            
            rel_path = info.relPath;
        
            copyFileSync(path.join(resource, info.path), path.join(destination, info.path))
        }
    });
};

/**
 * @param {Object} options {
    mode: {string}
        'replace': default
        'both':
 }
 */
function copyFileSync(resource, destination, options){
    var is_success = false,
        fd,
        content;
        
    if(isFile(resource)){
        if(options.mode === 'both'){
            destination = getUnconflictFilePathName(destination);
        }
        content = fs.readFileSync(resource);
        
        writeFileSync(destination, content);
        
        is_success = true;
    }
    
    return is_success;
};


/**
 * /path/to/abc.txt -> exists!
 * /path/to/abc (1).txt -> exists!
 * -> /path/to/abc (2).txt
 */
function getUnconflictFilePathName(pathname){
    function full_path(){
        return pathname_noext + (count ? ' (' + count + ')' : '') + ext;
    };
    
    var 
    
    match = pathname.match(REGEX_MATCH_FILENAME_EXT),
    pathname_noext = match[1],
    count = 0,
    ext = match[2] || '';
    
    while(isFile(full_path())){
        count ++;
    }
    
    return full_path();
};


function isFile(file){
    return fs.existsSync(file) && fs.statSync(file).isFile();
};


function isDirectory(file){
    return fs.existsSync(file) && fs.statSync(file).isDirectory();
}; 


module.exports = {
    copyFileSync    : copyFileSync,
    copyDirSync     : copyDirSync,
    writeFileSync   : writeFileSync,
    traverseDir     : traverseDir,
    emptyDirSync    : emptyDirSync,
    mkdirSync       : mkdirSync,
    isFile          : isFile,
    isDirectory     : isDirectory
};


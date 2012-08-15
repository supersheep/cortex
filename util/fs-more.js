var

fs = require('fs'),

REGEX_REPLACE_FILENAME = /\/[^\/]+$/;


function moveFileSync(path, fromDir, toDir){
    var resource = fromDir + '/' + path,
        destination = toDir + '/' + path,
        is_success = false,
        fd,
        content;
        
    if(isFile(resource)){
        fd = fs.openSync(destination, 'w+');
        content = fs.readFileSync(resource);
        
        fs.writeSync(fd, content);
    }
    
    return is_success;
};


/**
 * @param {string} path
 * @param {string|buffer} content
 */
function writeFileSync(path, content){
    if(!REGEX_REPLACE_FILENAME.test(path)){
        return false;
    }
    
    var dir = path.replace(REGEX_REPLACE_FILENAME, '');
    
    mkdirSync(dir);
    
    var fd = fs.openSync(path, 'w+');
    
    fs.writeSync(fd, content);
};


function emptyDir(root){
    traverseDir(root, function(info){
        info.isFile ? fs.unlinkSync(info.fullPath) : fs.rmdirSync(info.fullPath);
    });
};


/**
 * unlike fs.mkdirSync, fs-more.mkdirSync will act as `mkdir -p`
 */
function mkdirSync(dir){
    var split = dir.split('/'),
        directory_stack = [],
        tester;
        
    while(split.length){
        tester = split.join('/');
    
        if(!isDirectory(tester)){
            directory_stack.push(split.pop());
        }else{
            break;
        }
    }
    
    dir = tester;
    
    while(directory_stack.length){
        fs.mkdirSync(dir = dir + '/' + directory_stack.pop());
    }
};


/**
 * @param {string} root
 * @param {function(file_data)} callback
 */
function traverseDir(root, callback){
    var dir_content = fs.readdirSync(root);
    
    dir_content.forEach(function(file){
        var full_path = root + '/' + file,
            stat = fs.statSync(full_path);
            
        if(stat.isFile()){
            callback({
                path: file,
                fullPath: full_path,
                isFile: true
            });
            
        }else if(stat.isDirectory()){
            traverser(full_path, callback);
            callback({
                path: file,
                fullPath: full_path,
                isDirectory: true
            });
        }
    });
};


function isFile(file){
    return fs.existsSync(file) && fs.statSync(file).isFile();
};


function isDirectory(file){
    return fs.existsSync(file) && fs.statSync(file).isDirectory();
}; 


module.exports = {
    moveFileSync    : moveFileSync,
    writeFileSync   : writeFileSync,
    traverseDir     : traverseDir,
    emptyDir        : emptyDir,
    mkdirSync       : mkdirSync,
    isFile          : isFile,
    isDirectory     : isDirectory
};


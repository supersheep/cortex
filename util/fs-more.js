var

fs = require('fs'),


function moveFileSync(path, fromDir, toDir){
    var resource = fromDir + '/' + path,
        destination = toDir + '/' + path,
        is_success = false,
        fd,
        content;
        
    if(fs.existsSync(resource)){
        fd = fs.openSync(destination, 'w+');
        content = fs.readFileSync(resource);
        
        fs.writeSync(fd, content);
    }
    
    return is_success;
};


function writeFileSync(path, content){
    var fd = fs.openSync(path, 'w+');
    
    fs.writeSync(fd, content);
};


function emptyDir(root){
    traverseDir(root, function(info){
        info.isFile ? fs.unlinkSync(info.fullPath) : fs.rmdirSync(info.fullPath);
    });
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


module.exports = {
    moveFileSync    : moveFileSync,
    writeFileSync   : writeFileSync,
    traverseDir     : traverseDir,
    emptyDir        : emptyDir
};
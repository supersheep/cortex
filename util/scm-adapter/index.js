var

fs_more = require('../fs-more'),
path = require('path'),

SCM_METHODS = {
    git: require('./git'),
    // tfs: require('./tfs'),
    svn: require('./svn')
};


function SCM(options){
    this.cwd = options.cwd;
    
    var type;
    
    if(fs_more.isDirectory( path.join(this.cwd, '.git/') )){
        type = 'git'
    
    }else if(fs_more.isDirectory( path.join(this.cwd, '.svn/') )){
        type = 'svn'
    
    }else{
        throw 'could not detect scm type of the current project';
    }
    
    this.scm = new SCM_METHODS[type](options);
};


SCM.prototype = {
    pull: function(callback){
        this.scm.pull(callback);
    }
};


module.exports = SCM;
var

fs_more = require('../fs-more'),
tracer = require('tracer').colorConsole(),
path = require('path'),

SCM_METHODS = {
    git: require('./git'),
    // tfs: require('./tfs'),
    svn: require('./svn')
};


function SCM(options){
    this.cwd = options.cwd;
    
    var type;
    
    console.log('开始分析项目源代码管理类型...');
    
    if(fs_more.isDirectory( path.join(this.cwd, '.git/') )){
        type = 'git'
    
    }else if(fs_more.isDirectory( path.join(this.cwd, '.svn/') )){
        type = 'svn'
    
    }else{
        tracer.error('无法分析源代码管理类型，或类型不支持。目前仅支持 Git, SVN, TFS.');
        throw 'error!';
    }
    
    console.log('判断出该项目为 Git 项目.');
    
    this.scm = new SCM_METHODS[type](options);
};


SCM.prototype = {
    pull: function(callback){
        this.scm.pull(callback);
    }
};


module.exports = SCM;
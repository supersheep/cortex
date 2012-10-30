'use strict';

var

spawn = require('./spawn'),
tracer = require('tracer').colorConsole(),
EventProxy = require('../event-proxy');


function Git(params){
    this.cwd = params.cwd;
    this.branch = params.branch;
    this.remote = params.remote;
};


Git.prototype = {
    
    _init: function(){
        this.pull = this._pull;
    
        this.pull(this._pull_cb);
    },
    
    pull: function(callback){
        this._pull_cb = callback;
        this._prepare();
    },

    _pull: function(callback){
    
        if(this.remote){
            spawn('git', ['pull', this.remote, this.branch], {
                cwd: this.cwd
                
            }, function(){
                callback();
            });
        }else{
            callback();
        }
    },
    
    _prepare: function(){
        var
        
        self = this,
        ep = new EventProxy(function(){
            self._init();
        });
        
        
        if(!this.remote){
            ep.assign('remote');
            
            spawn('git', ['remote', '-v'], {
                cwd: this.cwd
                
            }, function(result){
            
                // if there's a remote address called 'origin'
                if(result.length === 0){
                    console.log('该项目不包含 remote 地址，跳过获取代码过程');
                    
                }else if(
                    result.some(function(remote){
                        return remote[0] === 'origin';
                    })
                ){
                    console.log('由于未指定具体的 remote 地址，cortex 接下来会默认使用 remote origin 来获取最新代码');
                    self.remote = 'origin';
                
                // if there's only one remote address, use it
                }else if(result.length === 1){
                    self.remote = result[0][0];
                
                }else{
                
                    // TODO:
                    // test if `throw` will cause an stderr
                    tracer.error(
                        '该项目包含多个远程地址 (git remote -v)，并且没有 remote origin，请为项目添加 remote origin，或者为 cortex 指定 remote 地址'
                    );
                    throw 'error!';
                    return;
                }
                
                ep.trigger('remote');
            });
        }
        
        if(!this.branch && this.remote){
            ep.assign('branch');
            
            spawn('git', ['branch'], {
                cwd: this.cwd
            
            }, function(result){
                
                // if there's a branch address called 'master'
                if(
                    result.some(function(branch){
                        return branch[0] === 'master';
                    })
                ){
                    console.log('由于未指定具体的分支，cortex 接下来会默认使用 master 来获取最新代码');
                    self.branch = 'origin';
                
                // if there's only one branch, use it
                }else if(result.length === 1){
                    self.branch = result[0][0];
                
                }else{
                
                    // TODO:
                    // test if `throw` will cause an stderr
                    tracer.error(
                        '该项目包含多个分支 (git branch)，并且没有 master，请为项目添加 master，或者为 cortex 指定具体的分支名'
                    );
                    throw 'error!';
                    
                    return;
                }
                
                ep.trigger('branch');
            });
        }

    }
}


module.exports = Git;
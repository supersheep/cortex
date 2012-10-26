var

spawn = require('./spawn'),

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
    },

    _pull: function(callback){
        spawn('git', ['pull', this.remote, this.branch], function(){
            callback();
        });
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
                if(
                    result.some(function(remote){
                        return remote[0] === 'origin';
                    })
                ){
                    self.remote = 'origin';
                
                // if there's only one remote address, use it
                }else if(result.length === 1){
                    self.remote = result[0][0];
                
                }else{
                
                    // TODO:
                    // test if `throw` will cause an stderr
                    throw 'there is more than one remote, and no origin, please assign a specific remote';
                    
                    return;
                }
                
                ep.trigger('remote');
            });
        }
        
        if(!this.branch){
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
                    self.branch = 'origin';
                    ep.trigger('branch');
                
                // if there's only one branch, use it
                }else if(result.length === 1){
                    self.branch = result[0][0];
                
                }else{
                
                    // TODO:
                    // test if `throw` will cause an stderr
                    throw 'there is more than one branch, and no master, please assign a specific branch';
                    
                    return;
                }
                
                ep.trigger('branch');
            });
        }

    }
}


module.exports = Git;
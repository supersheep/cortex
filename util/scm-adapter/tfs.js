var

spawn = require('./spawn'),
tracer = require('tracer').colorConsole(),
EventProxy = require('../event-proxy');


function SVN(params){
    this.cwd = params.cwd;
    this.branch = params.branch;
    this.remote = params.remote;
};


SVN.prototype = {
    pull: function(callback){
        spawn('svn', ['update'], {
            cwd: this.cwd
        }, function(){
            callback();
        });
    }
};
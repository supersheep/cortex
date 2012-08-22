var 

type = require('./lang'),

NOOP = function(){};


function EventProxy(callback){
    
    this.callback = callback || NOOP;
    this.atom = {};
    this.queue = [];
    this.count = 0;
};

EventProxy.prototype = {
    assign: function(subject){
        if(type.isNumber(subject)){
            this.count += subject;
            
        }else if(type.isArray(subject)){
            this.queue = this.queue.concat(subject);
            
        }else if(type.isString(subject)){
            this.queue.push(subject);
        }
    },
    
    trigger: function(subject){
        
        if(arguments.length === 0){
            this.count --;
            
        }else if(type.isString(subject)){
            var index = this.queue.indexOf(subject);
            
            if(index !== -1){
                this.queue.splice(index, 1);
            }
        }
        
        this._check();
    },
    
    _check: function(){
        if(this.queue.length === 0 && this.count < 1){
            this.callback();
            this.callback = NOOP;
        }
    }
};


module.exports = EventProxy;
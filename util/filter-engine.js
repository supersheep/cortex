var async = require("async");


// Filters驱动器
function FilterEngine(){
    this.filter_setup = [];
    this.filter_run = [];
    this.filter_tearDown = [];
}
FilterEngine.prototype = {
    assign : function(name,config){
        var Filter = require("../filters/"+name);
        var filter = Filter.create ? Filter.create(config) : Filter;
        var mod = {name:name,filter:filter};


        this.filter_setup.push(mod);
        this.filter_run.push(mod);
        this.filter_tearDown.push(mod);
    },

    start:function(){
        this._run("setup");
    },

    run:function(){
        this._run("run");
    },

    tearDown:function(){
        this._run("tearDown");
    },

    _run:function(step){
        var self = this;

        self["filter_"+step].forEach(function(mod,i){

            var filter = mod.filter;
            /**
             * @type {Object} status {
                     passed: {boolean}
                     msg: {string}
                 }
             */      
            
            if(filter[step]){
                filter[step](function(err){
                    if(err){
                         throw new Error(err);
                     }else{
                         self._done(mod.name,step);
                    }
                });
            }else{
                self._done(mod.name,step);
            }
        });
    },
    _done: function(name,step){

        console.log("filterEngine:%s.%s done",name,step);
        var steps = this["filter_"+step];

        var index = steps.indexOf(name);
        steps.splice(name);
        if(steps.length == 0){
            if(step == "setup"){
                this.run();
            }else if(step == "run"){
                this.tearDown();
            }else if(step == "tearDown"){
                this.allDown();
            }
        }
    },
    
    allDown:function(){
        console.log("所有全部处理完毕");
        process.exit();
    }
}   


module.exports = new FilterEngine;

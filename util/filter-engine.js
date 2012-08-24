var tracer = require("tracer").colorConsole();

// Filters驱动器
function FilterEngine(){
    this.filter_parse = [];
    this.filter_tearDown = [];
}
FilterEngine.prototype = {
    assign : function(name,config){
        var Filter = require("../filters/"+name);
        var filter = new Filter(config);
        var mod = {name:name,filter:filter};
        this.filter_parse.push(mod);
        this.filter_tearDown.push(mod);
    },

    run:function(){
        this._run("parse");
    },

    _tearDown: function(){
        this._run("tearDown");
    },

    _run:function(step){
        var self = this;
        self["filter_"+step].forEach(function(mod){
            var filter = mod.filter;
            /**
             * @type {Object} status {
                     passed: {boolean}
                     msg: {string}
                 }
             */
            filter[step] && filter[step](function(err){
                if(err){
                     throw new Error(err);
                 }else{
                     self._done(mod.name,step);
                }
            });
        });
    },
    _done: function(name,step){

        tracer.info("filterEngine:%s.%s处理完毕",name,step);
        var steps = this["filter_"+step];

        var index = steps.indexOf(name);
        steps.splice(name);
        if(steps.length == 0){
            if(step == "parse"){
                this._tearDown();
            }else if(step == "tearDown"){
                this._allDown();
            }
        }
    },
    
    _check: function(){
        
    },
    
    _allDown:function(){
        tracer.info("所有全部处理完毕");
        process.exit();
    }
}   


module.exports = FilterEngine;


// Filters驱动器
function FilterEngine(){
	this.filters = [];
}
FilterEngine.prototype = {
	assign : function(name,config){
		var Filter = require("../filters/"+name);
		var filter = new Filter(config);
		this.filters.push({name:name,filter:filter});
	},
	run:function(){
		var self = this;
		this.filters.forEach(function(mod){
			var filter = mod.filter;
			
			/**
			 * @type {Object} status {
			         passed: {boolean}
			         msg: {string}
			     }
			 */
			filter.parse && filter.parse(function(err){
    			if(err){
    			     throw new Error(err);
    			 }else{
        			 self.done(mod.name);
    			}
    			
			});
		});
	},
	
	done: function(name){
		console.log("filterEngine:%s done",name);
		var index = this.filters.indexOf(name);
		this.filters.splice(name);
		if(this.filters.length == 0){
			this._teardown();
		}
	},
	
	_check: function(){
	    
	},
	
	_teardown: function(){
		process.exit();
	}
}	


module.exports = FilterEngine;


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
    			     throw error;
    			 }else{
        			 self.done(mod.name);
    			}
    			
			});
		});
	},
	
	done: function(name){
		
	},
	
	_check: function(){
	    
	},
	
	_teardown: function(){
	    
	}
}	


module.exports = FilterEngine;
